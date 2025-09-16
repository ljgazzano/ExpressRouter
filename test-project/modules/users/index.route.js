import express from 'express';

const router = express.Router();

// Simulamos una base de datos simple
let users = [
  { id: 1, name: 'Juan Pérez', email: 'juan@email.com', role: 'admin' },
  { id: 2, name: 'María García', email: 'maria@email.com', role: 'user' },
  { id: 3, name: 'Carlos López', email: 'carlos@email.com', role: 'user' }
];

// GET /users - Obtener todos los usuarios
router.get('/', (req, res) => {
  // Simular delay para testing de métricas
  setTimeout(() => {
    res.json({
      success: true,
      data: users,
      total: users.length
    });
  }, Math.random() * 200 + 50); // 50-250ms delay
});

// GET /users/:id - Obtener usuario por ID
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Usuario no encontrado'
    });
  }

  setTimeout(() => {
    res.json({
      success: true,
      data: user
    });
  }, Math.random() * 100 + 25);
});

// POST /users - Crear nuevo usuario
router.post('/', (req, res) => {
  const { name, email, role = 'user' } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Nombre y email son requeridos'
    });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    role
  };

  users.push(newUser);

  setTimeout(() => {
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'Usuario creado exitosamente'
    });
  }, Math.random() * 300 + 100);
});

// PUT /users/:id - Actualizar usuario
router.put('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Usuario no encontrado'
    });
  }

  const { name, email, role } = req.body;
  const updatedUser = { ...users[userIndex] };

  if (name) updatedUser.name = name;
  if (email) updatedUser.email = email;
  if (role) updatedUser.role = role;

  users[userIndex] = updatedUser;

  setTimeout(() => {
    res.json({
      success: true,
      data: updatedUser,
      message: 'Usuario actualizado exitosamente'
    });
  }, Math.random() * 250 + 75);
});

// DELETE /users/:id - Eliminar usuario
router.delete('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Usuario no encontrado'
    });
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  setTimeout(() => {
    res.json({
      success: true,
      data: deletedUser,
      message: 'Usuario eliminado exitosamente'
    });
  }, Math.random() * 150 + 50);
});

export default router;