import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {User} from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ResponsableService {

  constructor(private http: HttpClient) {
  }

  private BASE_URL = "http://localhost:8088/authentication-service/users";

  getAllResponsables(): Observable<any> {
    return this.http.get(this.BASE_URL + '/responsables')
  }
  getAllGestionnaires(): Observable<any> {
    return this.http.get(this.BASE_URL + '/gestionnaires')
  }

  addResponsable(responsable: User): Observable<string> {
    return this.http.post(`${this.BASE_URL}/register`, responsable, {responseType: 'text'}).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMsg = error.error || error.message || 'Erreur lors de l\'ajout du responsable';
        return throwError(() => ({message: errorMsg}));
      })
    );
  }

  updateResponsable(id: number, responsable: User): Observable<any> {
    return this.http.put(this.BASE_URL + '/update/' + id, responsable, {responseType: 'text'}).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMsg = error.error || error.message || 'Erreur lors de la modification du responsable';
        return throwError(() => ({message: errorMsg}));
      })
    );
  }


  deleteResponsable(id: number): Observable<string> {
    return this.http.delete(this.BASE_URL + '/' + id, {responseType: 'text'}).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMsg = error.error || error.message || 'Erreur lors de la suppression du responsable';
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}
