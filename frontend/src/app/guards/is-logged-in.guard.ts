import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from '../services/auth/login.service';
import {catchError, map, of} from 'rxjs';

export const isLoggedInGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  // Récupérer les rôles autorisés depuis les données de la route
  const requiredRoles = route.data?.['roles'] as Array<string>;

  // Si l'utilisateur est déjà chargé
  if (loginService.user() !== undefined && loginService.user() !== null) {
    // Vérifier le rôle si des rôles sont requis
    if (requiredRoles && loginService.user()?.role) {
      if (requiredRoles.includes(loginService.user()!.role)) {
        return true;
      } else {
        router.navigate(['unauthorized']);
        return false;
      }
    }
    return true;
  }

  // Si un token existe mais que l'utilisateur n'est pas encore chargé
  const token = localStorage.getItem('token');
  if (token) {
    // Essayer de récupérer l'utilisateur à partir du token
    return loginService.getUser().pipe(
      map(user => {
        // Vérifier le rôle si des rôles sont requis
        if (requiredRoles && user?.role) {
          if (requiredRoles.includes(user.role)) {
            return true;
          } else {
            router.navigate(['unauthorized']);
            return false;
          }
        }
        return true;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        // Si erreur, nettoyer et rediriger vers login
        localStorage.removeItem('token');
        router.navigate(['login']);
        return of(false);
      })
    );
  }

  // Si aucun token, rediriger vers login
  router.navigate(['login']);
  return false;
};
