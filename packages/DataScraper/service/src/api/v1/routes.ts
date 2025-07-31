import { Router } from 'express';
import { startScraper } from './controller';

const router = Router();

// This is the endpoint our frontend will call to start a new harvest job.
router.post('/harvest', startScraper);

export default router; 