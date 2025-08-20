import AudioProcessor, VideoProcessor, db
import logging
import redis
import os
import json
from utils.get_video_description import get_video_description
from utils import download
from utils.download import RapidAPITiktokDownloaderError, VideoUnavailableError
from VideoProcessor.gemini import GEMINI_MODEL_NAME
import AlignmentCalculator

logging.basicConfig(level=logging.INFO, format='%(levelname)s - [EnrichmentWorker] - %(message)s')

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)
ENRICHMENT_QUEUE_CHANNEL = "enrichment_queue"

def process(video_id: str, db_conn):
    video_path, audio_path = None, None
    try:
        logging.info("Starting data enrichment process for video_id: %s", video_id)

        # Download the content
        video_url, video_path, audio_path = download.tiktok_full(video_id)

        # Run the Processors
        transcript, lang, text_sentiment_analysis = AudioProcessor.process(audio_path)

        description = get_video_description(video_id, db_conn)

        analysis_result_json = VideoProcessor.process(video_path, transcript, text_sentiment_analysis, description)

        positive_sentiment = text_sentiment_analysis["positive"]
        negative_sentiment = text_sentiment_analysis["negative"]
        neutral_sentiment = text_sentiment_analysis["neutral"]

        polarity = positive_sentiment - negative_sentiment

        llm_summary = analysis_result_json["summary"]
        identified_subjects = analysis_result_json["identified_subjects"] 
        llm_overall_alignment = analysis_result_json["overall_alignment"]

        final_alignment, deterministic_alignment, alignment_conflict = AlignmentCalculator.calculate(identified_subjects, llm_overall_alignment, alpha=0.5)

        # Upload to database
        with db_conn.cursor() as cur:
            cur.execute(UPDATE_SUCCESSFUL_ENRICHMENT_QUERY,
                (
                    video_id, transcript, lang, 'completed',
                    llm_summary, json.dumps(identified_subjects), llm_overall_alignment, GEMINI_MODEL_NAME,
                    final_alignment, deterministic_alignment, alignment_conflict,
                    positive_sentiment, negative_sentiment, neutral_sentiment, polarity
                )
            )
            db_conn.commit()
            logging.info(f"Successfully comitted to database")

    # if video is deleted from tiktok set the status to "deleted"
    except VideoUnavailableError as e:
        logging.warning(f"{e}")
        db_conn.rollback()
        with db_conn.cursor() as cur:
            cur.execute(UPDATE_ENRICHMENT_STATUS_ON_FAILURE_QUERY, (video_id, 'deleted'))
            db_conn.commit()
    
    # If the api is down or there are issues with api key
    # except RapidAPITiktokDownloaderError as e:
    #     logging.error(f"{e}")
    #     db_conn.rollback()


    except Exception as e:
        logging.error(f"Enrichment failed for video_id: {video_id} with error: {e}")
        db_conn.rollback()
        with db_conn.cursor() as cur:
            cur.execute(UPDATE_ENRICHMENT_STATUS_ON_FAILURE_QUERY, (video_id, 'failed'))
            db_conn.commit()
    finally:
        # Remove the temporary audio and video files
        try:
            if video_path and os.path.exists(video_path):
                os.remove(video_path)
                logging.info(f"Deleted temporary video file: {video_path}")
            if audio_path and os.path.exists(audio_path):
                os.remove(audio_path)
                logging.info(f"Deleted temporary audio file: {audio_path}")
        except OSError as e:
            logging.error(f"Error removing temporary files: {e}")

def main():
    logging.info("Data Enrichment is starting up")

    db_conn = db.get_connection()

    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
    pubsub = redis_client.pubsub()
    pubsub.subscribe(ENRICHMENT_QUEUE_CHANNEL)
    logging.info(f"Subscribed to Redis channel: '{ENRICHMENT_QUEUE_CHANNEL}'")

    try:
        for payload in pubsub.listen():
            if payload['type'] == "message":
                video_id = payload['data']
                process(video_id, db_conn)

    except KeyboardInterrupt:
        logging.info("KeyboardInterrupt shutting down DataEnrichment Server")
    except Exception as e:
        logging.error(f"DataEnrichment critical error {e}")
    finally:
        if db_conn:
            db_conn.close()
        pubsub.close()

if __name__ == "__main__":
    main()


# Query that runs if the DataEnrichment process is successfull 
UPDATE_SUCCESSFUL_ENRICHMENT_QUERY = """--sql
    INSERT INTO video_features (
        video_id, transcript, detected_language, enrichment_status, last_enriched_at,
        llm_summary, llm_identified_subjects, llm_overall_alignment, llm_model_name,
        final_alignment, deterministic_alignment, alignment_conflict,
        text_sentiment_positive, text_sentiment_negative, text_sentiment_neutral, polarity
    ) VALUES (
        %s, %s, %s, %s, CURRENT_TIMESTAMP,
        %s, %s, %s, %s,
        %s, %s, %s,
        %s, %s, %s, %s
    )
    ON CONFLICT (video_id) DO UPDATE SET
        transcript = EXCLUDED.transcript,
        detected_language = EXCLUDED.detected_language,
        enrichment_status = 'completed',
        last_enriched_at = CURRENT_TIMESTAMP,
        llm_summary = EXCLUDED.llm_summary,
        llm_identified_subjects = EXCLUDED.llm_identified_subjects,
        llm_overall_alignment = EXCLUDED.llm_overall_alignment,
        llm_model_name = EXCLUDED.llm_model_name,
        final_alignment = EXCLUDED.final_alignment,
        deterministic_alignment = EXCLUDED.deterministic_alignment,
        alignment_conflict = EXCLUDED.alignment_conflict,
        text_sentiment_positive = EXCLUDED.text_sentiment_positive,
        text_sentiment_negative = EXCLUDED.text_sentiment_negative,
        text_sentiment_neutral = EXCLUDED.text_sentiment_neutral,
        polarity = EXCLUDED.polarity;
"""


# Querry that runs if its unsucessfull
# it sets the enrichment_status column to failed
UPDATE_ENRICHMENT_STATUS_ON_FAILURE_QUERY = """--sql
    INSERT INTO video_features (video_id, enrichment_status)
    VALUES (%s, %s)
    ON CONFLICT (video_id) DO UPDATE SET
        enrichment_status = EXCLUDED.enrichment_status,
        last_enriched_at = CURRENT_TIMESTAMP;
"""