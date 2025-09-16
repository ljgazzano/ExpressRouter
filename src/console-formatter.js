import { writeLog } from "./logger.js";

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m'
};

export function createBanner(text, color = colors.cyan, width = 70) {
  const padding = Math.max(0, Math.floor((width - text.length - 2) / 2));
  const line = '═'.repeat(width);
  const paddedText = ' '.repeat(padding) + text + ' '.repeat(padding);
  const adjustedText = paddedText.length > width - 2 ? paddedText.substring(0, width - 2) : paddedText;

  return `${color}${colors.bright}
╔${line}╗
║${adjustedText.padEnd(width)}║
╚${line}╝${colors.reset}`;
}

export function createBox(title, content, color = colors.blue) {
  const maxWidth = Math.max(title.length + 4, 50);
  const topLine = '┌' + '─'.repeat(maxWidth - 2) + '┐';
  const bottomLine = '└' + '─'.repeat(maxWidth - 2) + '┘';
  const titleLine = `│ ${colors.bright}${title}${colors.reset}${color}${' '.repeat(maxWidth - title.length - 3)}│`;

  let result = `${color}${topLine}\n${titleLine}\n`;

  if (Array.isArray(content)) {
    content.forEach((line, index) => {
      const displayLine = `${index + 1}.`.padStart(3) + ` ${line}`;
      const truncated = displayLine.length > maxWidth - 4 ? displayLine.substring(0, maxWidth - 7) + '...' : displayLine;
      result += `│ ${truncated.padEnd(maxWidth - 3)}│\n`;
    });
  } else {
    result += `│ ${content.padEnd(maxWidth - 3)}│\n`;
  }

  result += `${bottomLine}${colors.reset}`;
  return result;
}

export function logSuccess(message) {
  console.log(`${colors.green}${colors.bright}✓ ${message}${colors.reset}`);
}

export function logError(message) {
  console.log(`${colors.red}${colors.bright}✗ ${message}${colors.reset}`);
}

export function logWarning(message) {
  console.log(`${colors.yellow}${colors.bright}⚠ ${message}${colors.reset}`);
}

export function logInfo(message) {
  console.log(`${colors.cyan}${colors.bright}ℹ ${message}${colors.reset}`);
}

export async function logErrorWithDetails(message, details = null) {
  const timestamp = new Date().toISOString();
  console.error(`${colors.red}${colors.bright}[${timestamp}] ERROR: ${message}${colors.reset}`);
  if (details) {
    console.error(`${colors.gray}${colors.dim}${details}${colors.reset}`);
  }
  await writeLog('error', message, details);
}

export { colors };