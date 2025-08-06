import subprocess
import logging
import os
import yt_dlp

logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')

script_dir = os.path.dirname(os.path.abspath(__file__))
audio_output_dir = os.path.abspath(os.path.join(script_dir, "../tmp/audio"))
video_output_dir = os.path.abspath(os.path.join(script_dir, "../tmp/video"))

def tiktok_audio(video_id: str):

    video_url = f"https://www.tiktok.com/@placeholder/video/{video_id}"
    output_path_template = os.path.join(audio_output_dir, f"{video_id}.%(ext)s")

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

        final_output_path = os.path.join(audio_output_dir, f"{video_id}.wav")
        logging.info(f"Successfully downloaded audio to: {final_output_path}")
        return video_url, final_output_path
    except Exception as e:
        logging.error(f"Failed to download audio with video_id: {video_id}: {e}")
        raise



def tiktok_full(video_id: str):
    video_url = f"https://www.tiktok.com/@placeholder/video/{video_id}"
    video_path = ""

    try:
        # Download video ( video + audio )
        video_output_template = os.path.join(video_output_dir, f"{video_id}.%(ext)s")
        video_opts = {
            'format': 'bestvideo+bestaudio/best/best',
            'outtmpl': video_output_template,
            'quiet': True,
        }

        with yt_dlp.YoutubeDL(video_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            video_path = ydl.prepare_filename(info)
            if not os.path.exists(video_path):
                ydl.download([video_url])
                logging.info(f"Successfully downloaded video to: {video_path}")
            else:
                logging.info(f"Video {video_id} is already downloaded to {video_path}. Skipping")

        # Extract audio from the local file
        audio_path = os.path.join(audio_output_dir, f"{video_id}.wav")
        
        if not os.path.exists(audio_path):
            command = [
                'ffmpeg',
                '-i', video_path,
                '-vn', # no video
                '-acodec', 'pcm_s16le', # wav format
                '-ar', '16000', 
                '-ac', '1', # mono channel
                audio_path
            ]
            
            try:
                subprocess.run(command, check=True, capture_output=True, text=True)
                logging.info(f"Successfully extracted audio to: {audio_path}")
            except subprocess.CalledProcessError as e:
                logging.error(f"Failed to extract audio with FFmpeg: {e.stderr}")
                raise
        else:
            logging.info(f"Audio {video_id} is already downloaded in {audio_path}. Skipping")
        
        return video_url, video_path, audio_path

    except Exception as e:
        logging.error(f"Failed during download/extraction for video_id: {video_id}: {e}")
        raise