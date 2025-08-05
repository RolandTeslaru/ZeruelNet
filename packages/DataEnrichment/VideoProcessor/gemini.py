from google import genai
from google.genai import types
from dotenv import load_dotenv
import base64
import logging
import os
import json
from knowledge import KNOWLEDGE

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

load_dotenv()

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
You are an expert analyst specializing in detecting geopolitical propaganda and disinformation in short-form video content. Your task is to analyze the provided video and produce a structured JSON output.

Use the following knowledge base to help identify key entities and their inherent ideological alignment. The alignment score is from -1.0 (pro-Russian) to 1.0 (pro-Western).

--- KNOWLEDGE BASE START ---
{knowledge_base}
--- KNOWLEDGE BASE END ---

Analyze the video's visual elements, spoken words, text overlays, and music to identify the key subjects being discussed or referenced. These subjects may or may not be in the knowledge base.

For each subject, determine the video's stance towards it on a scale from -1.0 (highly negative/critical) to 1.0 (highly positive/supportive).

Based on the combination of subjects and their stances, determine the video's overall ideological alignment. Use a scale where -1.0 represents a strong pro-Russian and/or anti-Western narrative, and 1.0 represents a strong pro-Western and/or anti-Russian narrative. A score of 0.0 is neutral.

Your output must be a valid JSON object that adheres to the provided schema. Do not include any text or formatting outside of the JSON object.
"""

class _GeminiProcessor:
    def __init__(self):
        # Config is set in .env
        self.client = genai.Client()

        self.model_name = "gemini-2.5-flash-lite"
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

        # Format the knowledge object taht then gets passed onto the prompt
        self.knowledge_string = json.dumps(KNOWLEDGE, indent=2)


    def analyze(self, video_path: str):
        with open(video_path, "rb") as f:
            video_bytes = f.read()

        video_part = types.Part(
            inline_data=types.Blob(
                mime_type="video/mp4",
                data=video_bytes
            )
        )

        try:
            final_prompt = VIDEO_ANALYSIS_PROMPT_TEMPLATE.format(knowledge_base=self.knowledge_string)

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
            logging.info(json.dumps(parsed_response, indent=2))
            return parsed_response
        except Exception as e:
            logging.error(f"An error occured during Gemini analysis for video {video_path}, error: {e}" )
            return None 


gemini = _GeminiProcessor()