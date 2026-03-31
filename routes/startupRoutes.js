import express from 'express';
import { requireAuth } from '@clerk/express';
import { analyzeAndInit, simulateAndProgress, scenarioPrompt, feedbackPrompt, getWatchlist, iterateProject, saveToWatchlist } from '../controllers/startupController.js';

const router = express.Router();

// Enforce authentication on all startup routes
router.use(requireAuth());

router.post('/analyze-startup', analyzeAndInit);
router.get('/watchlist', getWatchlist);
router.post('/iterate-startup', iterateProject);
router.post('/save-to-watchlist', saveToWatchlist);
router.post('/simulate-step', simulateAndProgress);
router.post('/generate-scenario', scenarioPrompt);
router.post('/feedback', feedbackPrompt);

export default router;
