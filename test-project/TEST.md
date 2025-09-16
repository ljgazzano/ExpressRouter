# Guía de Prueba - ExpressRouter

Esta guía te ayudará a probar todas las funcionalidades del paquete ExpressRouter, incluyendo el sistema de métricas.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
cd test-project
npm install
```

### 2. Iniciar el Servidor

```bash
npm start
```

El servidor estará disponible en: http://localhost:3000

### 3. Ejecutar Pruebas Automáticas

En otra terminal:

```bash
npm test
```

## 📁 Estructura del Proyecto de Prueba

```
test-project/
├── package.json           # Configuración del proyecto
├── server.js              # Servidor principal con ExpressRouter
├── test-requests.js       # Suite de pruebas automáticas
├── test-metrics.log       # Archivo de métricas (se crea automáticamente)
└── modules/               # Rutas que se cargan automáticamente
    ├── users/
    │   └── index.route.js  # CRUD de usuarios
    ├── products/
    │   └── catalog.route.js # Catálogo de productos
    ├── auth/
    │   └── login.route.js  # Sistema de autenticación
    └── status.route.js     # Endpoints de estado y testing
```

## 🧪 Pruebas Manuales

### Endpoints Básicos

```bash
# Información del servidor
curl http://localhost:3000/

# Estado del servidor
curl http://localhost:3000/api/status

# Métricas en tiempo real
curl http://localhost:3000/metrics
```

### Pruebas de Usuarios

```bash
# Obtener todos los usuarios
curl http://localhost:3000/api/users

# Obtener usuario específico
curl http://localhost:3000/api/users/1

# Crear nuevo usuario
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Test","email":"juan@test.com","role":"user"}'

# Actualizar usuario
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Actualizado"}'

# Eliminar usuario
curl -X DELETE http://localhost:3000/api/users/3
```

### Pruebas de Productos

```bash
# Obtener todos los productos
curl http://localhost:3000/api/products

# Filtrar por categoría
curl "http://localhost:3000/api/products?category=electronics"

# Buscar productos
curl "http://localhost:3000/api/products?search=laptop"

# Filtrar por precio
curl "http://localhost:3000/api/products?minPrice=50&maxPrice=100"

# Obtener categorías
curl http://localhost:3000/api/products/categories/list

# Crear producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Nuevo Producto","price":199.99,"category":"test","stock":10}'
```

### Pruebas de Autenticación

```bash
# Login exitoso
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Login fallido
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"invalid","password":"invalid"}'

# Verificar token (reemplaza TOKEN_AQUI con un token real)
curl -H "Authorization: Bearer TOKEN_AQUI" \
  http://localhost:3000/api/auth/verify

# Ver sesiones activas (requiere token de admin)
curl -H "Authorization: Bearer TOKEN_AQUI" \
  http://localhost:3000/api/auth/sessions
```

### Pruebas de Rendimiento y Errores

```bash
# Endpoint lento (para testing de métricas)
curl "http://localhost:3000/api/status/slow?delay=1000"

# Diferentes tipos de errores
curl http://localhost:3000/api/status/error?type=400
curl http://localhost:3000/api/status/error?type=401
curl http://localhost:3000/api/status/error?type=404
curl http://localhost:3000/api/status/error?type=500

# Respuestas aleatorias
curl http://localhost:3000/api/status/random
```

## 📊 Verificación de Métricas

### Obtener Métricas Actuales

```bash
curl http://localhost:3000/metrics
```

### Generar Reportes

```bash
# Reporte general
curl http://localhost:3000/metrics/report

# Reporte diario
curl http://localhost:3000/metrics/daily

# Reporte de resumen (últimos 7 días)
curl http://localhost:3000/metrics/summary

# Reporte de resumen personalizado (últimos 3 días)
curl "http://localhost:3000/metrics/summary?days=3"
```

### Verificar Archivo de Log

```bash
# Ver las últimas entradas del log de métricas
tail -f test-metrics.log

