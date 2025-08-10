import { z } from "zod"

export const videoSchema = z.object({
  id: z.string(),
  video_id: z.string(),
  searched_hashtag: z.string(),
  video_url: z.string().url(),
  author_username: z.string(),
  video_description: z.string(),
  extracted_hashtags: z.array(z.string()),
  platform: z.string(),
  likes_count: z.string(),
  share_count: z.string(),
  comment_count: z.string(),
  play_count: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  total_count: z.string(),
})

export type Video = z.infer<typeof videoSchema> 