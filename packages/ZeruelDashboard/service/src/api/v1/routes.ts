import { Router } from "express";
import { getVideos } from "./controllers/videos";
import { getVideoFeatures } from "./controllers/videoFeatures";
import { getComments } from "./controllers/comments";

const router = Router()

// router.get('/trends/sentiment')
// router.get('/trends/volume')
// router.get('/trends/momentum')
router.get('/videos', getVideos)
router.get('/videofeatures', getVideoFeatures)
router.get('/comments', getComments)


export default router