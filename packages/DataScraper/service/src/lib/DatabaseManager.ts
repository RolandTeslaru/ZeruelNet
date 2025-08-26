import { Pool } from "pg";
import { Logger } from "./logger";
import { v4 as uuidv4 } from 'uuid';
import { ScrapedVideo } from "@zeruel/scraper-types";

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    statement_timeout: 30000, 
});


export class DatabaseManager {

    private static instance: DatabaseManager;
    
    public static getInstance(): DatabaseManager {
        if(!DatabaseManager.instance)
            DatabaseManager.instance = new DatabaseManager();
        return DatabaseManager.instance
    }

    private constructor() {}

    public static async saveVideo(videoData: ScrapedVideo): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const videoInsertQuery = `--sql
                INSERT INTO videos (id, video_id, searched_hashtag, video_url, author_username, video_description, extracted_hashtags, platform, likes_count, share_count, comment_count, play_count, created_at, upload_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
                ON CONFLICT (video_id) DO UPDATE SET
                    searched_hashtag = EXCLUDED.searched_hashtag,
                    video_url = EXCLUDED.video_url,
                    author_username = EXCLUDED.author_username,
                    video_description = EXCLUDED.video_description,
                    extracted_hashtags = EXCLUDED.extracted_hashtags,
                    likes_count = EXCLUDED.likes_count,
                    share_count = EXCLUDED.share_count,
                    comment_count = EXCLUDED.comment_count,
                    play_count = EXCLUDED.play_count,
                    upload_date = EXCLUDED.upload_date,
                    updated_at = NOW();
                `;

            const videoValues = [
                uuidv4(),                       // 1
                videoData.video_id,             // 2
                videoData.searched_hashtag,     // 3
                videoData.video_url,            // 4
                videoData.author_username,      // 5
                videoData.video_description,    // 6
                videoData.extracted_hashtags,   // 7
                videoData.platform,             // 8
                videoData.stats.likes_count,    // 9
                videoData.stats.share_count,    // 10
                videoData.stats.comment_count,  // 11
                videoData.stats.play_count,     // 12
                videoData.upload_date           // 13
            ];
            await client.query(videoInsertQuery, videoValues);

            if (videoData.comments && videoData.comments.length > 0) {
                for (const comment of videoData.comments) {
                    const commentInsertQuery = `--sql
                        INSERT INTO comments (id, video_id, comment_id, parent_comment_id, author, text, likes_count, is_creator, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                        ON CONFLICT (comment_id) DO UPDATE SET
                            parent_comment_id = EXCLUDED.parent_comment_id,
                            author = EXCLUDED.author,
                            text = EXCLUDED.text,
                            likes_count = EXCLUDED.likes_count,
                            is_creator = EXCLUDED.is_creator,
                            updated_at = NOW();
                        `;
                    const commentValues = [
                        uuidv4(),                   // 1
                        videoData.video_id,         // 2
                        comment.comment_id,         // 3
                        comment.parent_comment_id,  // 4
                        comment.author,             // 5
                        comment.text,               // 6
                        comment.likes_count,        // 7
                        comment.is_creator,         // 8
                    ];
                    await client.query(commentInsertQuery, commentValues);
                }
            }

            await client.query('COMMIT');
            Logger.success(`Successfully saved video ${videoData.video_id} and its ${videoData.comments.length} comments.`);
        } catch (e) {
            await client.query('ROLLBACK');
            Logger.error(`Error saving video ${videoData.video_id} to database:`, e);
            throw e;
        } finally {
            client.release();
        }
    }

    public static async getStoredVideoIds(videoIds: string[]): Promise<Set<string>> {
        if (videoIds.length === 0) {
            return new Set();
        }

        const client = await pool.connect();
        try {
            const query = `--sql
              SELECT video_id FROM videos WHERE video_id = ANY($1::text[])
            `;
            const result = await client.query(query, [videoIds]);
            const existingIds = new Set(result.rows.map(row => row.video_id));
            return existingIds;
        } catch (e) {
            Logger.error(`Error fetching existing video IDs from database:`, e);
            throw e;
        } finally {
            // Relase the client connection in a try catch ( i dont know why it can fail but it crasehs the whole server)
            try {
                client.release();
            } catch (releaseError) {
                Logger.error('Error releasing database client:', releaseError);
            }
        }
    }

}