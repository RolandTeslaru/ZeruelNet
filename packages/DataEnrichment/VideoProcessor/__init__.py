from .gemini import gemini
import logging

def process(video_path: str, transcript: str, sentiment: dict, description: str):
    logging.info(f"Starting video processing for {video_path}")

    try:
        analysis_result = gemini.analyze(video_path, transcript, sentiment, description)

        logging.info(f"VIDEO Analysis result {analysis_result}")

        if analysis_result:
            return analysis_result
        else:
            logging.warning(f"Video processing for {video_path} returned no result.")
            return None
    except Exception as e:
        logging.error(f"An error occurred during video processing for {video_path}: {e}")
        return None 