import { Router } from 'express';
import { scrapeByHashtagWorkflow } from './controllers/scrapeByHashtag';
import { scrapeByVideoIdWorkflow } from './controllers/scrapeByVideoId';

const router = Router();

router.post('/workflow/scrape-by-hashtag', scrapeByHashtagWorkflow);
router.post('/workflow/scrape-by-video-id', scrapeByVideoIdWorkflow);

export default router; 