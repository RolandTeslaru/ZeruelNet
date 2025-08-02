import subprocess
import os
import logging
from typing import Tuple

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

script_dir = os.path.dirname(os.path.abspath(__file__))
whisper_cpp_dir = os.path.abspath(os.path.join(script_dir, "support", "whisper"))
models_dir = os.path.join(whisper_cpp_dir, "models")

DEFAULT_MODEL_NAME = "ggm-base.bin"

class Tanscriber:
    def __init__(self, model_name=DEFAULT_MODEL_NAME):
        self.model_name = model_name
        self.model_path = os.path.join(models_dir, model_name)
        self.executable_path = os.path.join(whisper_cpp_dir, "bin", "whisper-cli")

    def transcribe_audio(self, audio_path: str):
        command = [
            self.executable_path,
            "--model", self.model_path,
            "--language", "auto",
            "--output-txt",
            "--file", audio_path
        ]

        try:
            process = subprocess.run(command, check=True, capture_output=True, text=True, cwd=os.path.dirname(audio_path))

            # Load transcription into memory then remove the file
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
            raise


def get_lang_from_process_output(process: subprocess.CompletedProcess[str])->str :
    detected_lang = "unknown"
    for line in process.stderr.splitlines():
        if "detected language" in line:
            detected_lang = line.split(":")[-1].strip()
            break

    return detected_lang