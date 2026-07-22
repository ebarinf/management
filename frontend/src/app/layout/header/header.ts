import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { PageTitleService } from '../../core/page-title.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly pageTitleService = inject(PageTitleService);

  protected readonly usuario = this.authService.obtenerUsuario();

  protected iniciales(): string {
    const username = this.usuario?.username ?? '';
    return username.slice(0, 2).toUpperCase();
  }

  protected onLogout(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
