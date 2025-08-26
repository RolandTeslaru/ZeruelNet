import logging


def get_unprocessed_video_ids(conn, limit=20):
    query = """--sql
        SELECT v.video_id  FROM public.videos v
        LEFT JOIN public.video_features vf ON v.video_id = vf.video_id
        WHERE vf.video_id IS NULL
        ORDER BY v.created_at DESC
        LIMIT %s
    """

    try:
        with conn.cursor() as cur:
            cur.execute(query, (limit, ))
            results = cur.fetchall()
            video_ids = [item[0] for item in results]
            return video_ids
    except Exception as e:
        logging.error(f"Failed to fetch unprocessed video IDs: {e}")
        return []