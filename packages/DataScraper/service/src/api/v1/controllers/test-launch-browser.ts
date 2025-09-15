import { Request, Response } from 'express';
import { BrowserManager } from '../../../lib/browserManager';
import { Logger } from '../../../lib/logger';
import { statusManager } from '../../../lib/statusManager';

export const testLaunchBrowser = async (req: Request, res: Response) => {    
    statusManager
        .clearSteps()
        .setStage('initialization')
        .updateStep('api_request_received', 'completed')

    const browserManager = new BrowserManager();

    try {
        await browserManager
            .init()
            .then(() => {
                statusManager.updateStep('browser_manager_init', 'completed');
                Logger.info(`Browser Manager Successfully initialized`)
            })
            .catch((error) => {
                statusManager.updateStep('browser_manager_init', "failed", "Failed to retrieve persistent ctxt")
                Logger.error("BrowserManager failed to retrieve persistent context",error);
            })
        
            
    } catch (error) {
        statusManager.setStage('error');
    } finally {
        Logger.info('finished.');
        await shutdownBrowser(browserManager)
        // Set back to idle after a short delay to allow final messages to be sent.
    }
}; 


const shutdownBrowser = async (browserManager: BrowserManager) => {
    statusManager
        .setStage('finalizing')
        .updateStep('browser_shutdown', 'active');

    await browserManager.close();

    statusManager
        .updateStep('browser_shutdown', 'completed')
        .setStage("success")
}