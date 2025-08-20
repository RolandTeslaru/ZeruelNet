# Return all failed videos that have failed in the Enrichment process
def get_by_status(db_conn, status: str):
    VIDEOS_BY_STATUS_QUERY = """--sql
        SELECT video_id 
        FROM video_features 
        WHERE enrichment_status = %s
        ORDER BY last_enriched_at DESC
    """
    
    try:
        with db_conn.cursor() as cur:
            cur.execute(VIDEOS_BY_STATUS_QUERY, (status,))
            results = cur.fetchall()
            return [result[0] for result in results]
    except Exception as e:
        import logging
        logging.error("Failed to fetch video_ids with status '%s': %s", status, e)
        return []