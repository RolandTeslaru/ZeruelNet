import { WorkflowStatusPayload } from '@zeruel/scraper-types';
import { eventBus } from './eventBus';
import { WorkflowStatusStage, WorkflowStatusStep, WorkflowStatusStepStatus, WorkflowStatusSchema, WorkflowStatus } from '@zeruel/types';
import { Logger } from './logger';


const DEFAULT_STEPS: Record<string, Record<string, WorkflowStatusStep>> = {
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
        rate_limit_delays: {
            label: 'RATE_LIMIT_DELAY',
            description: 'Applying human-like delays',
            status: 'pending'
        },
        data_persistence: {
            label: 'DATA_PERSISTENCE',
            description: 'Saving data to database',
            status: 'pending'
        },
    },
    finalizing: {
        browser_shutdown: {
            label: 'BROWSER_SHUTDOWN',
            description: 'Closing browser instance',
            status: 'pending'
        }
    },
    success: {
        success: {
            label: 'SUCCESS',
            description: 'The operation completed successfully.',
            status: "completed"
        }
    },
    error: {
        error: {
            label: 'ERROR',
            description: 'An unrecoverable error occurred.',
            status: "failed"
        }
    }
}

class WorkflowStatusManager {
    private currentStatus: WorkflowStatus;
    private static instance: WorkflowStatusManager;

    private stages: Record<string, { stage: WorkflowStatusStage; steps: Record<string, WorkflowStatusStep> }> = {
        idle: {
            stage: { title: 'IDLE:  AWAITING  WORKFLOW  REQUEST', type: 'INFO' },
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
        scraping: {
            stage: { title: 'STAGE 3:  SCRAPING  DATA', type: 'TASK' },
            steps: DEFAULT_STEPS["scraping"]
        },
        finalizing: {
            stage: { title: 'STAGE 4:  FINALIZING', type: 'TASK' },
            steps: DEFAULT_STEPS["finalizing"]
        },
        success: {
            stage: { title: 'FINSHED:  WORKFLOW  SUCCESSFUL', type: 'SUCCESS' },
            steps: DEFAULT_STEPS["success"]
        },
        error: {
            stage: { title: 'ERROR:  WORKFLOW  FAILED', type: 'FAILURE' },
            steps: DEFAULT_STEPS["error"]
        }
    };

    private constructor() {
        this.currentStatus = this.stages.idle;
    }

    public static getInstance(): WorkflowStatusManager {
        if (!WorkflowStatusManager.instance) {
            WorkflowStatusManager.instance = new WorkflowStatusManager();
        }
        return WorkflowStatusManager.instance;
    }

    private broadcast(payload: WorkflowStatusPayload) {
        eventBus.broadcast("system_status", payload)
    }


    public get log(){
        return Logger
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
        return this
    }

    public updateStep(stepId: string, status: WorkflowStatusStepStatus, description?: string) {
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
                    status
                }
            });
        }
        else {
            console.error("Could not update step", stepId, ". No such step exists");
        }
        return this
    }

    public removeStep(stepId: string, status: WorkflowStatusStepStatus, description?: string, delayMs?: number){
        const step = this.currentStatus.steps[stepId];
        if(step){
            this.broadcast({
                action: "REMOVE_STEP",
                stepId,
                delayMs,
                status,
                description,
            })
        } else {
            console.error(`Remove Step `)
        }
        return this
    }

    public clearSteps(){
        this.broadcast({
            action: "CLEAR_STEPS"
        })

        return this
    }
}

export const statusManager = WorkflowStatusManager.getInstance();

