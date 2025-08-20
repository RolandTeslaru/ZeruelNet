import subprocess
import logging
import os
import requests
from urllib.parse import urlencode, urlparse, parse_qs, urlunparse
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')

script_dir = os.path.dirname(os.path.abspath(__file__))
audio_output_dir = os.path.abspath(os.path.join(script_dir, "../tmp/audio"))
video_output_dir = os.path.abspath(os.path.join(script_dir, "../tmp/video"))

class VideoUnavailableError(Exception):
    pass

class RapidAPITiktokDownloaderError(Exception):
    pass

# Uses a rapid api tiktok downloader instead of the youtubeDL
def tiktok_api_video(video_id: str):
    api_url = 'https://tiktok-video-downloader-api.p.rapidapi.com/media'

    video_page = f'https://www.tiktok.com/@placeholder/video/{video_id}'
    query = {'videoUrl': video_page}
    headers = {
        'x-rapidapi-key': os.getenv('RAPIDAPI_KEY'),
        'x-rapidapi-host': 'tiktok-video-downloader-api.p.rapidapi.com'
    }

    resp = requests.get(api_url, headers=headers, params=query, timeout=20)
    resp.raise_for_status()

    try:
        response_video_id = "id" in resp.json()
        if not response_video_id:
            raise VideoUnavailableError(f"Video {video_id} is unavailable: {resp.text}")

        mp4_url = resp.json()['downloadUrl']
        parsed = urlparse(mp4_url)
        qs = parse_qs(parsed.query)

        if 'videoUrl' in qs:
            original = qs['videoUrl'][0]
            encoded = urlencode({'videoUrl': original})
            mp4_url = urlunparse(parsed._replace(query=encoded))

    except (KeyError, TypeError, ValueError):
        raise RuntimeError('Failed to get downloadUrl from RapidAPI response')

    local_path = os.path.join(video_output_dir, f"{video_id}.mp4")
    os.makedirs(os.path.dirname(local_path), exist_ok=True)

    logging.info(f"Downloading MP4 for {video_id} → {local_path}")
    with requests.get(mp4_url, stream=True, timeout=30) as dl:
        dl.raise_for_status()
        with open(local_path, 'wb') as f:
            for chunk in dl.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

    return local_path


def tiktok_full(video_id: str):
    video_url = f"https://www.tiktok.com/@placeholder/video/{video_id}"
    
    try:
        # My ip got banned so i cant use youtubeDL to download the mp4

        # Download video ( video + audio )
        # video_output_template = os.path.join(video_output_dir, f"{video_id}.%(ext)s")
        # video_opts = {
        #     'format': 'bestvideo+bestaudio/best/best',
        #     'outtmpl': video_output_template,
        #     'quiet': True,
        # }

        # with yt_dlp.YoutubeDL(video_opts) as ydl:
        #     info = ydl.extract_info(video_url, download=False)
        #     video_path = ydl.prepare_filename(info)
        #     if not os.path.exists(video_path):
        #         ydl.download([video_url])
        #         logging.info(f"Successfully downloaded video to: {video_path}")
        #     else:
        #         logging.info(f"Video {video_id} is already downloaded to {video_path}. Skipping")

        
        video_path = os.path.join(video_output_dir, f"{video_id}.mp4")
        if not os.path.exists(video_path):
            # Fetch video via RapidAPI helper
            video_path = tiktok_api_video(video_id)
    
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