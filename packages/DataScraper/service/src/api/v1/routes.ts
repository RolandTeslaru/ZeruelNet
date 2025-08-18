import { Router } from 'express';
import { startScrapeWorkflow } from './controller';

const router = Router();

// This is the endpoint our frontend will call to start a new workflow.
router.post('/workflow/full-scrape', startScrapeWorkflow);

export default router; 