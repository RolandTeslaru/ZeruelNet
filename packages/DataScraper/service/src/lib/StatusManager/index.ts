import { SystemStatusUpdate, SystemStage, SystemStep, StepStatus } from '@zeruel/scraper-types';
import { eventBus } from '../eventBus';
import { SYSTEM_STATUS_STEPS } from './systemStatusSteps';


class StatusManager {
    private currentStatus: SystemStatusUpdate;
    private static instance: StatusManager;

    private stages: Record<string, { stage: SystemStage; steps: Record<string, SystemStep> }> = {
        idle: {
            stage: { title: 'IDLE: AWAITING TASK', type: 'INFO' },
            steps: SYSTEM_STATUS_STEPS["idle"]
        },
        initialization: {
            stage: { title: 'INITIALIZING...', type: 'TASK' },
            steps: SYSTEM_STATUS_STEPS["initialization"]
        },
        discovery: {
            stage: { title: 'STAGE 1: DISCOVERING VIDEOS', type: 'TASK' },
            steps: SYSTEM_STATUS_STEPS["discovery"]
        },
        analysis: {
            stage: { title: 'STAGE 2: ANALYZING WORKLOAD', type: 'TASK' },
            steps: SYSTEM_STATUS_STEPS["analysis"]
        },
        harvesting: {
            stage: { title: 'STAGE 3: HARVESTING DATA', type: 'TASK' },
            steps: SYSTEM_STATUS_STEPS["harvesting"]
        },
        finalizing: {
            stage: { title: 'STAGE 4: FINALIZING', type: 'TASK' },
            steps: SYSTEM_STATUS_STEPS["finalizing"]
        },
        success: {
            stage: { title: 'COMPLETE: HARVEST SUCCESSFUL', type: 'SUCCESS' },
            steps: SYSTEM_STATUS_STEPS["success"]
        },
        error: {
            stage: { title: 'ERROR: HARVEST FAILED', type: 'FAILURE' },
            steps: SYSTEM_STATUS_STEPS["error"]
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

    private broadcast() {
        eventBus.emit('publish', {
            topic: 'scraper_system_status',
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
        const step = this.currentStatus.steps[stepId];
        if (step) {
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

