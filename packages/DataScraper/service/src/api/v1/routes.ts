import { Router } from 'express';
import { discoverAndScrapeWorkflow } from './controllers/discover-and-scrape';
import { cancelCurrentWorkflow } from './controllers/cancel-current-workflow';

const router = Router();

router.post('/workflow/discover-and-scrape', discoverAndScrapeWorkflow);
router.post('/workflow/cancel-current-workflow', cancelCurrentWorkflow);

export default router; 