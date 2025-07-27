import argparse
import os
import subprocess
from pathlib import Path

import pandas as pd
import whisper
from rich.console import Console
from rich.progress import track

console = Console()

# The data directory is outside the analysis package
DATA_DIR = Path(__file__).parent.parent.parent / "data"
VIDEO_DIR = DATA_DIR / "videos"
VIDEO_DIR.mkdir(exist_ok=True)


def download_video(url, output_path):
    """
    Downloads a video from a URL using yt-dlp, without the watermark.
    """
    try:
        # We use subprocess to call yt-dlp. This is more reliable than using the Python library directly
        # for complex cases like TikTok.
        command = [
            'yt-dlp',
            '--no-warnings',
            '--quiet',
            '--output', str(output_path),
            '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            url
        ]
        subprocess.run(command, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as e:
        console.log(f"[red]Failed to download {url}. Error: {e.stderr.decode()}[/red]")
        return False
    except Exception as e:
        console.log(f"[red]An unexpected error occurred during download: {e}[/red]")
        return False


def main():
    parser = argparse.ArgumentParser(description="Transcribe audio from TikTok videos.")
    parser.add_argument("--input_file", type=Path, required=True, help="Path to the input CSV file containing video URLs (e.g., ../../data/news_videos.csv).")
    parser.add_argument("--output_file", type=Path, help="Path to save the output CSV file with transcripts. Defaults to replacing '_videos.csv' with '_videos_enriched.csv'.")
    args = parser.parse_args()

    if not args.input_file.exists():
        console.log(f"[bold red]Error: Input file not found at {args.input_file}[/bold red]")
        return

    # If no output file is specified, create a default one
    if not args.output_file:
        args.output_file = args.input_file.parent / args.input_file.name.replace("_videos.csv", "_videos_enriched.csv")

    df = pd.read_csv(args.input_file)
    console.log(f"Loaded {len(df)} videos from {args.input_file}")

    if 'url' not in df.columns:
        console.log("[red]Error: Input CSV must have a 'url' column.[/red]")
        return

    console.log("Loading Whisper model...")
    # Using the 'base' model. Other options include 'tiny', 'small', 'medium', 'large'
    # The 'base' model is a good balance of speed and accuracy for this task.
    model = whisper.load_model("base")
    console.log("[green]Whisper model loaded.[/green]")

    transcripts = []
    for index, row in track(df.iterrows(), description="Transcribing videos...", total=len(df)):
        video_url = row['url']
        # We'll name the video file after its index to avoid filename issues
        video_path = VIDEO_DIR / f"{index}.mp4"

        transcript = "Transcription failed."
        if download_video(video_url, video_path):
            try:
                result = model.transcribe(str(video_path), fp16=False)
                transcript = result['text'].strip()
            except Exception as e:
                console.log(f"[red]Error transcribing {video_url}: {e}[/red]")
                transcript = "Transcription error."
            finally:
                # Clean up the video file after processing
                os.remove(video_path)
        
        transcripts.append(transcript)

    df['transcript'] = transcripts
    df.to_csv(args.output_file, index=False)
    console.log(f"\n[bold green]✅ Transcription complete! Enriched data saved to {args.output_file}[/bold green]")


if __name__ == "__main__":
    main() 