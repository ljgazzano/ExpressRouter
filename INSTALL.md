# Guía de Instalación - ExpressRouter

Esta guía te ayudará a instalar y configurar ExpressRouter en tu proyecto de Node.js.

## Requisitos Previos

- **Node.js**: Versión 14.0.0 o superior
- **Express.js**: Versión 4.18.0 o superior

## Instalación

### 1. Instalar ExpressRouter

```bash
npm install express-auto-router
```

### 2. Verificar/Instalar Express.js

ExpressRouter requiere Express.js como dependencia. Si no lo tienes instalado:

```bash
npm install express
```

### 3. Verificación de la Instalación

Puedes verificar que todo esté correctamente instalado ejecutando:

```bash
node -e "console.log('Express:', require('express/package.json').version); console.log('ExpressRouter: Instalado correctamente');"
```

## Configuración Inicial

### 1. Estructura de Directorios

Crea la estructura básica para tus rutas:

```
mi-proyecto/
├── package.json
├── index.js
└── modules/          # Directorio por defecto para rutas
    ├── users/
    │   └── index.js
    ├── products/
    │   └── index.js
    └── auth.js
```

### 2. Configuración Básica

Crea tu archivo principal (`index.js`):

```javascript
import express from 'express';
import { initializeAutoRouter } from 'express-auto-router';

const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar ExpressRouter
const router = await initializeAutoRouter();
app.use('/', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
```

### 3. Crear tu Primer Módulo de Rutas

Crea `modules/users/index.js`:

```javascript
import express from 'express';

const router = express.Router();

// GET /users
router.get('/', (req, res) => {
  res.json({
    message: 'Lista de usuarios',
    users: []
  });
});

// POST /users
router.post('/', (req, res) => {
  res.json({
    message: 'Usuario creado',
    user: req.body
  });
});

// GET /users/:id
router.get('/:id', (req, res) => {
  res.json({
    message: `Usuario ${req.params.id}`,
    id: req.params.id
  });
});

export default router;
```

## Configuración Avanzada

### Directorio Personalizado de Módulos

Si quieres usar un directorio diferente a `modules`:

```javascript
import path from 'path';
import { initializeAutoRouter } from 'express-auto-router';

const router = await initializeAutoRouter({
  modulesPath: path.join(process.cwd(), 'src', 'routes')
});
```

### Múltiples Directorios de Rutas

```javascript
// API routes
const apiRouter = await initializeAutoRouter({
  modulesPath: './modules/api'
});

// Admin routes
const adminRouter = await initializeAutoRouter({
  modulesPath: './modules/admin'
});

app.use('/api', apiRouter);
app.use('/admin', adminRouter);
```

### Configuración con TypeScript

Si usas TypeScript, instala las dependencias adicionales:

```bash
npm install -D @types/express typescript ts-node
```

Configura tu `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Package.json Recomendado

Asegúrate de que tu `package.json` incluya:

```json
{
  "name": "mi-proyecto",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "express-auto-router": "^1.0.0"
  }
}
```

## Solución de Problemas Comunes

### Error: "Express.js is required but not found"

**Solución:**
```bash
npm install express
```

### Error: "Cannot find module"

**Causa:** Problema con la configuración de ES modules.

**Solución:**
1. Asegúrate de tener `"type": "module"` en tu `package.json`
2. Usa extensiones `.js` en todas las importaciones

### Routes no se cargan

**Posibles causas y soluciones:**

1. **Directorio no existe:**
   ```bash
   mkdir modules
   ```

2. **Archivos no exportan router:**
   ```javascript
   // Correcto
   export default router;

   // Incorrecto
   module.exports = router;
   ```

3. **Permisos de archivo:**
   ```bash
   chmod 755 modules/
   chmod 644 modules/*.js
   ```

### Problemas con Paths en Windows

Si tienes problemas con rutas en Windows, usa:

```javascript
import path from 'path';

const router = await initializeAutoRouter({
  modulesPath: path.resolve(process.cwd(), 'modules')
});
```

## Scripts de Verificación

### Script para verificar la instalación

Crea `scripts/verify-installation.js`:

```javascript
#!/usr/bin/env node

import { initializeAutoRouter } from 'express-auto-router';
import fs from 'fs';

console.log('🔍 Verificando instalación de ExpressRouter...');

try {
  // Verificar Express
  await import('express');
  console.log('✅ Express.js encontrado');

  // Verificar directorio modules
  if (fs.existsSync('./modules')) {
    console.log('✅ Directorio modules existe');
  } else {
    console.log('⚠️  Directorio modules no existe - se creará automáticamente');
  }

  // Verificar inicialización
  const router = await initializeAutoRouter();
  console.log('✅ ExpressRouter inicializado correctamente');

  console.log('\n🎉 Instalación verificada exitosamente!');
} catch (error) {
  console.error('❌ Error durante la verificación:', error.message);
  process.exit(1);
}
```

Ejecutar la verificación:

```bash
node scripts/verify-installation.js
```

## Próximos Pasos

1. **Crear más módulos de rutas** en el directorio `modules/`
2. **Configurar middleware** específico para tus rutas
3. **Implementar manejo de errores** personalizado
4. **Configurar logging** según tus necesidades
5. **Revisar la documentación completa** en `README.md`

## Ayuda Adicional

Si necesitas ayuda adicional:

1. Revisa la documentación completa en `README.md`
2. Consulta los ejemplos en el repositorio
3. Reporta problemas en GitHub Issues

¡Ya estás listo para usar ExpressRouter en tu proyecto!