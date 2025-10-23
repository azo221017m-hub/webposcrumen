// backend/src/routes/tipoMovimientoRoutes.ts
// Rutas para gestión de tipos de movimiento en POSWEBCrumen

import { Router } from 'express'; // Importa Router de Express
import { 
  getTipoMovimientosController, 
  createTipoMovimientoController, 
  updateTipoMovimientoController,
  deleteTipoMovimientoController
} from '../controllers/tipoMovimientoController'; // Importa controladores

console.log('🏪 [Routes] Configurando rutas de tipos de movimiento');

// Crea un router de Express
const router = Router();

// GET /api/tipo-movimiento - Obtiene todos los tipos de movimiento
router.get('/', getTipoMovimientosController);
console.log('✅ [Routes] Ruta GET /api/tipo-movimiento configurada');

// POST /api/tipo-movimiento - Crea un nuevo tipo de movimiento
router.post('/', createTipoMovimientoController);
console.log('✅ [Routes] Ruta POST /api/tipo-movimiento configurada');

// PUT /api/tipo-movimiento/:id - Actualiza un tipo de movimiento
router.put('/:id', updateTipoMovimientoController);
console.log('✅ [Routes] Ruta PUT /api/tipo-movimiento/:id configurada');

// DELETE /api/tipo-movimiento/:id - Elimina un tipo de movimiento
router.delete('/:id', deleteTipoMovimientoController);
console.log('✅ [Routes] Ruta DELETE /api/tipo-movimiento/:id configurada');

console.log('🏪 [Routes] Todas las rutas de tipos de movimiento configuradas correctamente');

// Exporta el router para uso en la aplicación principal
export default router;