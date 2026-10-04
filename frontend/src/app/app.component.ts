import { Component, OnInit } from '@angular/core';
import { LoginService } from './services/auth/login.service';
import {RouterOutlet} from '@angular/router'; // adapte le chemin

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RouterOutlet
  ],
  standalone: true
})
export class AppComponent implements OnInit {

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // Si user et token existent → restaurer
    if (token && user && !this.loginService.user()) {
      const parsedUser = JSON.parse(user);
      this.loginService.user.set(parsedUser);
    }
  }
}
