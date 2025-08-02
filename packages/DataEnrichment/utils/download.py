import subprocess
import logging
import os
import yt_dlp

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

script_dir = os.path.dirname(os.path.abspath(__file__))


def download_tiktok_audio(video_id: str, output_dir: str):
    if not os.path.exists(output_dir):
        raise ValueError(f"Output directory {output_dir} does not exist!")
    
    video_url = f"https://www.tiktok.com/@placeholder/video/{video_id}"
    output_path_template = os.path.join(output_dir, f"{video_id}.%(ext)s")

    options = {
        'format': "bestaudio/best",
        "postprocessors": [{
            'key': 'FFmpegExtractAudio',
            "preferredcodec": 'wav'
        }],
        'outtmpl': output_path_template,
        "quiet": True
    }

    logging.info(f"Downloading audio from {video_url}")

    try:
        with yt_dlp.YoutubeDL(options) as ydl:
            ydl.download([video_url])

        final_output_path = os.path.join(output_dir, f"{video_id}.wav")
        logging.info(f"Successfully downloaded audio to: {final_output_path}")
        return video_url, final_output_path
    except Exception as e:
        logging.error(f"Failed to download audio with video_id: {video_id}: {e}")
        raise



def download_tiktok_full(video_id: str, video_output_dir: str, audio_output_dir: str):
    if not os.path.exists(video_output_dir):
        raise ValueError(f"Video output directory {video_output_dir} does not exist!")
    if not os.path.exists(audio_output_dir):
        raise ValueError(f"Audio output directory {audio_output_dir} does not exist!")
    
    video_url = f"https://www.tiktok.com/@placeholder/video/{video_id}"
    downloaded_video_path = ""

    try:
        # Download video ( video + audio )
        video_output_template = os.path.join(video_output_dir, f"{video_id}.%(ext)s")
        video_opts = {
            'format': 'bestvideo+bestaudio/best/best',
            'outtmpl': video_output_template,
            'quiet': True,
        }
        logging.info(f"Downloading video from {video_url}")
        with yt_dlp.YoutubeDL(video_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            downloaded_video_path = ydl.prepare_filename(info)
            logging.info(f"Successfully downloaded video to: {downloaded_video_path}")

        # Extract audio from the local file
        audio_output_template = os.path.join(audio_output_dir, f"{video_id}.%(ext)s")
        audio_opts = {
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
            }],
            'outtmpl': audio_output_template,
            'quiet': True
        }
        logging.info(f"Extracting audio from {downloaded_video_path}")
        with yt_dlp.YoutubeDL(audio_opts) as ydl:
            ydl.download([downloaded_video_path])
        
        final_audio_path = os.path.join(audio_output_dir, f"{video_id}.wav")
        logging.info(f"Successfully extracted audio to: {final_audio_path}")
        
        return video_url, downloaded_video_path, final_audio_path

    except Exception as e:
        logging.error(f"Failed during download/extraction for video_id: {video_id}: {e}")
        raise