import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Credentials, LoginService } from '../../services/auth/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private router = inject(Router);

  // Formulaire adapté à l'interface Credentials du service
  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  loading = false; // État de chargement
  errorMessage: string | null = null;
  showPassword = false; // Pour afficher/masquer le mot de passe
  private subs = new Subscription();

  constructor() {
    this.loadRememberedUser();
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.errorMessage = null;
    this.loading = true;

    const credentials: Credentials = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!
    };

    this.subs.add(
      this.loginService.login(credentials).subscribe({
        next: (response) => {
          this.loading = false;
          if (this.loginForm.value.rememberMe) {
            this.rememberUser(this.loginForm.value.username!);
          } else {
            this.forgetUser();
          }
          // Redirection selon le rôle de l'utilisateur
          const userRole = response?.role;

          switch(userRole) {
            case 'Admin':
              this.router.navigate(['/dashboard']);
              break;
            case 'Responsable':
              this.router.navigate(['/dash-responsable']);
              break;
            case 'Gestionnaire':
              this.router.navigate(['/dash-gestionnaire']);
              break;
            default:
              this.router.navigate(['']);
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Login error:', err);
          this.errorMessage = 'Identifiants incorrects';
        }
      })
    );
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  private rememberUser(username: string): void {
    const userData = {
      username: username,
      timestamp: new Date().getTime()
    };
    localStorage.setItem('rememberedUser', btoa(JSON.stringify(userData)));
  }

  private loadRememberedUser(): void {
    try {
      const rememberedData = localStorage.getItem('rememberedUser');
      if (rememberedData) {
        const userData = JSON.parse(atob(rememberedData));
        // Vérifier si les données ne sont pas trop anciennes (optionnel)
        const oneMonth = 30 * 24 * 60 * 60 * 1000;
        if (new Date().getTime() - userData.timestamp < oneMonth) {
          this.loginForm.patchValue({
            username: userData.username || '',
            rememberMe: true
          });
        } else {
          this.forgetUser(); // Nettoyer les données trop anciennes
        }
      }
    } catch (e) {
      this.forgetUser();
    }
  }

  // Effacer les données sauvegardées
  private forgetUser(): void {
    localStorage.removeItem('rememberedUser');
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
