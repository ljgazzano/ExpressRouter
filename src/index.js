import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from 'module';
import { writeLog } from "./logger.js";
import { createBanner, createBox, logInfo, logSuccess, logError, colors } from "./console-formatter.js";
import { loadRoutes, createRouter } from "./route-loader.js";
import { MetricsTracker } from "./metrics-tracker.js";
import { StatisticsManager } from "./statistics-manager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkExpressDependency() {
  try {
    const require = createRequire(import.meta.url);
    require.resolve('express');
    return true;
  } catch (error) {
    return false;
  }
}

export async function initializeAutoRouter(options = {}) {
  if (!checkExpressDependency()) {
    const errorMsg = 'Express.js is required but not found. Please install it with: npm install express';
    logError(errorMsg);
    await writeLog('error', errorMsg);
    throw new Error(errorMsg);
  }

  const metricsEnabled = options.enableMetrics !== false;
  const logFilePath = options.metricsLogPath || 'Statics.ExpressRouter.log';

  let metricsTracker = null;
  let statisticsManager = null;

  if (metricsEnabled) {
    metricsTracker = new MetricsTracker({
      logFilePath,
      enabled: true
    });
    statisticsManager = new StatisticsManager(logFilePath);
  }

  const router = createRouter(metricsTracker);
  const modulesPath = options.modulesPath || path.join(__dirname, "..", "modules");

  await writeLog('info', '='.repeat(60));
  await writeLog('info', 'AutoRouter initialization started');
  await writeLog('info', `Target directory: ${modulesPath}`);

  logInfo(`Scanning directory: ${colors.dim}${modulesPath}${colors.reset}`);
  console.log();

  const { hasErrors, loadedRoutes, loadedRoutesUris } = await loadRoutes(modulesPath, router);

  if (!hasErrors) {
    const successMsg = `ExpressRouter loaded ${loadedRoutes.length} routes`;

    console.log(createBanner(`✅ ${successMsg}`, colors.green));
    console.log();

    if (loadedRoutesUris.length > 0) {
      const routesList = loadedRoutesUris.map(route => {
        const relativePath = path.relative(modulesPath, route);
        return relativePath.length < route.length ? relativePath : route;
      });

      console.log(createBox('📁 Loaded Routes', routesList, colors.blue));
    }

    await writeLog('success', successMsg);
    await writeLog('info', 'Loaded routes list:');

    for (const route of loadedRoutesUris) {
      await writeLog('info', `  - ${route}`);
    }

    await writeLog('info', 'AutoRouter initialization completed successfully');
    console.log();
    logSuccess('AutoRouter initialization completed successfully');

    if (metricsEnabled && statisticsManager) {
      await statisticsManager.displayMetricsSummary(metricsTracker);
    }

  } else {
    const errorMsg = "Errors occurred during route loading";

    console.log(createBanner('❌ Initialization Failed', colors.red));
    console.log();
    logError('Some routes could not be loaded. Check the logs above for details.');

    await writeLog('error', errorMsg);
    await writeLog('info', 'AutoRouter initialization completed with errors');
  }

  console.log();
  await writeLog('info', '='.repeat(60));

  if (metricsEnabled) {
    router.metricsTracker = metricsTracker;
    router.statisticsManager = statisticsManager;

    router.getMetrics = () => metricsTracker ? metricsTracker.getMetrics() : null;
    router.generateReport = () => metricsTracker ? metricsTracker.generateReport() : null;
    router.getDailyReport = (date) => statisticsManager ? statisticsManager.generateDailyReport(date) : null;
    router.getSummaryReport = (days) => statisticsManager ? statisticsManager.generateSummaryReport(days) : null;
    router.cleanOldLogs = (days) => statisticsManager ? statisticsManager.cleanOldLogs(days) : null;
  }

  return router;
}