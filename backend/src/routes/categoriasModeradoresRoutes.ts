import { Router } from 'express';
import { getCategoriasModeradores, createCategoriaModerador } from '../controllers/categoriasModeradoresController';

const router = Router();

// Ruta para obtener todas las categorías de moderadores
router.get('/categorias-moderadores', getCategoriasModeradores);

// Ruta para crear una nueva categoría de moderador
router.post('/categorias-moderadores', createCategoriaModerador);

export default router;