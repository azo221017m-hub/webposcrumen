import { Router } from 'express';
import { getModeradores, createModerador, getCategoriasModerador, createCategoriaModerador, updateModerador } from '../controllers/moderadoresController';

const router = Router();

// Obtener lista de moderadores
router.get('/', getModeradores);

// Crear un nuevo moderador
router.post('/', createModerador);

// Obtener categorías de moderadores
router.get('/categorias', getCategoriasModerador);

// Crear una nueva categoría de moderador
router.post('/categorias', createCategoriaModerador);

// Actualizar un moderador existente
router.put('/:id', updateModerador);

export default router;
