// backend/src/routes/umMovimientoRoutes.ts
// Rutas para gestión de unidades de medida de compra en POSWEBCrumen

import { Router } from 'express'; // Importa Router de Express
import { 
  getAllUMMovimientos, 
  createUMMovimiento, 
  updateUMMovimiento, 
  getUMMovimientoById 
} from '../controllers/umMovimientoController'; // Importa controladores

// Crea una instancia del router
const router = Router();

// Ruta GET para obtener todas las unidades de medida de compra
// Endpoint: GET /api/ummovimientos
router.get('/', getAllUMMovimientos);

// Ruta GET para obtener una unidad de medida específica por ID
// Endpoint: GET /api/ummovimientos/:id
// Params: id (idUmCompra)
router.get('/:id', getUMMovimientoById);

// Ruta POST para crear una nueva unidad de medida de compra
// Endpoint: POST /api/ummovimientos
// Body: CreateUMMovimientoData
router.post('/', createUMMovimiento);

// Ruta PUT para actualizar una unidad de medida de compra existente
// Endpoint: PUT /api/ummovimientos/:id
// Params: id (idUmCompra)
// Body: UpdateUMMovimientoData
router.put('/:id', updateUMMovimiento);

// Exporta el router para uso en app principal
export default router;