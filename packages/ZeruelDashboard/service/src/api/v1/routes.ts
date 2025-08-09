import { Router } from "express";

const router = Router()

router.get('/trends/sentiment')
router.get('/trends/volume')
router.get('/trends/momentum')

export default router