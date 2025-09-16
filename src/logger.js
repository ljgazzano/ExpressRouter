import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, "..", "autoRouter.log");

function getTimestamp() {
  return new Date().toISOString();
}

export async function writeLog(level, message, details = null) {
  const timestamp = getTimestamp();
  let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (details) {
    logEntry += `\n${details}`;
  }

  logEntry += '\n';

  try {
    await fs.appendFile(LOG_FILE, logEntry, 'utf8');
  } catch (error) {
    console.error('Error writing to log file:', error.message);
  }
}