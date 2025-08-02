from utils.download import download_tiktok_full
import AudioProcessor
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
audio_dir = os.path.join(script_dir, "/tmp/audio")
video_dir = os.path.join(script_dir, "/tmp/video")


def main(video_id:str):
    
    video_url, dowloaded_video_path, final_audio_path = download_tiktok_full(video_id, video_dir, audio_dir)

    transcript, lang = AudioProcessor.process_audio(final_audio_path)