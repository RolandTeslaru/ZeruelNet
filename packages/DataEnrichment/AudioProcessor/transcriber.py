import subprocess
import os
import logging
from typing import Tuple
import re

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

script_dir = os.path.dirname(os.path.abspath(__file__))
whisper_cpp_dir = os.path.abspath(os.path.join(script_dir, "support", "whisper.cpp"))
models_dir = os.path.join(whisper_cpp_dir, "models")

DEFAULT_MODEL_NAME = "ggml-base.bin"

def transcribe_audio(audio_path: str, model_name=DEFAULT_MODEL_NAME):
    model_path = os.path.join(models_dir, model_name)
    executable_path = os.path.join(whisper_cpp_dir, "build", "bin", "whisper-cli")
    
    logging.info(f"Starting transcriber for audio in {audio_path}")

    command = [
        executable_path,
        "-m", model_path,
        "-f", audio_path,
        "-l", "auto",
        "-otxt" # write the transcription to a .txt files
    ]

    try:
        # Run the Whisper.cpp model thru the CLI
        process = subprocess.run(command, check=True, capture_output=True, text=True, cwd=os.path.dirname(audio_path))

        # Load transcription into memory from the .txt file then remove it
        transcription_path = f"{audio_path}.txt"
        if not os.path.exists(transcription_path):
            raise FileNotFoundError(f"Transcription path does NOT exist {transcription_path}")

        with open(transcription_path, "r") as f:
            transcript = f.read().strip()
        
        os.remove(transcription_path)

        # Get identified language from the output of the process
        language = get_lang_from_process_output(process)
        
        return transcript, language, process.stdout + process.stderr
    
    except subprocess.CalledProcessError as e:
        logging.error(f"Whisper.cpp exited with error: {e}")
        logging.error(f"Whisper.cpp stderr:\n{e.stderr}")
        logging.error(f"Whisper.cpp stdout:\n{e.stdout}")
        raise


def get_lang_from_process_output(process: subprocess.CompletedProcess[str])->str :
    detected_lang = "unknown"
    for line in process.stderr.splitlines():
        match = re.search(r'detected language:?\s*([a-z]{2})', line, re.IGNORECASE)
        if match:
            detected_lang = match.group(1)
            break  # Found it, no need to search further

    return detected_lang