import express from 'express';

const router = express.Router();

// GET /status - Health check del servidor
router.get('/', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        human: formatUptime(uptime)
      },
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
      },
      nodeVersion: process.version,
      platform: process.platform
    },
    message: 'Servidor funcionando correctamente'
  });
});

// GET /status/slow - Endpoint lento para testing de métricas
router.get('/slow', (req, res) => {
  const delay = parseInt(req.query.delay) || 2000;

  setTimeout(() => {
    res.json({
      success: true,
      data: {
        message: 'Respuesta lenta simulada',
        delay: delay,
        timestamp: new Date().toISOString()
      }
    });
  }, delay);
});

// GET /status/error - Endpoint que genera errores para testing
router.get('/error', (req, res) => {
  const errorType = req.query.type || 'generic';

  switch (errorType) {
    case '400':
      return res.status(400).json({
        success: false,
        error: 'Bad Request simulado'
      });

    case '401':
      return res.status(401).json({
        success: false,
        error: 'Unauthorized simulado'
      });

    case '404':
      return res.status(404).json({
        success: false,
        error: 'Not Found simulado'
      });

    case '500':
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error simulado'
      });

    default:
      return res.status(418).json({
        success: false,
        error: 'I\'m a teapot - Error personalizado para testing'
      });
  }
});

// GET /status/random - Endpoint con respuestas aleatorias
router.get('/random', (req, res) => {
  const random = Math.random();

  // 70% success, 20% client error, 10% server error
  if (random < 0.7) {
    res.json({
      success: true,
      data: {
        message: 'Respuesta exitosa aleatoria',
        randomValue: Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString()
      }
    });
  } else if (random < 0.9) {
    res.status(400).json({
      success: false,
      error: 'Error de cliente aleatorio'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Error de servidor aleatorio'
    });
  }
});

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export default router;