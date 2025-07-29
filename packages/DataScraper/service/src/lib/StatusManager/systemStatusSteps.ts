import { SystemStep } from "@zeruel/scraper-types";

export const SYSTEM_STATUS_STEPS: Record<string, Record<string, SystemStep>> = {
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
    harvesting: {
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