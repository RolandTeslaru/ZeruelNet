from google import genai
from google.genai import types
from dotenv import load_dotenv
import base64
import logging
import os
import json
from knowledge import MODEL_KNOWLEDGE

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

load_dotenv()

GEMINI_MODEL_NAME = "gemini-2.5-flash-lite"

VIDEO_ANALYSIS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "summary": {
            "type": "STRING",
            "description": "A brief, neutral, one-paragraph summary of the video's content, covering the main visual and audio elements."
        },
        "identified_subjects": {
            "type": "ARRAY",
            "description": "A list of subjects, people, or concepts discussed or shown in the video.",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "subject": {
                        "type": "STRING",
                        "description": "The name of the identified subject (e.g., 'NATO', 'Vladimir Putin', 'Traditional Values')."
                    },
                    "stance": {
                        "type": "NUMBER",
                        "description": "The video's sentiment towards this subject, on a scale of -1.0 (very negative) to 1.0 (very positive)."
                    }
                },
                "required": ["subject", "stance"]
            }
        },
        "overall_alignment": {
            "type": "NUMBER",
            "description": "An overall score from -1.0 (Pro-Russian/Anti-Western Narrative) to 1.0 (Pro-Western/Anti-Russian Narrative), based on the subjects and stances identified."
        }
    },
    "required": ["summary", "identified_subjects", "overall_alignment"]
}


VIDEO_ANALYSIS_PROMPT_TEMPLATE = """
You are an expert geopolitical analyst specializing in detecting propaganda, disinformation, and nuanced sentiment in short-form video content. Your task is to analyze the provided video's visual and audio components and produce a structured JSON output.

--- EVIDENCE FILE ---

1.  **VIDEO DESCRIPTION (Creator's Intent):**
    "{description}"

2.  **AUDIO TRANSCRIPT (High-Accuracy):**
    "{transcript}"

3.  **INDEPENDENT SENTIMENT ANALYSIS (External Tool):**
    {sentiment}
    *Interpretation: This score indicates the text has an overwhelmingly negative and critical emotional tone.*

--- CORE REASONING PRINCIPLES ---

1.  **HOLISTIC ANALYSIS:** Your final judgment must be based on the totality of the evidence. The creator's description and the overwhelming sentiment score are strong clues to the video's true intent. Use them to interpret the visual and spoken content.

2.  **DETERMINE TRUE INTENT:** Do not always take statements at face value. A speaker's true stance is revealed by the overall context.
    *   **Rhetorical Devices:** Be aware that speakers may use sarcasm or irony to mock an opposing viewpoint. For example, if the sentiment is highly negative, a seemingly positive statement like "Let Russia save us" is likely sarcastic, especially if followed by criticism of Russia.
    *   **Negative Context vs. Stance:** Differentiate between a negative situation and the speaker's stance. A sad tone about war in Ukraine implies a positive (sympathetic) stance towards "Ukraine" and a negative stance towards the "War".

Use the following knowledge base to help identify key entities.
--- KNOWLEDGE BASE START ---
{knowledge_base}
--- KNOWLEDGE BASE END ---

--- ANALYTICAL METHODOLOGY ---

Follow this three-step process precisely:

**Step 1: Summarize**
*   Create a brief, neutral summary of the video's literal content, covering the main visual and audio elements.

**Step 2: Determine Local Stance**
*   Identify all key subjects from the evidence. For each subject, determine the video's specific opinion of it to assign a `stance`.
*   **CRITICAL RULE:** This `stance` score MUST be derived *only* from the video's content (visuals, audio, description). It is a measure of the video's opinion alone. **Do not let the `alignment_tendency` from the knowledge base influence this step in any way.**

**Step 3: Synthesize Overall Alignment**
*   Calculate the final `overall_alignment` score. To do this, you must synthesize the `stance` values from Step 2 with the `alignment_tendency` values from the knowledge base.
    *   **Logic:** The final alignment is a combination of the video's opinion and the subject's known geopolitical position.
    *   **Example 1:** A positive `stance` on a subject with a negative `alignment_tendency` (e.g., praising Putin) results in a negative `overall_alignment`.
    *   **Example 2:** A negative `stance` on a subject with a negative `alignment_tendency` (e.g., criticizing Putin) results in a positive `overall_alignment`.
    *   Weight your calculation based on the strength of the stances and the importance of the subjects.
    
Your output must be a valid JSON object that adheres to the provided schema. Do not include any text, explanations, or formatting outside of the JSON object.
"""

class _GeminiProcessor:
    def __init__(self):
        # Config is set in .env
        self.client = genai.Client()

        self.model_name = GEMINI_MODEL_NAME
        self.generation_config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=VIDEO_ANALYSIS_SCHEMA,
            temperature=0.2,
            top_p=0.95,
            max_output_tokens=8192,
            safety_settings=[
                types.SafetySetting(
                    category="HARM_CATEGORY_HATE_SPEECH",
                    threshold="BLOCK_NONE"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold="BLOCK_NONE"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold="BLOCK_NONE"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_HARASSMENT",
                    threshold="BLOCK_NONE"
                )
            ]
        )

        # Format the knowledge object that then gets passed onto the prompt
        self.knowledge_string = json.dumps(MODEL_KNOWLEDGE, indent=2)


    def analyze(self, video_path: str, transcript: str, sentiment: dict, description: str):
        with open(video_path, "rb") as f:
            video_bytes = f.read()

        video_part = types.Part(
            inline_data=types.Blob(
                mime_type="video/mp4",
                data=video_bytes
            )
        )

        try:
            sentiment_str = json.dumps(sentiment, indent=4)

            final_prompt = VIDEO_ANALYSIS_PROMPT_TEMPLATE.format(
                description=description,
                transcript=transcript,
                sentiment=sentiment_str,
                knowledge_base=self.knowledge_string
            )

            response = self.client.models.generate_content(
                model=self.model_name,
                config=self.generation_config,
                contents=[
                    video_part,
                    final_prompt
                ]
            )
            # Parse the JSON string response into a Python dictionary
            parsed_response = json.loads(response.text)
            # logging.info(json.dumps(parsed_response, indent=2))
            return parsed_response
        except Exception as e:
            logging.error(f"An error occured during Gemini analysis for video {video_path}, error: {e}" )
            return None 


gemini = _GeminiProcessor()