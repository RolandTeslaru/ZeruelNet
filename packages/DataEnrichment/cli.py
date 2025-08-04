import argparse
import logging
import os
import db
from run import process  

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - [EnrichmentCLI] - %(message)s')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--video-id',
        type=str,
        required=True,
        help='Video ID for tiktok video'
    )
    args = parser.parse_args()

    db_conn = None
    try:
        logging.info(f"Starting enrichment for video_id: {args.video_id}")
        
        db_conn = db.get_connection()
        
        process(args.video_id, db_conn)
        
        logging.info(f"Successfully finished processing for video_id: {args.video_id}")

    except Exception as e:
        logging.error(f"An error occurred during CLI processing for video_id {args.video_id}: {e}")
    finally:
        if db_conn:
            db_conn.close()
            logging.info("Database connection closed.")

if __name__ == "__main__":
    main() 