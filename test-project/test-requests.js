import http from 'http';

const BASE_URL = 'localhost';
const PORT = 3000;

// Función helper para hacer requests HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ExpressRouter-Test-Client/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Función para esperar un tiempo determinado
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test suite
async function runTests() {
  console.log('🧪 Iniciando suite de pruebas para ExpressRouter\n');

  const tests = [
    // Test básicos
    { name: 'Server Info', method: 'GET', path: '/' },
    { name: 'Status Check', method: 'GET', path: '/api/status' },

    // Tests de usuarios
    { name: 'Get Users', method: 'GET', path: '/api/users' },
    { name: 'Get User by ID', method: 'GET', path: '/api/users/1' },
    { name: 'Create User', method: 'POST', path: '/api/users', data: { name: 'Test User', email: 'test@example.com' } },
    { name: 'Get Non-existent User', method: 'GET', path: '/api/users/999' },

    // Tests de productos
    { name: 'Get Products', method: 'GET', path: '/api/products' },
    { name: 'Get Products by Category', method: 'GET', path: '/api/products?category=electronics' },
    { name: 'Search Products', method: 'GET', path: '/api/products?search=laptop' },
    { name: 'Get Product Categories', method: 'GET', path: '/api/products/categories/list' },
    { name: 'Create Product', method: 'POST', path: '/api/products', data: { name: 'Test Product', price: 99.99, category: 'test' } },

    // Tests de autenticación
    { name: 'Login Success', method: 'POST', path: '/api/auth/login', data: { username: 'admin', password: 'admin123' } },
    { name: 'Login Failed', method: 'POST', path: '/api/auth/login', data: { username: 'invalid', password: 'invalid' } },
    { name: 'Verify Token (without token)', method: 'GET', path: '/api/auth/verify' },

    // Tests de status especiales
    { name: 'Slow Endpoint', method: 'GET', path: '/api/status/slow?delay=500' },
    { name: 'Error 400', method: 'GET', path: '/api/status/error?type=400' },
    { name: 'Error 404', method: 'GET', path: '/api/status/error?type=404' },
    { name: 'Error 500', method: 'GET', path: '/api/status/error?type=500' },
    { name: 'Random Response', method: 'GET', path: '/api/status/random' },

    // Tests de métricas
    { name: 'Get Metrics', method: 'GET', path: '/metrics' },
    { name: 'Get Metrics Report', method: 'GET', path: '/metrics/report' },

    // Test de endpoint no existente
    { name: 'Non-existent Endpoint', method: 'GET', path: '/api/nonexistent' }
  ];

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const testNum = `${(i + 1).toString().padStart(2, '0')}/${tests.length}`;

    try {
      console.log(`[${testNum}] Ejecutando: ${test.name}...`);

      const startTime = Date.now();
      const response = await makeRequest(test.method, test.path, test.data);
      const duration = Date.now() - startTime;

      // Determinar si el test pasó basado en el código de estado esperado
      let expectedStatus = 200;
      if (test.name.includes('Non-existent') || test.name.includes('Error 404')) {
        expectedStatus = 404;
      } else if (test.name.includes('Error 400')) {
        expectedStatus = 400;
      } else if (test.name.includes('Error 500')) {
        expectedStatus = 500;
      } else if (test.name.includes('Login Failed') || test.name.includes('Verify Token (without token)')) {
        expectedStatus = 401;
      } else if (test.name.includes('Create')) {
        expectedStatus = 201;
      }

      const statusMatch = response.statusCode === expectedStatus;
      const hasBody = response.body && typeof response.body === 'object';

      if (statusMatch && hasBody) {
        console.log(`     ✅ PASS - ${response.statusCode} (${duration}ms)`);
        passed++;
      } else {
        console.log(`     ❌ FAIL - Expected ${expectedStatus}, got ${response.statusCode} (${duration}ms)`);
        failed++;
      }

      // Mostrar información adicional para algunos tests
      if (test.name === 'Create User' && response.body?.success) {
        console.log(`     📝 Created user ID: ${response.body.data?.id}`);
      }

      if (test.name === 'Login Success' && response.body?.success) {
        console.log(`     🔑 Token: ${response.body.data?.token?.substring(0, 20)}...`);
      }

      // Pequeña pausa entre requests para no saturar
      await sleep(100);

    } catch (error) {
      console.log(`     ❌ ERROR - ${error.message}`);
      failed++;
    }
  }

  // Generar requests adicionales para poblar métricas
  console.log('\n📊 Generando requests adicionales para métricas...');

  const additionalRequests = [
    { path: '/api/users', count: 10 },
    { path: '/api/products', count: 8 },
    { path: '/api/status', count: 5 },
    { path: '/api/status/random', count: 15 },
    { path: '/api/products?category=electronics', count: 6 }
  ];

  for (const req of additionalRequests) {
    for (let i = 0; i < req.count; i++) {
      try {
        await makeRequest('GET', req.path);
        await sleep(50); // Pausa corta
      } catch (error) {
        // Ignorar errores en requests adicionales
      }
    }
  }

  // Resumen final
  console.log('\n📊 RESUMEN DE PRUEBAS:');
  console.log(`✅ Exitosas: ${passed}`);
  console.log(`❌ Fallidas: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  console.log(`🎯 Tasa de éxito: ${Math.round((passed / (passed + failed)) * 100)}%`);

  // Obtener métricas finales
  try {
    console.log('\n📈 Obteniendo métricas finales...');
    const metricsResponse = await makeRequest('GET', '/metrics');

    if (metricsResponse.body?.success) {
      const metrics = metricsResponse.body.data;
      console.log(`📊 Total de requests registrados: ${metrics.summary?.totalRequests || 0}`);
      console.log(`🛣️  Rutas únicas: ${metrics.summary?.uniqueRoutes || 0}`);
      console.log(`⚡ Promedio req/min: ${metrics.summary?.averageRequestsPerMinute || 0}`);

      if (metrics.routes && metrics.routes.length > 0) {
        console.log('\n🏆 Top 3 rutas más utilizadas:');
        metrics.routes.slice(0, 3).forEach((route, index) => {
          console.log(`   ${index + 1}. ${route.endpoint} - ${route.totalRequests} requests (${route.averageResponseTime}ms avg)`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Error obteniendo métricas finales:', error.message);
  }

  console.log('\n💡 Revisa el archivo test-metrics.log para ver los logs detallados');
  console.log('🌐 Visita http://localhost:3000/metrics para ver métricas en tiempo real');
  console.log('\n✨ Pruebas completadas!\n');
}

// Verificar si el servidor está ejecutándose
async function checkServer() {
  try {
    await makeRequest('GET', '/');
    return true;
  } catch (error) {
    return false;
  }
}

// Función principal
async function main() {
  console.log('🔍 Verificando si el servidor está ejecutándose...');

  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log('❌ El servidor no está ejecutándose en http://localhost:3000');
    console.log('💡 Ejecuta primero: npm start');
    process.exit(1);
  }

  console.log('✅ Servidor detectado, iniciando pruebas...\n');
  await runTests();
}

main().catch(console.error);