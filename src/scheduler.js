import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { runPipeline } from './pipeline.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, 'pipeline.log');
const ERROR_LOG = path.join(LOG_DIR, 'pipeline-errors.log');

// Redirect console output to log files
async function setupLogging() {
    await fs.mkdir(LOG_DIR, { recursive: true });
    
    const timestamp = new Date().toISOString();
    const logStream = await fs.open(LOG_FILE, 'a');
    const errorStream = await fs.open(ERROR_LOG, 'a');
    
    // Log start of run
    await logStream.write(`\n[${timestamp}] Starting scheduled pipeline run\n`);
    
    // Override console.log and console.error
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = async (...args) => {
        const message = args.map(arg => 
            typeof arg === 'string' ? arg : JSON.stringify(arg)
        ).join(' ');
        await logStream.write(`[${new Date().toISOString()}] ${message}\n`);
        originalLog.apply(console, args);
    };
    
    console.error = async (...args) => {
        const message = args.map(arg => 
            typeof arg === 'string' ? arg : JSON.stringify(arg)
        ).join(' ');
        await errorStream.write(`[${new Date().toISOString()}] ${message}\n`);
        originalError.apply(console, args);
    };
    
    return async () => {
        await logStream.close();
        await errorStream.close();
        console.log = originalLog;
        console.error = originalError;
    };
}

async function runScheduledPipeline() {
    const cleanup = await setupLogging();
    try {
        await runPipeline();
    } catch (error) {
        console.error('Scheduled pipeline failed:', error);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runScheduledPipeline();
} 