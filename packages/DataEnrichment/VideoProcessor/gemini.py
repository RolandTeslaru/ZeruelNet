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
            "description": "A brief, neutral, one-paragraph summary of the video's content. CRITICAL: Must frame unsubstantiated claims as allegations made by the speaker (e.g., 'The speaker claims...', 'The video alleges...')."
        },
        "identified_subjects": {
            "type": "ARRAY",
            "description": "A list of the key political, geopolitical, or ideological subjects that are explicitly present in the video.",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "subject": {
                        "type": "STRING",
                        "description": "The name of the identified subject (e.g., 'NATO', 'Călin Georgescu', 'National Sovereignty')."
                    },
                    "stance": {
                        "type": "NUMBER",
                        "description": "The video's specific opinion of this subject, from -1.0 to 1.0. This score MUST be derived ONLY from the video's content and rhetorical framing (sarcasm, scapegoating, etc.). It MUST NOT be influenced by the 'alignment_tendency' from the knowledge base."
                    }
                },
                "required": ["subject", "stance"]
            }
        },
        "overall_alignment": {
            "type": "NUMBER",
            "description": "The video's final geopolitical alignment score (-1.0 Pro-Russian to 1.0 Pro-Western). This score is a SYNTHESIS of the subject's 'stance' and its 'alignment_tendency' from the knowledge base. The sign (+/-) of this score is PRIMARILY determined by the video's stance on Russia and Ukraine."
        }
    },
    "required": ["summary", "identified_subjects", "overall_alignment"]
}


VIDEO_ANALYSIS_PROMPT_TEMPLATE = """
You are an expert geopolitical analyst specializing in detecting propaganda, disinformation, and nuanced sentiment in short-form video content. Your task is to analyze the provided evidence and produce a single, valid JSON object as output.

--- EVIDENCE FILE ---
This is your primary source of truth.

1.  **VIDEO DESCRIPTION (Creator's Intent):**
    "{description}"

2.  **AUDIO TRANSCRIPT (High-Accuracy):**
    "{transcript}"

3.  **INDEPENDENT SENTIMENT ANALYSIS (External Tool):**
    {sentiment}

Use this reference data to understand the geopolitical context of identified subjects.
--- KNOWLEDGE BASE START ---
{knowledge_base}
--- KNOWLEDGE BASE END ---


--- ANALYTICAL METHODOLOGY ---
Follow this unified analysis process to calculate all final JSON values.

**Step 1: Summarize**
* Produce a brief, neutral one-paragraph summary.  
* Frame unverified claims as allegations (e.g. “The video alleges …”).

**Step 2: Identify Subjects and Determine Local Stance**
*   **A. Identify Subjects:** Read through the evidence and identify all key subjects. A subject is valid only if it is explicitly mentioned or depicted.
    *   **Alias Resolution:** Before adding a subject to your list, check if it matches an `alias` in the `KNOWLEDGE BASE`. If it does, use its canonical name (the main key). For example, if you see "gs", identify the subject as "george simion".

*   **B. Determine Stance:** For each identified subject, assign a `stance` score from -1.0 to 1.0. This score MUST be derived *only* from the video's content and the 'Advanced Narrative Analysis' rules below. **It is forbidden to be influenced by the `alignment_tendency` from the knowledge base during this step.**

*   **C. Advanced Narrative Analysis (For Stance Calculation):**
    *   **Sarcasm:** A positive statement in a negative context is sarcasm (e.g., "Let Russia save us" when criticizing Russia).
    *   **The 'Scapegoat':** Blaming a subject for a negative outcome means the stance is **negative**.
    *   **The 'Defended Concept':** Presenting a concept as under threat means the stance is **positive**.
    *   **'Coded Language':** Framing a figure with heroic archetypes ('The Emperor', 'fighter against the system') means the stance is **positive**.

**Step 3: Calculate Overall Alignment**
*   You will now perform a precise, weighted calculation to determine the final `overall_alignment`. You must show your work in a private scratchpad.

*   **A. The Calculation Formula:**
    1.  For each subject you identified that exists in the `KNOWLEDGE BASE`:
        *   `contribution = stance × alignment_tendency × weight`
    2.  Calculate the `raw_total` by summing all individual `contribution` values.
    3.  Calculate the `weight_total` by summing the absolute value of (`alignment_tendency × weight`) for all subjects.
    4.  `final_alignment = raw_total / weight_total` (If `weight_total` is 0, the result is 0.0).
    5.  Clamp the `final_alignment` to be strictly within the range of [-1.0, 1.0].


*   **B. The Anchor Rule (Final Sign Check):**
    *   This is a final check to prevent logical errors. After you have your clamped `final_alignment`:
    *   If any subject in {{`Russia`, `Vladimir Putin`, `traditional values`, etc.}} has a `stance` > 0.3, the final score **MUST be negative**.
    *   If any subject in {{`Ukraine`, `NATO`, `EU`, etc.}} has a `stance` > 0.3 (and the Russia/Putin rule is not met), the final score **MUST be positive**.
    *   If the rules conflict or don't apply, your calculated score stands.

──────────────────────────────
---
**INTERNAL SCRATCHPAD (for your use only, erase before final output):**
*   List identified subjects: subject | stance | tendency | weight | contribution
*   Show calculations: raw_total, weight_total, final_alignment, anchor check result
---


Your final output must be a single, valid JSON object conforming to the schema. Do not include any other text or the scratchpad.
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