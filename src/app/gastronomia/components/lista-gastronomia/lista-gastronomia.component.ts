import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';
import { GastronomiaService, EstablecimientoDto, RankingGastronomiaDto } from '../../services/gastronomia.service';
import { AuthService } from '../../../core/services/auth.service';
import { first } from 'rxjs/operators';
import { catchError, forkJoin, map, of } from 'rxjs';

interface Establecimiento {
  id: number;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  imagen: string;
  ratingPromedio: number;
  totalReviews: number;
}

@Component({
  selector: 'app-lista-gastronomia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-gastronomia.component.html',
  styleUrl: './lista-gastronomia.component.scss'
})
export class ListaGastronomiaComponent implements OnInit {
  search = '';
  sortMode: 'nombre' | 'ubicacion' = 'nombre';
  rankingMode = false;
  establecimientos: Establecimiento[] = [];
  loading = false;
  error: string | null = null;
  isPublic = false;

  constructor(
    private toast: ToastService,
    private gastronomiaService: GastronomiaService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Detectar si estamos en ruta pública
    this.isPublic = this.router.url.includes('/publica/');
    this.fetchEstablecimientos();
  }

  private fetchEstablecimientos() {
    this.loading = true;
    this.error = null;
    this.gastronomiaService.getRanking().pipe(first()).subscribe({
      next: (ranking: RankingGastronomiaDto[]) => {
        if ((ranking || []).length > 0) {
          this.rankingMode = true;
          this.establecimientos = (ranking || []).map(d => ({
            id: d.id!,
            nombre: d.nombre,
            ubicacion: d.ubicacion,
            descripcion: d.descripcion,
            imagen: d.fotoPrincipal || 'assets/images/hero-oferentes.svg',
            ratingPromedio: Number(d.promedio || 0),
            totalReviews: Number(d.totalResenas || 0)
          }));
          this.loading = false;
          return;
        }

        this.fetchNormalList();
      },
      error: () => this.fetchNormalList()
    });
  }

  private fetchNormalList() {
    this.rankingMode = false;
    this.gastronomiaService.listAll().pipe(first()).subscribe({
      next: (data: EstablecimientoDto[]) => {
        this.establecimientos = (data || []).map(d => ({
          id: d.id!,
          nombre: d.nombre,
          ubicacion: d.ubicacion,
          descripcion: d.descripcion,
          imagen: d.fotoPrincipal || 'assets/images/hero-oferentes.svg',
          ratingPromedio: 0,
          totalReviews: 0
        }));
        if (this.establecimientos.length === 0) {
          this.loading = false;
          return;
        }
        this.loadRatingsResumen();
      },
      error: () => {
        this.establecimientos = [];
        this.error = 'No se pudieron cargar los restaurantes reales';
        this.loading = false;
      }
    });
  }

  private loadRatingsResumen() {
    const requests = this.establecimientos.map((e) =>
      this.gastronomiaService.getReviews(e.id).pipe(
        map((reviews) => {
          const total = (reviews || []).length;
          const suma = (reviews || []).reduce((acc, r) => acc + (Number(r.puntuacion) || 0), 0);
          return {
            id: e.id,
            ratingPromedio: total ? suma / total : 0,
            totalReviews: total
          };
        }),
        catchError(() => of({ id: e.id, ratingPromedio: 0, totalReviews: 0 }))
      )
    );

    if (!requests.length) {
      this.loading = false;
      return;
    }

    forkJoin(requests).pipe(first()).subscribe({
      next: (resumenes) => {
        const mapa = new Map(resumenes.map((r) => [r.id, r]));
        this.establecimientos = this.establecimientos.map((e) => {
          const review = mapa.get(e.id);
          return {
            ...e,
            ratingPromedio: review?.ratingPromedio || 0,
            totalReviews: review?.totalReviews || 0
          };
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filtered(): Establecimiento[] {
    if (this.loading || this.error) return this.establecimientos;
    let result = this.establecimientos.filter(e =>
      e.nombre.toLowerCase().includes(this.search.toLowerCase()) ||
      e.ubicacion.toLowerCase().includes(this.search.toLowerCase())
    );

    if (this.rankingMode) {
      // Importante: conservar el orden entregado por /ranking
      return result;
    }

    switch (this.sortMode) {
      case 'nombre':
        result = [...result].sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'ubicacion':
        result = [...result].sort((a, b) => a.ubicacion.localeCompare(b.ubicacion));
        break;
    }
    return result;
  }

  navigateToDetail(id: number) {
    if (this.isPublic && !this.auth.isAuthenticated()) {
      this.toast.error('Debes iniciar sesión para ver detalles');
      this.router.navigate(['/login']);
      return;
    }
    
    const route = this.isPublic ? '/publica/gastronomia' : '/cliente/gastronomia';
    this.router.navigate([route, id]);
  }

  retry() {
    this.fetchEstablecimientos();
  }
}
