import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

// ===== Interfaces =====
export interface EstablecimientoDto {
  id?: number;
  oferenteId?: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  fotoPrincipal?: string;
  estado?: string;
  direccion?: string;
  latitud?: number | null;
  longitud?: number | null;
  menus?: MenuDto[];
  mesas?: MesaDto[];
}

export interface MenuDto {
  id?: number;
  establecimientoId?: number;
  nombre: string;
  items?: MenuItemDto[];
}

export interface MenuItemDto {
  id?: number;
  menuId?: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

export interface MesaDto {
  id?: number;
  establecimientoId?: number;
  numero: number;
  capacidad: number;
  disponible?: boolean;
}

export interface ReservaGastronomiaDto {
  id?: number;
  usuarioId?: string;
  establecimientoId?: number;
  mesaId?: number;
  fecha: string; // ISO string
  numeroPersonas: number;
  estado?: string;
  total?: number;
  establecimientoNombre?: string;
  clienteNombre?: string;
  mesaNumero?: number;
}

export interface CrearReservaGastronomiaDto {
  fecha: string;
  numeroPersonas: number;
  mesaId?: number;
}

export interface DisponibilidadDto {
  mesasDisponibles: number;
}

export interface ReviewGastronomiaDto {
  id?: number;
  establecimientoId?: number;
  usuarioId?: string;
  puntuacion: number;
  comentario: string;
  fecha?: string;
  usuarioNombre?: string;
  nombreUsuario?: string;
  nombre?: string;
}

export interface CrearReviewGastronomiaDto {
  puntuacion: number;
  comentario: string;
}

@Injectable({ providedIn: 'root' })
export class GastronomiaService {
  private readonly api = inject(ApiService);

  // ===== Públicos (sin autenticación) =====
  
  /** Listar todos los establecimientos */
  listAll(): Observable<EstablecimientoDto[]> {
    return this.api.get<EstablecimientoDto[]>('/Gastronomias');
  }

  /** Detalle de un establecimiento */
  getById(id: number): Observable<EstablecimientoDto> {
    return this.api.get<EstablecimientoDto>(`/Gastronomias/${id}`);
  }

  /** Listar menús de un establecimiento */
  getMenus(id: number): Observable<MenuDto[]> {
    return this.api.get<MenuDto[]>(`/Gastronomias/${id}/menus`);
  }

  /** Verificar disponibilidad en una fecha */
  getDisponibilidad(id: number, fecha: string): Observable<DisponibilidadDto> {
    return this.api.get<DisponibilidadDto>(`/Gastronomias/${id}/disponibilidad`, { fecha });
  }

  /** Listar reseñas de un establecimiento */
  getReviews(id: number): Observable<ReviewGastronomiaDto[]> {
    return this.api.get<ReviewGastronomiaDto[]>(`/Gastronomias/${id}/reviews`);
  }

  /** Crear reseña de un establecimiento */
  createReview(id: number, payload: CrearReviewGastronomiaDto): Observable<number> {
    return this.api.post<number>(`/Gastronomias/${id}/reviews`, payload);
  }

  // ===== Oferente (autenticado) =====

  /** Crear establecimiento */
  create(payload: EstablecimientoDto): Observable<any> {
    return this.api.post('/Gastronomias', payload);
  }

  /** Crear menú */
  createMenu(establecimientoId: number, payload: { nombre: string }): Observable<any> {
    return this.api.post(`/Gastronomias/${establecimientoId}/menus`, payload);
  }

  /** Agregar item a menú */
  addMenuItem(establecimientoId: number, menuId: number, payload: MenuItemDto): Observable<any> {
    return this.api.post(`/Gastronomias/${establecimientoId}/menus/${menuId}/items`, payload);
  }

  /** Crear mesa */
  createMesa(establecimientoId: number, payload: { numero: number; capacidad: number }): Observable<any> {
    return this.api.post(`/Gastronomias/${establecimientoId}/mesas`, payload);
  }

  /** Cambiar disponibilidad de mesa */
  setMesaDisponible(establecimientoId: number, mesaId: number, disponible: boolean): Observable<any> {
    return this.api.put(`/Gastronomias/${establecimientoId}/mesas/${mesaId}/disponible`, disponible);
  }

  /** Actualizar disponibilidad de mesa */
  updateDisponibilidadMesa(establecimientoId: number, mesaId: number, disponible: boolean): Observable<any> {
    return this.api.put(`/Gastronomias/${establecimientoId}/mesas/${mesaId}/disponibilidad`, { disponible });
  }

  /** Listar reservas del establecimiento */
  getReservas(establecimientoId: number): Observable<ReservaGastronomiaDto[]> {
    return this.api.get<ReservaGastronomiaDto[]>(`/Gastronomias/${establecimientoId}/reservas`);
  }

  /** Listar establecimientos propios del oferente */
  listMine(): Observable<EstablecimientoDto[]> {
    return this.api.get<EstablecimientoDto[]>('/Gastronomias/mios');
  }

  /** Actualizar establecimiento */
  update(id: number, payload: Partial<EstablecimientoDto>): Observable<any> {
    return this.api.put(`/Gastronomias/${id}`, payload);
  }

  /** Eliminar establecimiento */
  delete(id: number): Observable<any> {
    return this.api.delete(`/Gastronomias/${id}`);
  }

  // ===== Cliente (autenticado) =====

  /** Crear reserva */
  createReserva(establecimientoId: number, payload: CrearReservaGastronomiaDto): Observable<any> {
    return this.api.post(`/Gastronomias/${establecimientoId}/reservas`, payload);
  }
}
