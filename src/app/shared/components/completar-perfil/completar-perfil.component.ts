import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-completar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './completar-perfil.component.html',
  styleUrl: './completar-perfil.component.scss'
})
export class CompletarPerfilComponent {
  loading = false;
  model = {
    direccion: '',
    sexo: ''
  };

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  submit(form: NgForm) {
    if (form.invalid || this.loading) return;

    this.loading = true;
    this.auth.completarPerfil({
      direccion: this.model.direccion.trim(),
      sexo: this.model.sexo
    }).pipe(first()).subscribe({
      next: () => {
        const pending = this.auth.getPendingLogin();
        if (!pending) {
          this.toast.success('Perfil actualizado. Continúa con tu sesión.');
          this.loading = false;
          this.router.navigate(['/login']);
          return;
        }

        this.auth.login(pending).pipe(first()).subscribe({
          next: () => {
            this.auth.clearPendingLogin();
            this.loading = false;
            this.toast.success('Perfil completado e inicio de sesión exitoso');
            const roles = this.auth.getRoles();
            if (roles.some(r => /admin/i.test(r))) {
              this.router.navigate(['/admin/home']);
            } else if (roles.some(r => /oferente/i.test(r))) {
              const tipo = this.auth.getTipoNegocio();
              if (tipo === 1) this.router.navigate(['/oferente/dashboard']);
              else if (tipo === 2) this.router.navigate(['/oferente/gastronomia/dashboard']);
              else this.router.navigate(['/oferente/home']);
            } else {
              this.router.navigate(['/cliente/home']);
            }
          },
          error: () => {
            this.loading = false;
            this.toast.warning('Perfil completado. Ahora inicia sesión nuevamente.');
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'No se pudo completar el perfil');
      }
    });
  }
}
