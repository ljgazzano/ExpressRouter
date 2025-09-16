# ExpressRouter

Automatic route loading system for Express.js applications that automatically discovers and loads routes from your routes directory.

## Features

- 🚀 Automatic route discovery and loading
- 📁 Configurable routes directory path
- 📝 Detailed logging and console output
- ✅ Express.js dependency verification
- 🎨 Beautiful console formatting with colors and banners
- 📊 Route loading statistics and summaries
- 📈 **Built-in usage metrics and analytics tracking**
- 📋 **Automatic API usage logging to `Statics.ExpressRouter.log`**
- 🔍 **Detailed route performance analysis**
- 📊 **Daily and summary reports generation**

## Installation

```bash
npm install @ljgazzano/express-auto-router
```

### Prerequisites

This package requires Express.js v4.18.0+ or v5.x as a peer dependency. If you don't have Express.js installed:

```bash
npm install express
```

## Quick Start

### Basic Usage

```javascript
import express from 'express';
import { initializeAutoRouter } from '@ljgazzano/express-auto-router';

const app = express();

// Initialize with default routes directory (./routes)
const router = await initializeAutoRouter();
app.use('/', router);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Custom Modules Directory

```javascript
import express from 'express';
import { initializeAutoRouter } from '@ljgazzano/express-auto-router';
import path from 'path';

const app = express();

// Initialize with custom routes directory
const router = await initializeAutoRouter({
  modulesPath: path.join(process.cwd(), 'api', 'routes')
});

app.use('/api', router);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Configuration Options

The `initializeAutoRouter` function accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `modulesPath` | `string` | `"./routes"` | Path to the directory containing your route modules |
| `enableMetrics` | `boolean` | `true` | Enable/disable usage metrics tracking |
| `metricsLogPath` | `string` | `"Statics.ExpressRouter.log"` | Path to the metrics log file |

## Route Module Structure

Your route files must end with `.route.js` or `.route.ts` to be automatically loaded. Here's an example structure:

```
routes/
├── users/
│   ├── UsersList.route.js
│   └── UserProfile.route.js
├── products/
│   ├── ProductCatalog.route.js
│   └── ProductSearch.route.ts
├── auth/
│   ├── Login.route.js
│   └── Register.route.ts
└── Health.route.js
```

**Important:** Only files ending with `.route.js` or `.route.ts` will be automatically loaded by ExpressRouter.

