// Tipos base para categoría (frontend)
export interface Categoria {
  idCategoria: number;
  nombre: string;
  imagencategoria?: string;
  descripcion?: string;
  estatus: number;
  fechaRegistroauditoria: string;
  usuarioauditoria: string;
  fechamodificacionauditoria: string;
  idnegocio: number;
}
