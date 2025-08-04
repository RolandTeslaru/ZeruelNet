from .gemini import gemini
import logging

def process(video_path: str):
    logging.info(f"Starting video processing for {video_path}")

    try:
        analysis_result = gemini.analyze(video_path)
        if analysis_result:
            logging.info(f"Successfully processed video {video_path}")
            return analysis_result
        else:
            logging.warning(f"Video processing for {video_path} returned no result.")
            return None
    except Exception as e:
        logging.error(f"An error occurred during video processing for {video_path}: {e}")
        return None 