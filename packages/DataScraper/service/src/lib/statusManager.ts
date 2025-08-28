import { WorkflowStatusAPI } from '@zeruel/types';
import { eventBus } from './eventBus';
import { Logger } from './logger';


const DEFAULT_STEPS: Record<string, Record<string, WorkflowStatusAPI.Step.Type>> = {
    idle: {},
    initialization: {
        api_request_received: {
            label: 'API_REQUEST_RECEIVED',
            description: 'Validating parameters',
            variant: 'pending'
        },
        browser_manager_init: {
            label: 'BROWSER_MANAGER_INIT',
            description: 'Initializing persistent browser',
            variant: 'pending'
        }
    },
    discovery: {
        navigation: {
            label: 'NAVIGATION',
            description: 'Navigating to hashtag page',
            variant: 'pending'
        },
        scroll_automation: {
            label: 'SCROLL_AUTOMATION',
            description: 'Scrolling to load video grid',
            variant: 'pending'
        }
    },
    analysis: {
        db_query: {
            label: 'DB_QUERY',
            description: 'Checking for existing videos in database',
            variant: 'pending'
        },
        job_classification: {
            label: 'JOB_CLASSIFICATION',
            description: 'Categorizing new vs. update jobs',
            variant: 'pending'
        },
        workload_ready: {
            label: 'WORKLOAD_READY',
            description: 'Analysis complete, harvest queue populated',
            variant: 'pending'
        }
    },
    scraping: {
        batch_processing: {
            label: 'BATCH_PROCESSING',
            description: 'Processing videos in batches',
            variant: 'pending'
        },
        rate_limit_delays: {
            label: 'RATE_LIMIT_DELAY',
            description: 'Applying human-like delays',
            variant: 'pending'
        },
        data_persistence: {
            label: 'DATA_PERSISTENCE',
            description: 'Saving data to database',
            variant: 'pending'
        },
    },
    finalizing: {
        browser_shutdown: {
            label: 'BROWSER_SHUTDOWN',
            description: 'Closing browser instance',
            variant: 'pending'
        }
    },
    success: {
        success: {
            label: 'SUCCESS',
            description: 'The operation completed successfully.',
            variant: "completed"
        }
    },
    error: {
        error: {
            label: 'ERROR',
            description: 'An unrecoverable error occurred.',
            variant: "failed"
        }
    }
}

class WorkflowStatusManager {
    private currentStatus: WorkflowStatusAPI.Type;
    private static instance: WorkflowStatusManager;

    private stages: Record<string, { stage: WorkflowStatusAPI.Stage.Type; steps: Record<string, WorkflowStatusAPI.Step.Type> }> = {
        idle: {
            stage: { title: 'IDLE:  AWAITING  WORKFLOW  REQUEST', variant: 'INFO' },
            steps: DEFAULT_STEPS["idle"]
        },
        initialization: {
            stage: { title: 'INITIALIZING...', variant: 'TASK' },
            steps: DEFAULT_STEPS["initialization"]
        },
        discovery: {
            stage: { title: 'STAGE 1:  DISCOVERING  VIDEOS', variant: 'TASK' },
            steps: DEFAULT_STEPS["discovery"]
        },
        analysis: {
            stage: { title: 'STAGE 2:  ANALYZING  WORKLOAD', variant: 'TASK' },
            steps: DEFAULT_STEPS["analysis"]
        },
        scraping: {
            stage: { title: 'STAGE 3:  SCRAPING  DATA', variant: 'TASK' },
            steps: DEFAULT_STEPS["scraping"]
        },
        finalizing: {
            stage: { title: 'STAGE 4:  FINALIZING', variant: 'TASK' },
            steps: DEFAULT_STEPS["finalizing"]
        },
        success: {
            stage: { title: 'FINSHED:  WORKFLOW  SUCCESSFUL', variant: 'SUCCESS' },
            steps: DEFAULT_STEPS["success"]
        },
        error: {
            stage: { title: 'ERROR:  WORKFLOW  FAILED', variant: 'FAILURE' },
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

    private broadcast(payload: WorkflowStatusAPI.Payload.Type) {
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

    public updateStep(stepId: string, variant?: WorkflowStatusAPI.Step.Variant, description?: string) {
        const step = this.currentStatus.steps[stepId];
        if (step) {
            step.variant = variant;
            if (description) {
                step.description = description;
            }
            this.broadcast({
                ...step,
                action: "UPDATE_STEP",
                stepId,
                variant,
                description
            });
        }
        else {
            console.error("Could not update step", stepId, ". No such step exists");
        }
        return this
    }

    public removeStep(stepId: string, variant?: WorkflowStatusAPI.Step.Variant, description?: string, delayMs?: number){
        const step = this.currentStatus.steps[stepId];
        if(step){
            this.broadcast({
                action: "REMOVE_STEP",
                stepId,
                delayMs,
                variant,
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

