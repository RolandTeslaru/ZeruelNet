import { Request, Response } from 'express';
import { Logger } from '../../../lib/logger';
import { statusManager } from '../../../lib/statusManager';
import { getCurrentWorkflowState } from './discover-and-scrape';

export const cancelCurrentWorkflow = async (req: Request, res: Response) => {
    const { isRunning, cancelFunction } = getCurrentWorkflowState();
    
    if (!isRunning) {
        Logger.info('No workflow is currently running');
        return res.status(200).json({ 
            message: 'No active workflows to cancel',
            status: 'idle' 
        });
    }
    
    if (!cancelFunction) {
        Logger.warn('Workflow is running but no cancel function available');
        return res.status(500).json({ 
            message: 'Cannot cancel workflow - no cancel function available',
            status: 'error' 
        });
    }
    
    try {
        Logger.info('Initiating workflow cancellation');
        res.status(202).json({ 
            message: 'Cancellation initiated. See WebSocket stream for status updates.',
            status: 'cancelling' 
        });
        
        // Trigger the cancellation
        await cancelFunction();
        
        Logger.info('Workflow cancellation completed');
    } catch (error) {
        Logger.error('Error during workflow cancellation:', error);
        statusManager.setStage('error');
    }
};