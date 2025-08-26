from google import genai
from google.genai import types
from dotenv import load_dotenv
import base64
import os
import json
from knowledge import MODEL_KNOWLEDGE
from .prompt import VIDEO_ANALYSIS_PROMPT_TEMPLATE
from .schema import VIDEO_ANALYSIS_SCHEMA
from utils import vxlog

load_dotenv()

GEMINI_MODEL_NAME = "gemini-2.5-flash-lite"

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
            # vxlog.info(json.dumps(parsed_response, indent=2))
            return parsed_response
        except Exception as e:
            vxlog.error(f"An error occured during Gemini analysis for video {video_path}, error: {e}" )
            return None 


gemini = _GeminiProcessor()