import AudioProcessor, VideoProcessor, db
import redis
import os
import json
import AlignmentCalculator

from utils.get_video_description import get_video_description
from utils import download
from utils.download import RapidAPITiktokDownloaderError, VideoUnavailableError
from VideoProcessor.gemini import GEMINI_MODEL_NAME

import sqlQueries
from utils import vxlog

os.environ["TOKENIZERS_PARALLELISM"] = "false"

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
ENRICHMENT_QUEUE_CHANNEL = "enrichment_queue"

def process(video_id: str, db_conn):
    video_path, audio_path = None, None
    cleanup_files = True 

    try:
        vxlog.info("Starting data enrichment process for video_id: %s", video_id)

        # Download the content
        video_url, video_path, audio_path = download.tiktok_full(video_id)

        # Run the Processors
        transcript, lang, text_sentiment_analysis = AudioProcessor.process(audio_path)

        description = get_video_description(video_id, db_conn)

        analysis_result_json = VideoProcessor.process(video_path, video_id, transcript, text_sentiment_analysis, description)

        positive_sentiment = text_sentiment_analysis["positive"]
        negative_sentiment = text_sentiment_analysis["negative"]
        neutral_sentiment = text_sentiment_analysis["neutral"]

        polarity = positive_sentiment - negative_sentiment

        llm_summary = analysis_result_json["summary"]
        identified_subjects = analysis_result_json["identified_subjects"] 
        llm_overall_alignment = analysis_result_json["overall_alignment"]

        final_alignment, deterministic_alignment, alignment_conflict = AlignmentCalculator.calculate(
            identified_subjects, 
            llm_overall_alignment, 
            alpha=0.5
        )

        # Upload to database
        with db_conn.cursor() as cur:
            cur.execute(sqlQueries.UPDATE_SUCCESSFUL_ENRICHMENT_QUERY,
                (
                    video_id, transcript, lang, 'completed',
                    llm_summary, json.dumps(identified_subjects), llm_overall_alignment, GEMINI_MODEL_NAME,
                    final_alignment, deterministic_alignment, alignment_conflict,
                    positive_sentiment, negative_sentiment, neutral_sentiment, polarity
                )
            )
            db_conn.commit()
            vxlog.success(f"Successfully committed to database")

    # if video is deleted from tiktok set the status to "deleted"
    except VideoUnavailableError as e:
        vxlog.warning(f"{e}")
        db_conn.rollback()
        with db_conn.cursor() as cur:
            cur.execute(sqlQueries.UPDATE_ENRICHMENT_STATUS_ON_FAILURE_QUERY, (video_id, 'deleted'))
            db_conn.commit()
        cleanup_files = False  # Skip cleanup to retain files for debugging
    
    # If the api is down or there are issues with api key
    # except RapidAPITiktokDownloaderError as e:
    #     vxlog.error(f"{e}")
    #     db_conn.rollback()


    except Exception as e:
        vxlog.error(f"Enrichment failed for video_id: {video_id} with error: {e}")
        db_conn.rollback()
        with db_conn.cursor() as cur:
            cur.execute(sqlQueries.UPDATE_ENRICHMENT_STATUS_ON_FAILURE_QUERY, (video_id, 'failed'))
            db_conn.commit()
        cleanup_files = False  # Skip cleanup to retain files for debugging
    finally:
        # Remove the temporary audio and video files only if processing succeeded
        if cleanup_files:
            try:
                if video_path and os.path.exists(video_path):
                    os.remove(video_path)
                if audio_path and os.path.exists(audio_path):
                    os.remove(audio_path)
            except OSError as e:
                vxlog.error(f"Error removing temporary files: {e}")
        else:
            vxlog.info(f"Skipping cleanup becuase the enrichment failed for video {video_id}")

def main():
    vxlog.info("Data Enrichment is starting up")

    db_conn = db.get_connection()

    redis_client = redis.from_url(REDIS_URL, db=0, decode_responses=True)
    pubsub = redis_client.pubsub()
    pubsub.subscribe(ENRICHMENT_QUEUE_CHANNEL)
    vxlog.info(f"Subscribed to Redis channel: '{ENRICHMENT_QUEUE_CHANNEL}'")

    try:
        for payload in pubsub.listen():
            if payload['type'] == "message":
                video_id = payload['data']
                process(video_id, db_conn)

    except KeyboardInterrupt:
        vxlog.info("KeyboardInterrupt shutting down DataEnrichment Server")
    except Exception as e:
        vxlog.error(f"DataEnrichment critical error {e}")
    finally:
        if db_conn:
            db_conn.close()
        pubsub.close()

if __name__ == "__main__":
    main()

