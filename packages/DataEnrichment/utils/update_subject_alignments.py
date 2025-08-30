import json
import db

def add_alignment_proeprty():
    db_conn = db.get_connection()

    try:
        with db_conn.cursor() as cur:
            
    