import { Router } from "express";
import { getVideos } from "./controllers/videos";
import { getVideoFeatures } from "./controllers/videoFeatures";
import { getComments } from "./controllers/comments";
import { getTableSchema } from "./controllers/schemas";

const router = Router()

router.get('/videos', getVideos)
router.get('/video_features', getVideoFeatures)
router.get('/comments', getComments)
router.get('/tables/:tableName/schema', getTableSchema)

export default router