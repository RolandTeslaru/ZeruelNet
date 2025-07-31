import { SystemStatusUpdate, SystemStage, SystemStep, StepStatus, T_SystemStatusAction, T_SystemStatusPayload } from '@zeruel/scraper-types';
import { eventBus } from './eventBus';


const DEFAULT_STEPS: Record<string, Record<string, SystemStep>> = {
    idle: {},
    initialization: {
        api_request_received: {
            label: 'API_REQUEST_RECEIVED',
            description: 'Validating parameters',
            status: 'pending'
        },
        browser_manager_init: {
            label: 'BROWSER_MANAGER_INIT',
            description: 'Initializing persistent browser',
            status: 'pending'
        },
        browser_ready: {
            label: 'BROWSER_READY',
            description: 'Browser ready for discovery',
            status: 'pending'
        }
    },
    discovery: {
        navigation: {
            label: 'NAVIGATION',
            description: 'Navigating to hashtag page',
            status: 'pending'
        },
        scroll_automation: {
            label: 'SCROLL_AUTOMATION',
            description: 'Scrolling to load video grid',
            status: 'pending'
        },
        url_extraction: {
            label: 'URL_EXTRACTION',
            description: 'Extracting video URLs from page',
            status: 'pending'
        }
    },
    analysis: {
        db_query: {
            label: 'DB_QUERY',
            description: 'Checking for existing videos in database',
            status: 'pending'
        },
        job_classification: {
            label: 'JOB_CLASSIFICATION',
            description: 'Categorizing new vs. update jobs',
            status: 'pending'
        },
        workload_ready: {
            label: 'WORKLOAD_READY',
            description: 'Analysis complete, harvest queue populated',
            status: 'pending'
        }
    },
    scraping: {
        batch_processing: {
            label: 'BATCH_PROCESSING',
            description: 'Processing videos in batches',
            status: 'pending'
        },
        data_persistence: {
            label: 'DATA_PERSISTENCE',
            description: 'Saving data to database',
            status: 'pending'
        },
        rate_limit_delays: {
            label: 'RATE_LIMIT_DELAYS',
            description: 'Applying human-like delays',
            status: 'pending'
        }
    },
    finalizing: {
        report_generation: {
            label: 'REPORT_GENERATION',
            description: 'Compiling final harvest report',
            status: 'pending'
        },
        browser_shutdown: {
            label: 'BROWSER_SHUTDOWN',
            description: 'Closing browser instance',
            status: 'pending'
        },
        process_complete: {
            label: 'PROCESS_COMPLETE',
            description: 'Harvester run finished',
            status: 'pending'
        }
    },
    success: {
        success: {
            label: 'SUCCESS',
            description: 'The operation completed successfully.',
            status: 'pending'
        }
    },
    error: {
        error: {
            label: 'ERROR',
            description: 'An unrecoverable error occurred.',
            status: 'pending'
        }
    }
}

class StatusManager {
    private currentStatus: SystemStatusUpdate;
    private static instance: StatusManager;

    private stages: Record<string, { stage: SystemStage; steps: Record<string, SystemStep> }> = {
        idle: {
            stage: { title: 'IDLE:  AWAITING  TASK  WORK', type: 'INFO' },
            steps: DEFAULT_STEPS["idle"]
        },
        initialization: {
            stage: { title: 'INITIALIZING...', type: 'TASK' },
            steps: DEFAULT_STEPS["initialization"]
        },
        discovery: {
            stage: { title: 'STAGE 1:  DISCOVERING  VIDEOS', type: 'TASK' },
            steps: DEFAULT_STEPS["discovery"]
        },
        analysis: {
            stage: { title: 'STAGE 2:  ANALYZING  WORKLOAD', type: 'TASK' },
            steps: DEFAULT_STEPS["analysis"]
        },
        harvesting: {
            stage: { title: 'STAGE 3:  SCRAPING  DATA', type: 'TASK' },
            steps: DEFAULT_STEPS["scraping"]
        },
        finalizing: {
            stage: { title: 'STAGE 4:  FINALIZING', type: 'TASK' },
            steps: DEFAULT_STEPS["finalizing"]
        },
        success: {
            stage: { title: 'FINSHED:  TASK  WORK  SUCCESSFUL', type: 'SUCCESS' },
            steps: DEFAULT_STEPS["success"]
        },
        error: {
            stage: { title: 'ERROR:  TASK  WORK  FAILED', type: 'FAILURE' },
            steps: DEFAULT_STEPS["error"]
        }
    };

    private constructor() {
        this.currentStatus = this.stages.idle;
    }

    public static getInstance(): StatusManager {
        if (!StatusManager.instance) {
            StatusManager.instance = new StatusManager();
        }
        return StatusManager.instance;
    }

    private broadcast(payload: T_SystemStatusPayload) {
        eventBus.broadcast("system_status", payload)
    }

    public setStage(stageKey: keyof typeof this.stages) {
        if (this.stages[stageKey]) {
            this.currentStatus = JSON.parse(JSON.stringify(this.stages[stageKey])); // Deep copy to prevent mutation
            this.broadcast({
                action: "SET_STAGE",
                stage: this.stages[stageKey].stage,
                steps: this.stages[stageKey].steps
            });
        }
    }

    public updateStep(stepId: string, status: StepStatus, description?: string) {
        const step = this.currentStatus.steps[stepId];
        if (step) {
            step.status = status;
            if (description) {
                step.description = description;
            }
            this.broadcast({
                action: "UPDATE_STEP",
                stepId,
                step: {
                    ...step,
                    status,
                    description
                }
            });
        }
        else {
            console.error("Could not update step", stepId, ". No such step exists");
        }
    }
}

export const statusManager = StatusManager.getInstance();