# Contar líneas del archivo
wc -l test-metrics.log

# Ver primeras 10 entradas
head -10 test-metrics.log
```

## 🔍 Casos de Prueba Específicos

### 1. Verificar Carga Automática de Rutas

```bash
# Verificar que todas las rutas se cargaron correctamente
curl http://localhost:3000/api/users      # ✅ Debe funcionar
curl http://localhost:3000/api/products   # ✅ Debe funcionar
curl http://localhost:3000/api/auth/login # ✅ Debe funcionar
curl http://localhost:3000/api/status     # ✅ Debe funcionar
```

### 2. Verificar Tracking de Métricas

```bash
# Hacer varias requests
for i in {1..10}; do
  curl -s http://localhost:3000/api/users > /dev/null
  sleep 0.5
done

# Verificar que las métricas aumentaron
curl http://localhost:3000/metrics | jq '.data.summary.totalRequests'
```

### 3. Verificar Manejo de Errores

```bash
# Endpoint no existente
curl http://localhost:3000/api/nonexistent

# Request malformado
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"invalid":"json"'

# Request sin datos requeridos
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 📈 Interpretación de Métricas

### Estructura de Métricas

```json
{
  "summary": {
    "totalRequests": 150,
    "uptime": 300000,
    "averageRequestsPerMinute": 30,
    "uniqueRoutes": 8,
    "generatedAt": "2024-01-15T10:30:00.000Z"
  },
  "routes": [
    {
      "endpoint": "GET /api/users",
      "method": "GET",
      "route": "/api/users",
      "totalRequests": 45,
      "averageResponseTime": 125,
      "statusCodes": { "200": 43, "500": 2 },
      "firstAccess": "2024-01-15T10:00:00.000Z",
      "lastAccess": "2024-01-15T10:29:30.000Z",
      "uniqueVisitors": 3,
      "popularityScore": 85.5
    }
  ]
}
```

### Indicadores Clave

- **totalRequests**: Total de requests procesados
- **averageResponseTime**: Tiempo promedio de respuesta en ms
- **popularityScore**: Score calculado basado en uso y recencia
- **uniqueVisitors**: Número de IPs únicas que accedieron
- **statusCodes**: Distribución de códigos de respuesta

## 🚨 Troubleshooting

### Puerto en Uso

Si el puerto 3000 está ocupado:

```bash
# Cambiar puerto
PORT=3001 npm start
```

### Logs de Métricas No Se Crean

Verificar permisos de escritura:

```bash
# Verificar permisos del directorio
ls -la test-project/

# Crear archivo manualmente si es necesario
touch test-project/test-metrics.log
```

### Rutas No Se Cargan

Verificar estructura de archivos:

```bash
# Listar archivos de rutas
find test-project/modules -name "*.route.js"
```

### Requests Lentos

Ajustar timeouts en las pruebas o reducir delays:

```bash
# Endpoint rápido sin delay
curl http://localhost:3000/api/status/slow?delay=100
```

## 💡 Tips para Testing

1. **Usa herramientas como Postman** para pruebas más complejas
2. **Monitorea el archivo de log** con `tail -f` mientras haces requests
3. **Prueba diferentes user agents** para verificar tracking
4. **Genera carga** con herramientas como `ab` o `wrk` para stress testing
5. **Verifica métricas periódicamente** para confirmar que se actualizan

## 🎯 Objetivos de las Pruebas

Al completar estas pruebas deberías verificar:

- ✅ Carga automática de rutas desde `/modules`
- ✅ Tracking de métricas en tiempo real
- ✅ Generación de logs en `test-metrics.log`
- ✅ Endpoints de métricas funcionando
- ✅ Manejo correcto de errores
- ✅ Cálculo de estadísticas (tiempo de respuesta, popularidad, etc.)
- ✅ Funcionalidad completa del CRUD en los endpoints

¡Disfruta probando ExpressRouter! 🚀