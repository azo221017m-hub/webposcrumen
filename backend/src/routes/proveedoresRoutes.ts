// backend/src/routes/proveedoresRoutes.ts
// Rutas para la gestión de proveedores en POSWEBCrumen

import { Router } from 'express'; // Importa Router de Express
import { 
  getProveedores,
  createProveedor, 
  updateProveedor,
  deleteProveedor
} from '../controllers/proveedoresController'; // Importa controladores

// Crea el router para proveedores
const router = Router(); // Instancia del router

console.log('🏪 [Routes] Configurando rutas de proveedores'); // Log de configuración

/**
 * GET /api/proveedores
 * Obtiene todos los proveedores
 */
router.get('/', getProveedores);
console.log('✅ [Routes] Ruta GET /api/proveedores configurada'); // Log de ruta

/**
 * POST /api/proveedores
 * Crea un nuevo proveedor
 */
router.post('/', createProveedor);
console.log('✅ [Routes] Ruta POST /api/proveedores configurada'); // Log de ruta

/**
 * PUT /api/proveedores/:id
 * Actualiza un proveedor existente
 */
router.put('/:id', updateProveedor);
console.log('✅ [Routes] Ruta PUT /api/proveedores/:id configurada'); // Log de ruta

/**
 * DELETE /api/proveedores/:id
 * Elimina (desactiva) un proveedor
 */
router.delete('/:id', deleteProveedor);
console.log('✅ [Routes] Ruta DELETE /api/proveedores/:id configurada'); // Log de ruta

console.log('🏪 [Routes] Todas las rutas de proveedores configuradas correctamente'); // Log de finalización

// Exporta el router
export default router;