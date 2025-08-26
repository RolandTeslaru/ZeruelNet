from .gemini import gemini
from utils import vxlog

def process(video_path: str, video_id: str, transcript: str, sentiment: dict, description: str):
    vxlog.info(f"Starting video processing for {video_id}")

    try:
        analysis_result = gemini.analyze(video_path, transcript, sentiment, description)

        vxlog.info(f"Video Analysis result {analysis_result}")

        if analysis_result:
            return analysis_result
        else:
            vxlog.warning(f"Video processing for {video_id} returned no result.")
            return None
    except Exception as e:
        vxlog.error(f"An error occurred during video processing for {video_id}: {e}")
        return None 