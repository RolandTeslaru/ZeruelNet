import { Router } from "express";
import { getVideoFeatures, getVideos } from "./controller";

const router = Router()

// router.get('/trends/sentiment')
// router.get('/trends/volume')
// router.get('/trends/momentum')
router.get('/videos', getVideos)
router.get('/videofeatures', getVideoFeatures)


export default router