import { Router } from "express";
import { getAllVideoIds, getVideos } from "./controllers/videos";
import { getVideoFeatures } from "./controllers/videoFeatures";
import { getComments } from "./controllers/comments";
import { getTableSchema } from "./controllers/schemas";
import { 
    getTableColumns, 
    getTableConstraints, 
    getTableIndexes, 
    getTableTriggers 
} from "./controllers/tableDetails";

const router = Router()

router.get('/videos', getVideos)
router.get('/videos/ids', getAllVideoIds)
router.get('/video_features', getVideoFeatures)
router.get('/comments', getComments)
router.get('/tables/:tableName/schema', getTableSchema)

router.get('/tables/:tableName/columns', getTableColumns)
router.get('/tables/:tableName/constraints', getTableConstraints)
router.get('/tables/:tableName/indexes', getTableIndexes)
router.get('/tables/:tableName/triggers', getTableTriggers)


export default router