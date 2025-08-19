import sys
import os
import logging
import json
from dotenv import load_dotenv

# Change cwd to the DataEnrichment root folder
data_enrichment_root_path = os.path.abspath(os.path.join(os.getcwd(), ".."))
os.chdir(data_enrichment_root_path)

if data_enrichment_root_path not in sys.path:
    sys.path.append(data_enrichment_root_path)

load_dotenv()

import db
from worker import process

db_conn = db.get_connection()

def get_all_video_ids_from_db(conn):
    """
    Fetches all video_id values directly from the videos table in the database.
    """
    VIDEO_IDS_QUERY = "SELECT video_id FROM public.videos"
    try:
        with conn.cursor() as cur:
            cur.execute(VIDEO_IDS_QUERY)
            # fetchall() returns a list of tuples, e.g., [('id1',), ('id2',)]
            # We use a list comprehension to flatten it into ['id1', 'id2']
            results = cur.fetchall()
            video_ids = [item[0] for item in results]
            return video_ids
    except Exception as e:
        logging.error(f"Failed to fetch video IDs directly from database: {e}")
        return []

if __name__ == "__main__":
    video_ids = get_all_video_ids_from_db(db_conn)
    if video_ids:
        logging.info(f"Successfully fetched {len(video_ids)} video IDs from the database.")
        # You can now iterate over these IDs and pass them to your worker
        for video_id in video_ids:
            process(video_id, db_conn)
    else:
        logging.warning("Could not fetch video IDs from the database, or the table is empty.")

    db_conn.close()
