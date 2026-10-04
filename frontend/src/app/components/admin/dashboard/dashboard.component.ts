import { Component, HostListener, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LoginService } from '../../../services/auth/login.service';
import {LayoutComponent} from '../../layout/layout.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [NgIf, RouterOutlet, LayoutComponent,RouterLink],
  standalone: true
})
export class DashboardComponent {


  dropdowns = {
    superviseurs: false,
    departements: false,
    employes: false
  };

  showResponsablesList = false;
  userDropdownOpen = false;

  constructor(
    private router: Router,
    public loginService: LoginService
  ) {}


  // Ouvrir/Fermer le menu utilisateur
  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  // Ouvrir/Fermer un menu déroulant
  toggleDropdown(menu: 'superviseurs' | 'departements' | 'employes'): void {
    if (this.dropdowns[menu]) {
      this.dropdowns[menu] = false;
    } else {
      this.closeAll();
      this.dropdowns[menu] = true;
    }
  }

  closeAll(): void {
    this.dropdowns = {
      superviseurs: false,
      departements: false,
      employes: false
    };
    this.userDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(): void {
    this.userDropdownOpen = false;
  }

  onAjouter(): void {
    console.log('Ajouter un responsable');
    alert('Formulaire d’ajout');
  }

  goToResponsables(): void {
    this.closeAll();
    this.router.navigate(['/dashboard/responsables']);
  }

  goToGestionnaires(): void {
    this.closeAll();
    this.router.navigate(['/dashboard/gestionnaires']);
  }
  goToDepartement(): void {
    this.closeAll();
    this.router.navigate(['/departement']);
  }
  get currentUser() {
    return this.loginService.user();
  }
  logout() {
    this.loginService.logout().subscribe({
      next: _ => { this.navigateToLogin(); },
      error: _ => { this.navigateToLogin(); }
    })
  }

  navigateToLogin() {
    this.router.navigate(['']);
  }
}
