// backend/src/routes/cuentasRoutes.ts
// Rutas para gestión de tipos de movimiento contable en POSWEBCrumen

import { Router } from 'express'; // Importa Router de Express
import { 
  getAllTiposMovimiento, 
  createTipoMovimiento, 
  updateTipoMovimiento, 
  getTipoMovimientoById 
} from '../controllers/cuentasController'; // Importa controladores

// Crea una instancia del router
const router = Router();

// Ruta GET para obtener todos los tipos de movimiento contable
// Endpoint: GET /api/cuentas
router.get('/', getAllTiposMovimiento);

// Ruta GET para obtener un tipo de movimiento específico por ID
// Endpoint: GET /api/cuentas/:id
// Params: id (idtipomovimiento)
router.get('/:id', getTipoMovimientoById);

// Ruta POST para crear un nuevo tipo de movimiento contable
// Endpoint: POST /api/cuentas
// Body: CreateTipoMovimientoData
router.post('/', createTipoMovimiento);

// Ruta PUT para actualizar un tipo de movimiento contable existente
// Endpoint: PUT /api/cuentas/:id
// Params: id (idtipomovimiento)
// Body: UpdateTipoMovimientoData
router.put('/:id', updateTipoMovimiento);

// Exporta el router para uso en app principal
export default router;