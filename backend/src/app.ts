﻿// backend/src/app.ts
// Aplicación principal del servidor

import express from 'express';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import corsMiddleware from './middlewares/cors';

// Importa las rutas disponibles
import authRoutes from './routes/authRoutes';
import usuariosRoutes from './routes/usuariosRoutes';
import rolesRoutes from './routes/rolesRoutes';
import categoriasRoutes from './routes/categoriasRoutes';
import mesasRoutes from './routes/mesasRoutes';
import descuentosRoutes from './routes/descuentosRoutes';
import umedidaRoutes from './routes/umedidaRoutes';
import insumosRoutes from './routes/insumosRoutes';
import cuentaContableRoutes from './routes/cuentaContableRoutes';
import proveedoresRoutes from './routes/proveedoresRoutes';
import negociosRoutes from './routes/negociosRoutes';

// Carga las variables de entorno
dotenv.config();

// Crea la aplicación Express
const app = express();

// Define el puerto del servidor
const PORT = process.env.PORT || 4000;

// Middleware global para parsear JSON
app.use(express.json({ limit: '10mb' }));

// Middleware global para parsear datos de formularios
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Aplica middleware CORS
app.use(corsMiddleware);

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
  console.log(`📊 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  console.log('💊 Health check solicitado');
  res.json({
    success: true,
    message: 'Servidor POSWEBCrumen funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Configuración de rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/descuentos', descuentosRoutes);
app.use('/api/umedidas', umedidaRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/cuentas-contables', cuentaContableRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/negocios', negociosRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  console.log('🏠 Ruta raíz accedida');
  res.json({
    success: true,
    message: '🚀 Bienvenido a POSWEBCrumen API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      roles: '/api/roles',
      categorias: '/api/categorias',
      mesas: '/api/mesas',
      descuentos: '/api/descuentos',
      health: '/health'
    }
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
    availableEndpoints: [
      'GET /health',
      'GET /',
      'POST /api/auth/login',
      'GET /api/usuarios',
      'GET /api/roles',
      'GET /api/categorias',
      'GET /api/mesas',
      'GET /api/descuentos'
    ]
  });
});

// Manejo global de errores
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Error global capturado:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error del servidor'
  });
});

// Función para iniciar el servidor
async function startServer() {
  try {
    console.log('🔄 Iniciando servidor POSWEBCrumen...');
    
    // Prueba la conexión a la base de datos
    console.log('🔗 Probando conexión a la base de datos...');
    await testConnection();
    console.log('✅ Conexión a la base de datos exitosa');
    
    // Inicia el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor POSWEBCrumen corriendo en puerto ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`💊 Health check: http://localhost:${PORT}/health`);
      console.log('📋 Rutas disponibles:');
      console.log('  - POST /api/auth/login');
      console.log('  - GET /api/usuarios');
      console.log('  - GET /api/roles');
      console.log('  - GET /api/categorias');
      console.log('  - GET /api/mesas');
      console.log('  - GET /api/descuentos');
      console.log('  - GET /api/umedidas');
      console.log('  - GET /api/proveedores');
    });
    
  } catch (error) {
    console.error('💥 Error al iniciar el servidor:', error);
    console.error('🔧 Revisa la configuración de la base de datos');
    process.exit(1);
  }
}

// Inicia el servidor si este archivo es ejecutado directamente
if (require.main === module) {
  startServer();
}

// Exporta la aplicación para testing
export default app;
