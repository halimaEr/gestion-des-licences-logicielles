import {Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of, tap} from 'rxjs';
import {User} from '../../models/user.model';

export interface Credentials{
  username: string,
  password: string
}


@Injectable({
  providedIn: 'root'
})
export class LoginService {


  user= signal<User | null | undefined>(undefined) //un signal qui stocke l'utilisateur connecté (ou null si déconnecté).
  private BASE_URL='http://localhost:8088'
  constructor(private httpClient: HttpClient) {
    // Optionnel (restaure depuis localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      this.user.set(parsedUser);
    }
  }

  login(credentials: Credentials): Observable<User | null | undefined> {
    return this.httpClient.post(this.BASE_URL + '/authentication-service/users/login', credentials).pipe(
      tap((result: any) => {
        localStorage.setItem('token', result['token']);
        const user = Object.assign(new User(), result['user']);
        localStorage.setItem('user', JSON.stringify(user));
        this.user.set(user);
      }),
      map(() => this.user())
    );
  }

  getUser(): Observable<User | null | undefined> {
    return this.httpClient.get(this.BASE_URL + '/authentication-service/users/current').pipe(
      tap((result: any) => {
        const user = Object.assign(new User(), result);
        localStorage.setItem('user', JSON.stringify(user));
        this.user.set(user);
      }),
      map(() => this.user())
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user.set(null);
    return of({ message: 'Déconnecté avec succès' });
  }





  private readonly TOKEN_KEY = 'token';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getDecodedToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error('Erreur lors du décodage du token', e);
      return null;
    }
  }

  getUserId(): number | null {
    const decoded = this.getDecodedToken();
    return decoded?.sub || null; // ou decoded?.userId si tu le nommes comme ça
  }

  getUserRole(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.role || null;
  }



}
