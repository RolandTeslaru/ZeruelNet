from transformers import AutoModelForSequenceClassification
from transformers import AutoTokenizer
from scipy.special import softmax

import os
import logging
import numpy as np


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

script_dir = os.path.dirname(os.path.abspath(__file__))


class _SentimentAnalyzer:
    def __init__(self):
        self.loaded_models = {}
        self.loaded_tokenizers = {}
        # This map defines which model to use for each language code
        self.model_map = {
            'en': 'cardiffnlp/twitter-roberta-base-sentiment-latest',
            'de': 'oliverguhr/german-sentiment-bert',
            'fr': 'cmarkea/distilcamembert-base-sentiment',
            'ro': 'ldincov/roberta-base-romanian-sentiment-analysis'
        }
        # Result labels because they are dfirent between models
        self.id2label_maps = {}
        self.label_translation_map = {
            'cardiffnlp/twitter-roberta-base-sentiment-latest': {
                'positive': 'positive',
                'negative': 'negative',
                'neutral': 'neutral'
            },
            'oliverguhr/german-sentiment-bert': {
                'positive': 'positive',
                'negative': 'negative',
                'neutral': 'neutral'
            },
            'cmarkea/distilcamembert-base-sentiment': {
                'positive': 'positive',
                'negative': 'negative'
                # This model does not have a neutral label
            },
            'ldincov/roberta-base-romanian-sentiment-analysis': {
                'LABEL_0': 'negative',
                'LABEL_1': 'neutral',
                'LABEL_2': 'positive'
            },
        }

    # Check if the language is supported otherwise default to english (which is universal but less accurate)
    def _check_lang(self, lang:str):
        if lang not in self.model_map:
            logging.warning(f"Language {lang} doesnt have a sentiment model. Defaulting to english")
            return "en"
        else:
            return lang

    def _load_model(self, lang: str):
        model_name = self.model_map[lang]

        if model_name not in self.loaded_models:
            logging.info(f"Loading mode {self.model_map[lang]} for language {lang}")
            try:
                self.loaded_tokenizers[model_name] = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForSequenceClassification.from_pretrained(model_name)
                self.loaded_models[model_name] = model
                # Dynamically store the model's id-to-label mapping
                self.id2label_maps[model_name] = model.config.id2label
                logging.info(f"Successfully loaded model {model_name}")
            except Exception as e:
                logging.error(f"An error occurred when tryng to load model {model_name} {e}")
                # If the model is broken for a speicifc language then we must force it to use the default en model
                self.model_map.pop(lang, None)
                return None, None
        

    def _get_model(self, lang: str):
        # Check if the model is already loaded
        model_name = self.model_map[lang]
        if model_name not in self.loaded_models:
            self._load_model(lang)

        # Check if the model succesfully loaded
        if model_name not in self.loaded_models:
            # Default to the english model if it failed to load
            universal_model_name = self.model_map["en"]
            if universal_model_name not in self.loaded_models:
                self._load_model("en")
            
            # If english model also fails to load then we stop
            if universal_model_name not in self.loaded_models:
                 raise RuntimeError("Critical error: Default English sentiment model failed to load.")

            return self.loaded_models[universal_model_name], self.loaded_tokenizers[universal_model_name]


        return self.loaded_models[model_name], self.loaded_tokenizers[model_name]


    def get_sentiment(self, transcription: str, lang: str):
        lang = self._check_lang(lang)

        model, tokenizer = self._get_model(lang)
        model_name = self.model_map[lang]

        try:
            encoded_input = tokenizer(transcription, return_tensors='pt', truncation=True, max_length=512) 
            output = model(**encoded_input)

            scores = output[0][0].detach().numpy()
            scores = softmax(scores)

            # Get the correct mappings for the current model
            id2label = self.id2label_maps[model_name]
            translator = self.label_translation_map[model_name]

            # Initialize results with all sentiments at 0.0
            sentiment_results = {
                "positive": 0.0,
                "neutral": 0.0,
                "negative": 0.0
            }
            
            # Map scores to their standard labels
            for i in range(len(scores)):
                model_label = id2label[i]
                standard_label = translator.get(model_label)
                if standard_label:
                    sentiment_results[standard_label] = float(scores[i])

            return sentiment_results

        except Exception as e:
            logging.error(f"An Error occured during sentiment analysis {e}")
            return {
                "positive": 0.0,
                "neutral": 0.0,
                "negative": 0.0
            }
            
SentimentAnalyzer = _SentimentAnalyzer()