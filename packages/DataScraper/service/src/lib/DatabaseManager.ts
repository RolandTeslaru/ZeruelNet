import { Pool } from "pg";
import { Logger } from "./logger";
import { ScrapedVideo } from "@zeruel/scraper-types";
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'zeruel_net',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432', 10),
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
                INSERT INTO videos (id, video_id, searched_hashtag, video_url, author_username, video_description, extracted_hashtags, platform, likes_count, share_count, comment_count, play_count, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
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
                    updated_at = NOW();
                `;
            const videoValues = [
                uuidv4(),
                videoData.video_id,
                videoData.searched_hashtag,
                videoData.video_url,
                videoData.author_username,
                videoData.video_description,
                videoData.extracted_hashtags,
                videoData.platform,
                videoData.stats.likes_count,
                videoData.stats.share_count,
                videoData.stats.comment_count,
                videoData.stats.play_count,
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
                        uuidv4(),
                        videoData.video_id,
                        comment.comment_id,
                        comment.parent_comment_id,
                        comment.author,
                        comment.text,
                        comment.likes_count,
                        comment.is_creator,
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
            const query = `
              SELECT video_id FROM videos WHERE video_id = ANY($1::text[])
            `;
            const result = await client.query(query, [videoIds]);
            const existingIds = new Set(result.rows.map(row => row.video_id));
            return existingIds;
        } catch (e) {
            Logger.error(`Error fetching existing video IDs from database:`, e);
            throw e;
        } finally {
            client.release();
        }
    }

}