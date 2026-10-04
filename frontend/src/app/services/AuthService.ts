// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private getToken(): string {

    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('Token non trouvé');
    }
    return token;
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
  }
}