import json
import psycopg2
import db


def migrate_knowledge_to_db():
    db_conn = db.get_connection()
    with open('knowledge.json') as f:
        knowledge = json.load(f)

    try:
        with db_conn.cursor() as cursor:
            # Clear existing data
            cursor.execute("DELETE FROM knowledge_subjects")

            insert_sql = """--sql
            INSERT INTO knowledge_subjects 
            (subject_name, category, country_code, alignment_tendency, weight, aliases)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
    
            for subject_name, data in knowledge.items():
                aliases = data.get('aliases', [])

                cursor.execute(insert_sql, (
                    subject_name,
                    data['category'],
                    data.get('country_code'),  # Can be None/NULL
                    data['alignment_tendency'],
                    data['weight'],
                    aliases
                ))

            db_conn.commit()
            print(f"Migration Complete")
    except Exception as e:
        print(f"Error migrating data: {e}")
        db_conn.rollback()
    finally:
        db_conn.close()


def verify_migration():
    """Verify the migration worked"""
    db_conn = db.get_connection()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM knowledge_subjects")
            count = cursor.fetchone()[0]
            print(f"📊 Total subjects in database: {count}")
            
            cursor.execute("""
                SELECT category, COUNT(*) 
                FROM knowledge_subjects 
                GROUP BY category 
                ORDER BY COUNT(*) DESC
            """)
            
            print("\n Subjects by category:")
            for category, count in cursor.fetchall():
                print(f"  {category}: {count}")
                
    except Exception as e:
        print(f"❌ Error verifying migration: {e}")
    finally:
        db_conn.close()


if __name__ == "__main__":
    print("🚀 Starting knowledge migration...")
    migrate_knowledge_to_db()
    verify_migration()
    print("Migration complete!")