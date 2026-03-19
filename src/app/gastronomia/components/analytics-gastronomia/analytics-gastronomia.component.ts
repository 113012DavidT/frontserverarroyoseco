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
        this.data = {
          totalResenas: Number(res?.totalResenas || 0),
          promedio: Number(res?.promedio || 0),
          distribucionEstrellas: res?.distribucionEstrellas || [],
          top5: res?.top5 || [],
          bottom5: res?.bottom5 || [],
          tendenciaMensual: res?.tendenciaMensual || []
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo cargar la analitica';
        this.loading = false;
      }
    });
  }

  trackByLabel(_: number, item: { etiqueta: string }) {
    return item?.etiqueta;
  }
}
