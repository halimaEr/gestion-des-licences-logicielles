import { Component } from '@angular/core';
import {LoginService} from '../../services/auth/login.service';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [
    NgIf
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  standalone:true
})
export class LayoutComponent {

  userDropdownOpen = false;

  constructor(public loginService:LoginService,
              private router:Router) {
  }


  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }
  logout() {
    this.loginService.logout().subscribe({
      next: _ => { this.navigateToLogin(); },
      error: _ => { this.navigateToLogin(); }
    })
  }
  get currentUser() {
    return this.loginService.user();
  }
  navigateToLogin() {
    this.router.navigate(['']);
  }
}
