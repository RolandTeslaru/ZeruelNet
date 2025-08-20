from .transcriber import transcribe_audio
from .sentiment import SentimentAnalyzer

def process(audio_path: str):
    transcript, lang, console_output = transcribe_audio(audio_path, model_name="ggml-large-v3.bin")

    text_sentiment_results = SentimentAnalyzer.get_sentiment(transcript, lang)

    return transcript, lang, text_sentiment_results