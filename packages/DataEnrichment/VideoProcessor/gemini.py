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
                        "description": "The canonical name of the identified subject (e.g., 'nato', 'vladimir putin', 'globalists', 'property tax')."
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
            "description": "The video's final geopolitical alignment score (-1.0 Pro-Russian to 1.0 Pro-Western). This is a HOLISTIC DEDUCTION based on the alignment of the video's 'heroes' (praised subjects) and 'villains' (criticized subjects). A video praising anti-Western figures/concepts will have a negative score."
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
    *   First, read through the evidence and identify all key subjects that are explicitly mentioned or depicted.
    *   **Alias Resolution:** Before adding a subject to your list, check if it matches an `alias` in the `KNOWLEDGE BASE`. If it does, use its canonical name (the main key). For example, if you see "gs", identify the subject as "george simion".

*   **B. Determine Stance for All Subjects:**
    *   For every subject you identified in Step A, you will now assign a `stance` score from -1.0 to 1.0.

    *   **The Core Question:** This score MUST answer the question: **"How does this specific video portray this subject?"**

    *   **CRITICAL - The Golden Rule:** The `stance` is a measure of the video's internal opinion ONLY. It is **absolutely forbidden** to let the `alignment_tendency` from the knowledge base influence this calculation.

    *   **Score Definitions & Analytical Rules:** To determine the correct score, you MUST apply the following rules:

        1.  **Identify the Narrative's Focus:**
            *   First, determine if the video has a clear persuasive or emotional focus.
            *   If the video is **praising or defending** a subject, this is the 'Positive Focus' and it receives a **positive stance**.
            *   If the video is **criticizing or mocking** a subject, this is the 'Negative Focus' and it receives a **negative stance**.
            *   **If the video is a neutral, factual report** (like a news story about weather or policy), it does not have a 'Positive/Negative Focus'. In this case, the stance for most subjects will be **neutral (`0.0`)**, unless a specific subject is described with explicitly positive or negative consequences (e.g., 'property damage' is negative, 'emergency services helping' is positive).

        2.  **Infer Stances for Concepts:** The stance for abstract concepts is inferred from their relationship to the focus.
            *   **CRITICAL SUB-RULE:** If a concept like `national sovereignty` or `patriotism` is used to support the 'Positive Focus', its stance **MUST BE POSITIVE**, overriding any default model bias.

        3.  **Detect Sarcasm (Rule of Contradiction):** If spoken words are positive but visuals or context are negative, the true stance is negative. This identifies the real 'Negative Focus'.
            *   *Example:* Saying "Russia is a liberator" while showing destruction means Russia's stance is **-1.0**.

        4.  **Detect Scapegoating:** If a subject is blamed for a problem (e.g., 'selling our port to help Ukraine'), it is part of the 'Negative Focus' and its stance is **negative**.

        5.  **Detect Coded Endorsement:** Framing a figure with heroic archetypes ('The Emperor') makes them the 'Positive Focus' and their stance is **positive**.
    
**Step 3: Estimate Overall Alignment (Holistic Synthesis)**
*   This score represents the video's overall position on the Pro-Russian/Anti-Western spectrum. To determine this score, you are not performing a calculation. Instead, you are making a **logical deduction** by following these principles:

*   **1. Identify the Narrative's 'Heroes' and 'Villains':**
    *   First, look at the subjects you identified and their stances. Who is the video praising, defending, or framing as a hero? These are the **'Protagonists'**.
    *   Who is the video criticizing, mocking, or framing as a villain/scapegoat? These are the **'Antagonists'**.

*   **2. Consider the Known Alignments of the Key Players:**
    *   Now, consider the `alignment_tendency` of these Protagonists and Antagonists from the `KNOWLEDGE BASE`. This provides the geopolitical context for their roles in the narrative.

*   **3. Synthesize the Final Score based on this Logic:**
    *   **The Core Principle: A video's alignment is defined by the alignment of its heroes.**
    *   If the video's main Protagonists are figures and concepts with a **negative `alignment_tendency`**, then the video is telling an anti-Western story. The `overall_alignment` **must be negative**.
    *   If the video's main Protagonists are figures and concepts with a **positive `alignment_tendency`**, then the video is telling a pro-Western story. The `overall_alignment` **must be positive**.
    *   If the video has no clear Protagonists or Antagonists on the geopolitical spectrum (e.g., a report on a local storm), the `overall_alignment` **must be neutral (0.0)**.

*   **Example Applications:**
    *   **Scenario 1 (Anti-Western Narrative):** A video praises `Viktor Orbán` (Protagonist) for defending his country against `Globalists` (Antagonists).
        *   *Reasoning:* The video's hero is Orbán. Orbán has a strong negative `alignment_tendency` in the knowledge base. Therefore, the video is promoting an anti-Western hero. The final `overall_alignment` must be strongly negative (e.g., -0.8).

    *   **Scenario 2 (Pro-Western Narrative):** A video praises `Volodymyr Zelenskyy` (Protagonist) for defending Ukraine against `Russian Aggression` (Antagonist).
        *   *Reasoning:* The video's hero is Zelenskyy. Zelenskyy has a strong positive `alignment_tendency`. Therefore, the video is promoting a pro-Western hero. The final `overall_alignment` must be strongly positive (e.g., +0.9).
    
    *   **Scenario 3 (Neutral Narrative):** A video reports on a local storm (Antagonist) and praises the `emergency services` (Protagonists).
        *   *Reasoning:* The video's protagonists and antagonists are geopolitically neutral; they are not in the knowledge base or have a `0.0` tendency. Therefore, the video has no geopolitical alignment. The final `overall_alignment` must be `0.0`.

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