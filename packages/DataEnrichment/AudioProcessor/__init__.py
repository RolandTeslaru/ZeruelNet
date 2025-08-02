
from AudioProcessor.transcriber import AudioTanscriber

trascriber = AudioTanscriber(model_name="ggml-base.bin")

def process_audio(audio_path: str):
    transcript, lang, console_output = trascriber.extract(audio_path)

    return transcript, lang