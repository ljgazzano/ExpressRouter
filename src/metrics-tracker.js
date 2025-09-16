import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MetricsTracker {
  constructor(options = {}) {
    this.logFilePath = options.logFilePath || path.join(process.cwd(), 'Statics.ExpressRouter.log');
    this.metrics = new Map();
    this.startTime = Date.now();
    this.requestCount = 0;
    this.enabled = options.enabled !== false;
  }

  track(req, res, next) {
    if (!this.enabled) {
      return next();
    }

    const startTime = Date.now();
    this.requestCount++;

    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    const self = this;

    res.send = function(data) {
      self._recordMetric(req, res, startTime);
      return originalSend.call(this, data);
    };

    res.json = function(data) {
      self._recordMetric(req, res, startTime);
      return originalJson.call(this, data);
    };

    res.end = function(data) {
      self._recordMetric(req, res, startTime);
      return originalEnd.call(this, data);
    };

    next();
  }

  _recordMetric(req, res, startTime) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';

    const metricKey = `${method} ${route}`;

    if (!this.metrics.has(metricKey)) {
      this.metrics.set(metricKey, {
        method,
        route,
        count: 0,
        totalResponseTime: 0,
        averageResponseTime: 0,
        statusCodes: {},
        firstAccess: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
        uniqueIps: new Set(),
        userAgents: new Set()
      });
    }

    const metric = this.metrics.get(metricKey);
    metric.count++;
    metric.totalResponseTime += responseTime;
    metric.averageResponseTime = Math.round(metric.totalResponseTime / metric.count);
    metric.lastAccess = new Date().toISOString();
    metric.uniqueIps.add(ip);
    metric.userAgents.add(userAgent);

    if (!metric.statusCodes[statusCode]) {
      metric.statusCodes[statusCode] = 0;
    }
    metric.statusCodes[statusCode]++;

    this._writeToLog({
      timestamp: new Date().toISOString(),
      method,
      route,
      statusCode,
      responseTime,
      ip,
      userAgent: userAgent.substring(0, 100),
      requestId: this.requestCount
    });
  }

  _writeToLog(logEntry) {
    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(this.logFilePath, logLine, 'utf8');
    } catch (error) {
      console.error('Error writing to metrics log:', error);
    }
  }

  getMetrics() {
    const metricsData = {
      summary: {
        totalRequests: this.requestCount,
        uptime: Date.now() - this.startTime,
        averageRequestsPerMinute: Math.round((this.requestCount / ((Date.now() - this.startTime) / 60000)) * 100) / 100,
        uniqueRoutes: this.metrics.size,
        generatedAt: new Date().toISOString()
      },
      routes: []
    };

    for (const [key, metric] of this.metrics.entries()) {
      metricsData.routes.push({
        endpoint: key,
        method: metric.method,
        route: metric.route,
        totalRequests: metric.count,
        averageResponseTime: metric.averageResponseTime,
        statusCodes: metric.statusCodes,
        firstAccess: metric.firstAccess,
        lastAccess: metric.lastAccess,
        uniqueVisitors: metric.uniqueIps.size,
        popularityScore: this._calculatePopularityScore(metric)
      });
    }

    metricsData.routes.sort((a, b) => b.totalRequests - a.totalRequests);

    return metricsData;
  }

  _calculatePopularityScore(metric) {
    const requestWeight = metric.count * 0.6;
    const recentAccessWeight = this._getRecentAccessWeight(metric.lastAccess) * 0.3;
    const uniqueVisitorWeight = metric.uniqueIps.size * 0.1;

    return Math.round((requestWeight + recentAccessWeight + uniqueVisitorWeight) * 100) / 100;
  }

  _getRecentAccessWeight(lastAccess) {
    const now = Date.now();
    const lastAccessTime = new Date(lastAccess).getTime();
    const hoursSinceLastAccess = (now - lastAccessTime) / (1000 * 60 * 60);

    if (hoursSinceLastAccess < 1) return 100;
    if (hoursSinceLastAccess < 24) return 80;
    if (hoursSinceLastAccess < 168) return 60;
    return 20;
  }

  generateReport() {
    const metrics = this.getMetrics();
    const report = {
      ...metrics,
      topRoutes: metrics.routes.slice(0, 10),
      slowestRoutes: [...metrics.routes].sort((a, b) => b.averageResponseTime - a.averageResponseTime).slice(0, 5),
      errorRoutes: metrics.routes.filter(route =>
        Object.keys(route.statusCodes).some(code => parseInt(code) >= 400)
      ).slice(0, 5)
    };

    const reportLogEntry = {
      timestamp: new Date().toISOString(),
      type: 'METRICS_REPORT',
      report
    };

    this._writeToLog(reportLogEntry);
    return report;
  }

  clearMetrics() {
    this.metrics.clear();
    this.requestCount = 0;
    this.startTime = Date.now();
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

export { MetricsTracker };