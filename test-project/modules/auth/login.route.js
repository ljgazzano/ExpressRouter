import express from 'express';

const router = express.Router();

// Simulamos usuarios para autenticación
const validUsers = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' },
  { username: 'test', password: 'test123', role: 'user' }
];

// Simulamos tokens activos (en producción usar JWT o similar)
let activeSessions = new Map();

// POST /auth/login - Iniciar sesión
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username y password son requeridos'
    });
  }

  // Simular delay de autenticación
  setTimeout(() => {
    const user = validUsers.find(u =>
      u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar token simple (en producción usar algo más seguro)
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    activeSessions.set(token, {
      username: user.username,
      role: user.role,
      loginTime: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          username: user.username,
          role: user.role
        }
      },
      message: 'Login exitoso'
    });
  }, Math.random() * 500 + 200); // 200-700ms delay
});

// POST /auth/logout - Cerrar sesión
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Token requerido'
    });
  }

  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }

  activeSessions.delete(token);

  setTimeout(() => {
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  }, Math.random() * 200 + 50);
});

// GET /auth/verify - Verificar token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Token requerido'
    });
  }

  const session = activeSessions.get(token);

  setTimeout(() => {
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          username: session.username,
          role: session.role
        },
        loginTime: session.loginTime
      },
      message: 'Token válido'
    });
  }, Math.random() * 150 + 25);
});

// GET /auth/sessions - Listar sesiones activas (solo admin)
router.get('/sessions', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = activeSessions.get(token);

  if (!session || session.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de administrador'
    });
  }

  const sessions = Array.from(activeSessions.entries()).map(([token, data]) => ({
    token: token.substring(0, 20) + '...',
    username: data.username,
    role: data.role,
    loginTime: data.loginTime
  }));

  setTimeout(() => {
    res.json({
      success: true,
      data: sessions,
      total: sessions.length
    });
  }, Math.random() * 200 + 100);
});

export default router;