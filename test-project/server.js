import express from 'express';
import { initializeAutoRouter } from '../index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para CORS (permitir requests desde cualquier origen en testing)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware de logging simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

async function startServer() {
  try {
    console.log('🚀 Iniciando servidor de prueba...');
    console.log('📁 Cargando rutas desde ./modules/');

    // Inicializar ExpressRouter con métricas habilitadas
    const router = await initializeAutoRouter({
      modulesPath: './modules',
      enableMetrics: true,
      metricsLogPath: './test-metrics.log'
    });

    // Montar las rutas automáticas
    app.use('/api', router);

    // Endpoint raíz con información del servidor
    app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Servidor de prueba ExpressRouter',
        version: '1.0.0',
        endpoints: {
          users: '/api/users',
          products: '/api/products',
          auth: '/api/auth',
          status: '/api/status',
          metrics: '/metrics'
        },
        documentation: {
          readme: 'Ver README.md para documentación completa',
          testInstructions: 'Ver TEST.md para instrucciones de prueba'
        }
      });
    });

    // Endpoint para ver métricas en tiempo real
    app.get('/metrics', (req, res) => {
      const metrics = router.getMetrics();

      if (!metrics) {
        return res.json({
          success: false,
          error: 'Métricas no disponibles (posiblemente deshabilitadas)'
        });
      }

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    });

    // Endpoint para generar reporte
    app.get('/metrics/report', async (req, res) => {
      try {
        const report = router.generateReport();
        res.json({
          success: true,
          data: report,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error generando reporte: ' + error.message
        });
      }
    });

    // Endpoint para reporte diario
    app.get('/metrics/daily', async (req, res) => {
      try {
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const report = await router.getDailyReport(date);
        res.json({
          success: true,
          data: report,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error generando reporte diario: ' + error.message
        });
      }
    });

    // Endpoint para reporte de resumen
    app.get('/metrics/summary', async (req, res) => {
      try {
        const days = parseInt(req.query.days) || 7;
        const report = await router.getSummaryReport(days);
        res.json({
          success: true,
          data: report,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error generando reporte de resumen: ' + error.message
        });
      }
    });

    // Manejo de rutas no encontradas
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado',
        availableEndpoints: [
          'GET /',
          'GET /api/users',
          'POST /api/users',
          'GET /api/products',
          'POST /api/auth/login',
          'GET /api/status',
          'GET /metrics',
          'GET /metrics/report'
        ]
      });
    });

    // Manejo de errores global
    app.use((error, req, res, next) => {
      console.error('Error del servidor:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    });

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n✅ Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 Métricas: http://localhost:${PORT}/metrics`);
      console.log(`📋 Endpoints disponibles:`);
      console.log(`   • GET  /                    - Información del servidor`);
      console.log(`   • GET  /api/users           - Lista de usuarios`);
      console.log(`   • POST /api/users           - Crear usuario`);
      console.log(`   • GET  /api/products        - Lista de productos`);
      console.log(`   • POST /api/auth/login      - Autenticación`);
      console.log(`   • GET  /api/status          - Estado del servidor`);
      console.log(`   • GET  /api/status/slow     - Endpoint lento (testing)`);
      console.log(`   • GET  /api/status/error    - Endpoints con errores`);
      console.log(`   • GET  /metrics             - Métricas en tiempo real`);
      console.log(`   • GET  /metrics/report      - Reporte detallado`);
      console.log(`\n📈 Las métricas se guardan en: test-metrics.log`);
      console.log(`💡 Tip: Usa curl o Postman para probar los endpoints\n`);
    });

  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n🔄 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Cerrando servidor...');
  process.exit(0);
});

startServer();