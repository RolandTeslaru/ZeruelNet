import AudioProcessor, VideoProcessor, db
import logging
import redis
import os
from utils import download

logging.basicConfig(level=logging.INFO, format='%(levelname)s - [EnrichmentWorker] - %(message)s')

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)
ENRICHMENT_QUEUE_CHANNEL = "enrichment_queue"

def process(video_id: str, db_conn):
    try:
        logging.info("Starting data enrichment process")

        # Download the content
        video_url, video_path, audio_path = download.tiktok_full(video_id)

        # Run the Processors
        transcript, lang = AudioProcessor.process(audio_path)
        _ = VideoProcessor.process(video_path)

        # Upload to database





    except Exception as e:
        logging.error(f"Enrichment failed for video_id: {video_id} with error: {e}")
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