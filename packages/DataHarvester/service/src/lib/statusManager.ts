import { eventBus } from './eventBus';
import { SystemStatusUpdate, Stage, Step, StepStatus } from '@zeruel/harvester-types';

class StatusManager {
    private currentStatus: SystemStatusUpdate;
    private static instance: StatusManager;

    private stages: Record<string, { stage: Stage; steps: Step[] }> = {
        idle: {
            stage: { title: 'IDLE: AWAITING TASK', type: 'INFO' },
            steps: [{ id: 'idle', label: 'IDLE', description: 'System is ready and awaiting instructions.', status: 'pending' }]
        },
        initialization: {
            stage: { title: 'INITIALIZING...', type: 'TASK' },
            steps: [
                { id: 'api_request_received', label: 'API_REQUEST_RECEIVED', description: 'Validating parameters', status: 'pending' },
                { id: 'browser_manager_init', label: 'BROWSER_MANAGER_INIT', description: 'Initializing persistent browser', status: 'pending' },
                { id: 'browser_ready', label: 'BROWSER_READY', description: 'Browser ready for discovery', status: 'pending' }
            ]
        },
        discovery: {
            stage: { title: 'STAGE 1: DISCOVERING VIDEOS', type: 'TASK' },
            steps: [
                { id: 'navigation', label: 'NAVIGATION', description: 'Navigating to hashtag page', status: 'pending' },
                { id: 'scroll_automation', label: 'SCROLL_AUTOMATION', description: 'Scrolling to load video grid', status: 'pending' },
                { id: 'url_extraction', label: 'URL_EXTRACTION', description: 'Extracting video URLs from page', status: 'pending' }
            ]
        },
        analysis: {
            stage: { title: 'STAGE 2: ANALYZING WORKLOAD', type: 'TASK' },
            steps: [
                { id: 'db_query', label: 'DB_QUERY', description: 'Checking for existing videos in database', status: 'pending' },
                { id: 'job_classification', label: 'JOB_CLASSIFICATION', description: 'Categorizing new vs. update jobs', status: 'pending' },
                { id: 'workload_ready', label: 'WORKLOAD_READY', description: 'Analysis complete, harvest queue populated', status: 'pending' }
            ]
        },
        harvesting: {
            stage: { title: 'STAGE 3: HARVESTING DATA', type: 'TASK' },
            steps: [
                { id: 'batch_processing', label: 'BATCH_PROCESSING', description: 'Processing videos in batches', status: 'active' },
                { id: 'data_persistence', label: 'DATA_PERSISTENCE', description: 'Saving data to database', status: 'pending' },
                { id: 'rate_limit_delays', label: 'RATE_LIMIT_DELAYS', description: 'Applying human-like delays', status: 'pending' }
            ]
        },
        finalizing: {
            stage: { title: 'STAGE 4: FINALIZING', type: 'TASK' },
            steps: [
                { id: 'report_generation', label: 'REPORT_GENERATION', description: 'Compiling final harvest report', status: 'pending' },
                { id: 'browser_shutdown', label: 'BROWSER_SHUTDOWN', description: 'Closing browser instance', status: 'pending' },
                { id: 'process_complete', label: 'PROCESS_COMPLETE', description: 'Harvester run finished', status: 'pending' }
            ]
        },
        success: {
            stage: { title: 'COMPLETE: HARVEST SUCCESSFUL', type: 'SUCCESS' },
            steps: [{ id: 'success', label: 'SUCCESS', description: 'The operation completed successfully.', status: 'completed' }]
        },
        error: {
            stage: { title: 'ERROR: HARVEST FAILED', type: 'FAILURE' },
            steps: [{ id: 'error', label: 'ERROR', description: 'An unrecoverable error occurred.', status: 'failed' }]
        }
    };

    private constructor() {
        // this.currentStatus = this.stages.idle;
    }

    public static getInstance(): StatusManager {
        if (!StatusManager.instance) {
            StatusManager.instance = new StatusManager();
        }
        return StatusManager.instance;
    }

    private broadcast() {
        eventBus.emit('publish', {
            topic: 'harvester_system_status',
            payload: this.currentStatus
        });
    }

    public setStage(stageKey: keyof typeof this.stages) {
        if (this.stages[stageKey]) {
            this.currentStatus = JSON.parse(JSON.stringify(this.stages[stageKey])); // Deep copy to prevent mutation
            this.broadcast();
        }
    }

    public updateStep(stepId: string, status: StepStatus, description?: string) {
        if (this.currentStatus.steps.has(stepId)) {
            const step = this.currentStatus.steps.get(stepId)
            step.status = status;
            if (description) {
                step.description = description;
            }
            this.broadcast();
        }
        else {
            console.error("Could not update step", stepId, ". No such step exists");
        }
    }
}

export const statusManager = StatusManager.getInstance(); 