**Examples of valid file names:**
- `Users.route.js` ✅
- `ProductCatalog.route.ts` ✅
- `MyCustomAPI.route.js` ✅
- `AuthRoutes.route.ts` ✅
- `index.js` ❌ (won't be loaded)
- `users.js` ❌ (won't be loaded)

Example route module (`routes/users/UsersList.route.js`):

```javascript
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Users list' });
});

router.post('/', (req, res) => {
  res.json({ message: 'User created' });
});

export default router;
```

## Error Handling

The package includes comprehensive error handling:

- **Missing Express.js**: Throws an error if Express.js v4.18.0+ or v5.x is not installed
- **Invalid routes directory**: Logs warnings for inaccessible directories
- **Route loading errors**: Detailed error reporting for failed route modules
- **Comprehensive logging**: All activities are logged for debugging

## Logging

ExpressRouter provides detailed logging including:

- Initialization progress
- Directory scanning results
- Successfully loaded routes
- Error details for failed routes
- Summary statistics

## Usage Metrics & Analytics

ExpressRouter automatically tracks usage metrics for all routes when enabled (default). This provides valuable insights into API usage patterns.

### Metrics Features

- **Request Tracking**: Count, response times, status codes
- **User Analytics**: Unique IPs, user agents
- **Route Performance**: Average response times, popularity scores
- **Error Monitoring**: Failed requests and error patterns
- **Daily/Weekly Reports**: Automated analytics reports

### Basic Metrics Usage

```javascript
import { initializeAutoRouter } from '@ljgazzano/express-auto-router';

// Initialize with metrics enabled (default)
const router = await initializeAutoRouter({
  enableMetrics: true,
  metricsLogPath: './logs/api-metrics.log'
});

// Access metrics programmatically
const currentMetrics = router.getMetrics();
console.log('Total requests:', currentMetrics.summary.totalRequests);

// Generate detailed report
const report = router.generateReport();
console.log('Top routes:', report.topRoutes);
```

### Disable Metrics

```javascript
const router = await initializeAutoRouter({
  enableMetrics: false  // Disable metrics tracking
});
```

### Generate Reports

```javascript
// Get daily report
const dailyReport = await router.getDailyReport(new Date());

// Get summary report (last 7 days)
const weeklyReport = await router.getSummaryReport(7);

// Clean old logs (keep last 30 days)
const removedEntries = await router.cleanOldLogs(30);
```

### Metrics Log Format

All metrics are logged to `Statics.ExpressRouter.log` in JSON format:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "method": "GET",
  "route": "/api/users",
  "statusCode": 200,
  "responseTime": 125,
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "requestId": 1453
}
```

## API Reference

### `initializeAutoRouter(options)`

Initializes the automatic router with the specified options.

**Parameters:**
- `options` (Object, optional): Configuration options
  - `modulesPath` (string): Custom path to routes directory
  - `enableMetrics` (boolean): Enable/disable metrics tracking (default: true)
  - `metricsLogPath` (string): Path to metrics log file (default: "Statics.ExpressRouter.log")

**Returns:**
- Promise<Router>: Express router instance with all loaded routes and metrics methods

**Throws:**
- Error: If Express.js is not found or if initialization fails

### Router Metrics Methods

When metrics are enabled, the returned router includes additional methods:

#### `router.getMetrics()`
Returns current metrics data including request counts, response times, and route statistics.

#### `router.generateReport()`
Generates a comprehensive report with top routes, slowest routes, and error analysis.

#### `router.getDailyReport(date)`
Generates a detailed report for a specific date.

#### `router.getSummaryReport(days)`
Generates a summary report for the specified number of days (default: 7).

#### `router.cleanOldLogs(days)`
Removes log entries older than the specified number of days (default: 30).

## Examples

### Express.js with TypeScript

```typescript
import express from 'express';
import { initializeAutoRouter } from '@ljgazzano/express-auto-router';

const app = express();

const startServer = async () => {
  try {
    const router = await initializeAutoRouter({
      modulesPath: './src/routes'
    });

    app.use('/api/v1', router);

    app.listen(3000, () => {
      console.log('Server running on port 3000');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

### Multiple Route Directories with Metrics

```javascript
import express from 'express';
import { initializeAutoRouter } from '@ljgazzano/express-auto-router';

const app = express();

const setupRoutes = async () => {
  // Load API routes with metrics
  const apiRouter = await initializeAutoRouter({
    modulesPath: './routes/api',
    enableMetrics: true,
    metricsLogPath: './logs/api-metrics.log'
  });

  // Load admin routes with separate metrics
  const adminRouter = await initializeAutoRouter({
    modulesPath: './routes/admin',
    enableMetrics: true,
    metricsLogPath: './logs/admin-metrics.log'
  });

  app.use('/api', apiRouter);
  app.use('/admin', adminRouter);

  // Set up metrics endpoint
  app.get('/metrics', (req, res) => {
    const apiMetrics = apiRouter.getMetrics();
    const adminMetrics = adminRouter.getMetrics();

    res.json({
      api: apiMetrics,
      admin: adminMetrics
    });
  });
};

setupRoutes().then(() => {
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
});
```

### Scheduled Reports

```javascript
import { initializeAutoRouter } from '@ljgazzano/express-auto-router';
import fs from 'fs/promises';

const router = await initializeAutoRouter({
  enableMetrics: true
});

// Generate daily reports automatically
setInterval(async () => {
  const report = await router.getDailyReport();
  const reportPath = `./reports/daily-${new Date().toISOString().split('T')[0]}.json`;

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`Daily report saved to: ${reportPath}`);
}, 24 * 60 * 60 * 1000); // Every 24 hours

// Clean old logs weekly
setInterval(async () => {
  const removed = await router.cleanOldLogs(30);
  console.log(`Cleaned ${removed} old log entries`);
}, 7 * 24 * 60 * 60 * 1000); // Every 7 days
```

## Troubleshooting

### Express.js Not Found

If you see an error about Express.js not being found:

1. Install Express.js: `npm install express`
2. Ensure it's listed in your `package.json` dependencies
3. Run `npm install` to install all dependencies

### Routes Not Loading

1. Check that your routes directory exists and contains files ending with `.route.js` or `.route.ts`
2. Ensure your route files (ending with `.route.js` or `.route.ts`) export Express router instances
3. Check the console output for detailed error messages
4. Verify file permissions on the routes directory

### Module Import Errors

1. Ensure your route files (`.route.js` or `.route.ts`) use valid ES6 module syntax
2. Check for syntax errors in your route files
3. Verify that all imported dependencies are installed

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on our GitHub repository.
