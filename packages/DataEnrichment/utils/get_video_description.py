def get_video_description(video_id: str, db_conn):
    VIDEO_DESCRIPTION_QUERY = """--sql
        SELECT video_description
        FROM public.videos
        WHERE video_id = %s
    """

    try:
        with db_conn.cursor() as cur:
            cur.execute(VIDEO_DESCRIPTION_QUERY, (str(video_id),))
            result = cur.fetchone()
            if result:
                return result[0]
            return None
    except Exception as e:
        import logging

        logging.error(
            "Failed to fetch video_description for video_id %s: %s", video_id, e
        )
        return None
