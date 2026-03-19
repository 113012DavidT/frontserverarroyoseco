import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { GastronomiaAnalyticsDto, GastronomiaService } from '../../services/gastronomia.service';

@Component({
  selector: 'app-analytics-gastronomia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-gastronomia.component.html',
  styleUrl: './analytics-gastronomia.component.scss'
})
export class AnalyticsGastronomiaComponent implements OnInit {
  loading = true;
  error: string | null = null;
  data: GastronomiaAnalyticsDto | null = null;

  constructor(private gastronomiaService: GastronomiaService) {}

  ngOnInit(): void {
    this.gastronomiaService.getAnalytics().pipe(first()).subscribe({
      next: (res) => {
        console.log('Analytics response:', res);
        
        // Si el servicio ya desempaquetó correctamente, uso directamente
        if (res && typeof res === 'object') {
          this.data = res as GastronomiaAnalyticsDto;
          console.log('Analytics data assigned:', this.data);
        } else {
          // Fallback si viene vacío
          this.data = {
            totalResenas: 0,
            promedio: 0,
            distribucionEstrellas: [],
            top5: [],
            bottom5: [],
            tendenciaMensual: []
          };
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Analytics error:', err);
        this.error = err?.error?.message || 'No se pudo cargar la analitica';
        this.loading = false;
      }
    });
  }

  trackByLabel(_: number, item: { etiqueta: string }) {
    return item?.etiqueta;
  }
}
