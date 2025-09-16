import fs from 'fs/promises';
import path from 'path';
import { writeLog } from './logger.js';
import { logInfo, logSuccess, colors } from './console-formatter.js';

class StatisticsManager {
  constructor(logFilePath = 'Statics.ExpressRouter.log') {
    this.logFilePath = logFilePath;
  }

  async readStatistics() {
    try {
      const content = await fs.readFile(this.logFilePath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());

      const entries = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          return null;
        }
      }).filter(entry => entry !== null);

      return entries;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async generateDailyReport(date = new Date()) {
    const entries = await this.readStatistics();
    const targetDate = date.toISOString().split('T')[0];

    const dailyEntries = entries.filter(entry =>
      entry.timestamp && entry.timestamp.startsWith(targetDate) && entry.type !== 'METRICS_REPORT'
    );

    const report = {
      date: targetDate,
      totalRequests: dailyEntries.length,
      uniqueIps: new Set(dailyEntries.map(e => e.ip)).size,
      routes: {},
      methods: {},
      statusCodes: {},
      hourlyDistribution: {},
      averageResponseTime: 0,
      slowestRequests: [],
      errors: []
    };

    let totalResponseTime = 0;

    dailyEntries.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();

      if (!report.routes[entry.route]) {
        report.routes[entry.route] = {
          count: 0,
          methods: {},
          averageResponseTime: 0,
          totalResponseTime: 0
        };
      }

      report.routes[entry.route].count++;
      report.routes[entry.route].totalResponseTime += entry.responseTime || 0;
      report.routes[entry.route].averageResponseTime =
        Math.round(report.routes[entry.route].totalResponseTime / report.routes[entry.route].count);

      if (!report.routes[entry.route].methods[entry.method]) {
        report.routes[entry.route].methods[entry.method] = 0;
      }
      report.routes[entry.route].methods[entry.method]++;

      report.methods[entry.method] = (report.methods[entry.method] || 0) + 1;
      report.statusCodes[entry.statusCode] = (report.statusCodes[entry.statusCode] || 0) + 1;
      report.hourlyDistribution[hour] = (report.hourlyDistribution[hour] || 0) + 1;

      totalResponseTime += entry.responseTime || 0;

      if (entry.responseTime > 1000) {
        report.slowestRequests.push({
          route: entry.route,
          method: entry.method,
          responseTime: entry.responseTime,
          timestamp: entry.timestamp,
          ip: entry.ip
        });
      }

      if (entry.statusCode >= 400) {
        report.errors.push({
          route: entry.route,
          method: entry.method,
          statusCode: entry.statusCode,
          timestamp: entry.timestamp,
          ip: entry.ip
        });
      }
    });

    report.averageResponseTime = dailyEntries.length > 0 ?
      Math.round(totalResponseTime / dailyEntries.length) : 0;

    report.slowestRequests.sort((a, b) => b.responseTime - a.responseTime);
    report.slowestRequests = report.slowestRequests.slice(0, 10);

    const topRoutes = Object.entries(report.routes)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10);

    report.topRoutes = topRoutes.map(([route, data]) => ({
      route,
      requests: data.count,
      averageResponseTime: data.averageResponseTime
    }));

    return report;
  }

  async generateSummaryReport(days = 7) {
    const entries = await this.readStatistics();
    const now = new Date();
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

    const filteredEntries = entries.filter(entry =>
      entry.timestamp &&
      new Date(entry.timestamp) >= startDate &&
      entry.type !== 'METRICS_REPORT'
    );

    const summary = {
      period: `${days} days`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      totalRequests: filteredEntries.length,
      uniqueIps: new Set(filteredEntries.map(e => e.ip)).size,
      averageRequestsPerDay: Math.round(filteredEntries.length / days),
      mostActiveDay: null,
      performance: {
        averageResponseTime: 0,
        fastestResponse: Infinity,
        slowestResponse: 0
      },
      topRoutes: {},
      errorRate: 0
    };

    const dailyStats = {};
    let totalResponseTime = 0;
    let errorCount = 0;

    filteredEntries.forEach(entry => {
      const day = entry.timestamp.split('T')[0];
      dailyStats[day] = (dailyStats[day] || 0) + 1;

      if (!summary.topRoutes[entry.route]) {
        summary.topRoutes[entry.route] = 0;
      }
      summary.topRoutes[entry.route]++;

      if (entry.responseTime) {
        totalResponseTime += entry.responseTime;
        summary.performance.fastestResponse = Math.min(
          summary.performance.fastestResponse,
          entry.responseTime
        );
        summary.performance.slowestResponse = Math.max(
          summary.performance.slowestResponse,
          entry.responseTime
        );
      }

      if (entry.statusCode >= 400) {
        errorCount++;
      }
    });

    summary.performance.averageResponseTime = filteredEntries.length > 0 ?
      Math.round(totalResponseTime / filteredEntries.length) : 0;

    if (summary.performance.fastestResponse === Infinity) {
      summary.performance.fastestResponse = 0;
    }

    summary.errorRate = filteredEntries.length > 0 ?
      Math.round((errorCount / filteredEntries.length) * 100 * 100) / 100 : 0;

    const sortedDays = Object.entries(dailyStats).sort(([,a], [,b]) => b - a);
    if (sortedDays.length > 0) {
      summary.mostActiveDay = {
        date: sortedDays[0][0],
        requests: sortedDays[0][1]
      };
    }

    const sortedRoutes = Object.entries(summary.topRoutes).sort(([,a], [,b]) => b - a);
    summary.topRoutes = sortedRoutes.slice(0, 10).map(([route, count]) => ({
      route,
      requests: count
    }));

    return summary;
  }

  async writeReport(report, filename) {
    const reportPath = path.join(process.cwd(), filename);
    const reportContent = JSON.stringify(report, null, 2);

    await fs.writeFile(reportPath, reportContent, 'utf8');
    await writeLog('info', `Report written to: ${reportPath}`);

    return reportPath;
  }

  async displayMetricsSummary(metricsTracker) {
    const metrics = metricsTracker.getMetrics();

    console.log();
    logInfo(`📊 ${colors.bold}Metrics Summary${colors.reset}`);
    console.log(`${colors.gray}┌─────────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.gray}│${colors.reset} Total Requests: ${colors.cyan}${metrics.summary.totalRequests.toString().padEnd(23)}${colors.reset}${colors.gray}│${colors.reset}`);
    console.log(`${colors.gray}│${colors.reset} Unique Routes: ${colors.cyan}${metrics.summary.uniqueRoutes.toString().padEnd(24)}${colors.reset}${colors.gray}│${colors.reset}`);
    console.log(`${colors.gray}│${colors.reset} Avg Req/Min: ${colors.cyan}${metrics.summary.averageRequestsPerMinute.toString().padEnd(26)}${colors.reset}${colors.gray}│${colors.reset}`);
    console.log(`${colors.gray}│${colors.reset} Uptime: ${colors.cyan}${this._formatUptime(metrics.summary.uptime).padEnd(30)}${colors.reset}${colors.gray}│${colors.reset}`);
    console.log(`${colors.gray}└─────────────────────────────────────────┘${colors.reset}`);

    if (metrics.routes.length > 0) {
      console.log();
      logInfo(`🏆 ${colors.bold}Top 5 Routes${colors.reset}`);
      metrics.routes.slice(0, 5).forEach((route, index) => {
        const position = `${index + 1}.`.padEnd(3);
        const endpoint = route.endpoint.padEnd(25);
        const requests = route.totalRequests.toString().padStart(6);
        const avgTime = `${route.averageResponseTime}ms`.padStart(8);

        console.log(`${colors.dim}${position}${colors.reset} ${colors.blue}${endpoint}${colors.reset} ${colors.green}${requests}${colors.reset} req ${colors.yellow}${avgTime}${colors.reset}`);
      });
    }

    console.log();
    logSuccess(`📝 Metrics logged to: ${colors.dim}${metricsTracker.logFilePath}${colors.reset}`);
  }

  _formatUptime(uptimeMs) {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  async cleanOldLogs(daysToKeep = 30) {
    try {
      const entries = await this.readStatistics();
      const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));

      const filteredEntries = entries.filter(entry =>
        entry.timestamp && new Date(entry.timestamp) >= cutoffDate
      );

      const newContent = filteredEntries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      await fs.writeFile(this.logFilePath, newContent, 'utf8');

      const removedCount = entries.length - filteredEntries.length;
      if (removedCount > 0) {
        await writeLog('info', `Cleaned ${removedCount} old log entries (older than ${daysToKeep} days)`);
      }

      return removedCount;
    } catch (error) {
      await writeLog('error', 'Error cleaning old logs', error.message);
      return 0;
    }
  }
}

export { StatisticsManager };