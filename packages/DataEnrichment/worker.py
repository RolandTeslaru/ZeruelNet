import redis
import psycopg2
import os
import logging
from dotenv import load_dotenv

from AudioProcessor.transcriber import download_audio, transcribe_audio

# Load environment variables from .env file
load_dotenv()

# --- Database and Redis Configuration ---
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)
ENRICHMENT_QUEUE_CHANNEL = "enrichment_queue"

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - [EnrichmentWorker] - %(message)s')

def get_db_connection():
    """Establishes and returns a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        logging.info("Successfully connected to the PostgreSQL database.")
        return conn
    except psycopg2.OperationalError as e:
        logging.error(f"Could not connect to the database: {e}")
        raise

def process_video(video_id: str, db_conn):
    """
    Orchestrates the enrichment process for a single video.
    """
    try:
        logging.info(f"Starting enrichment for video_id: {video_id}")

        # 1. Download Audio
        video_url, audio_path = download_audio(video_id)

        # 2. Transcribe Audio
        transcript, language, raw_output = transcribe_audio(audio_path)

        # 3. Save to Database
        with db_conn.cursor() as cur:
            logging.info(f"Saving transcript for video_id: {video_id} to the database.")
            cur.execute(
                """
                INSERT INTO video_features (video_id, audio_transcript, detected_language, enrichment_status)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (video_id) DO UPDATE SET
                    audio_transcript = EXCLUDED.audio_transcript,
                    detected_language = EXCLUDED.detected_language,
                    enrichment_status = EXCLUDED.enrichment_status,
                    last_updated = CURRENT_TIMESTAMP;
                """,
                (video_id, transcript, language, 'transcribed')
            )
            db_conn.commit()
            logging.info(f"Successfully saved transcript for video_id: {video_id}")

    except Exception as e:
        logging.error(f"An error occurred during the enrichment process for video_id: {video_id}. Error: {e}")
        # Optionally, update status to 'failed' in DB
        with db_conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO video_features (video_id, enrichment_status)
                VALUES (%s, %s)
                ON CONFLICT (video_id) DO UPDATE SET
                    enrichment_status = EXCLUDED.enrichment_status,
                    last_updated = CURRENT_TIMESTAMP;
                """,
                (video_id, 'failed')
            )
            db_conn.commit()

def main():
    """
    The main worker function. Connects to Redis and listens for tasks.
    """
    logging.info("Data Enrichment Worker is starting up...")
    db_conn = get_db_connection()
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
    
    pubsub = redis_client.pubsub()
    pubsub.subscribe(ENRICHMENT_QUEUE_CHANNEL)
    logging.info(f"Subscribed to Redis channel: '{ENRICHMENT_QUEUE_CHANNEL}'")

    try:
        for message in pubsub.listen():
            if message['type'] == 'message':
                video_id = message['data']
                logging.info(f"Received new task for video_id: {video_id}")
                process_video(video_id, db_conn)
    except KeyboardInterrupt:
        logging.info("Worker shutting down gracefully.")
    except Exception as e:
        logging.error(f"A critical error occurred in the worker loop: {e}")
    finally:
        if db_conn:
            db_conn.close()
            logging.info("Database connection closed.")
        pubsub.close()
        logging.info("Redis subscription closed.")

if __name__ == "__main__":
    main()
