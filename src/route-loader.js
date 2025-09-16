import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import { writeLog } from "./logger.js";
import { logError, logWarning, colors } from "./console-formatter.js";

export async function loadRoutes(folderPath, router, loadedRoutes = [], loadedRoutesUris = []) {
  let hasErrors = false;

  await writeLog('info', `Scanning directory: ${folderPath}`);

  try {
    const files = await fs.readdir(folderPath);
    await writeLog('info', `Found ${files.length} items in ${folderPath}`);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        await writeLog('info', `Entering subdirectory: ${filePath}`);
        const result = await loadRoutes(filePath, router, loadedRoutes, loadedRoutesUris);
        if (result.hasErrors) hasErrors = true;
      } else if (stats.isFile() && (file.endsWith("route.ts") || file.endsWith("route.js"))) {
        loadedRoutesUris.push(filePath);
        loadedRoutes.push(file);
        await writeLog('info', `Processing route file: ${filePath}`);

        try {
          const fileUrl = pathToFileURL(filePath).href;
          const { default: _routes } = await import(fileUrl);
          if (_routes) {
            router.use("/", _routes);
            await writeLog('success', `Route loaded successfully: ${filePath}`);
          } else {
            const warningMsg = `Route file "${filePath}" has no default export`;
            logWarning(warningMsg);
            await writeLog('warn', warningMsg);
          }
        } catch (error) {
          hasErrors = true;
          const errorMsg = `Failed to load route: ${filePath}`;
          logError(errorMsg);
          console.log(`${colors.gray}${colors.dim}   └─ ${error.message || error}${colors.reset}`);
          await writeLog('error', errorMsg, error.stack || error.message || error.toString());
        }
      }
    }
  } catch (error) {
    hasErrors = true;
    const errorMsg = `Error reading directory "${folderPath}"`;
    logError(errorMsg);
    console.log(`${colors.gray}${colors.dim}   └─ ${error.message || error}${colors.reset}`);
    await writeLog('error', errorMsg, error.stack || error.message || error.toString());
  }

  return { hasErrors, loadedRoutes, loadedRoutesUris };
}

export function createRouter(metricsTracker = null) {
  const router = Router();

  if (metricsTracker) {
    router.use((req, res, next) => {
      metricsTracker.track(req, res, next);
    });
  }

  return router;
}