# Analysis Package

This package contains Python scripts for processing and enriching the raw data collected by the scrapers.

## Setup

It is recommended to use a Python virtual environment.

1.  Navigate to this directory:
    ```bash
    cd packages/analysis
    ```
2.  Create a virtual environment:
    ```bash
    python3 -m venv venv
    ```
3.  Activate it:
    ```bash
    source venv/bin/activate
    ```
4.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  **FFmpeg is required** for Whisper to process audio. If you are on a Mac and use Homebrew, you can install it with:
    ```bash
    brew install ffmpeg
    ```
    For other operating systems, please refer to the official FFmpeg installation guide.

## Usage

To run the video transcription script, you must provide the path to the input file. The script will automatically create a corresponding output file.

```bash
python transcribe_videos.py --input_file ../../data/<your_hashtag>_videos.csv
```

For example:
```bash
python transcribe_videos.py --input_file ../../data/news_videos.csv
```
This will create `../../data/news_videos_enriched.csv`. 