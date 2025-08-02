import subprocess
import logging
import os
import yt_dlp

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def download_tiktok_audio(video_id: str, output_dir: str = ""):
    if not os.path.exists(output_dir):
        raise ValueError(f"Output directory {output_dir} does not exist!")
    
    video_url = f"https://www.tiktok.com/@placeholder/video/{video_id}"
    # output_path_template = os.path.join(output_dir, f"{video_id}.wav")

    output_path_template = os.path.join(output_dir, f"{video_id}.%(ext)s")

    options = {
        'format': "bestaudio/best",
        "postprocessors": [{
            'key': 'FFmpegExtractAudio',
            "preferredcodec": 'wav'
        }],
        'outtmpl': output_path_template,
        "quiey": True # No console outputs by yt-dpl
    }

    logging.info(f"Downloading audio from {video_url}")

    try:
        with yt_dlp.YoutubeDL(options) as ydl:
            ydl.download((video_url))

        final_output_path = os.path.join(output_dir, f"{video_id}.wav")
        logging.info(f"Successfully downloaded audio to: {final_output_path}")
        return video_url, final_output_path
    except Exception as e:
        logging.error(f"Failed to download audio with video_id: {video_id}")
        raise
        