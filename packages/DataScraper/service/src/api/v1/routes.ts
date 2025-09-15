import { Router } from 'express';
import { discoverAndScrapeWorkflow } from './controllers/discover-and-scrape';

const router = Router();

router.post('/workflow/discover-and-scrape', discoverAndScrapeWorkflow);

export default router; 