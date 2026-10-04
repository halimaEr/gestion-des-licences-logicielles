import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { User } from '../../models/user.model';
import { Demande } from '../../models/demande.model';
import { AuthService } from '../AuthService';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {

  constructor(private http: HttpClient, private authService: AuthService) { }
  private BASE_URL = "http://localhost:8088/demande-service/demandes";

  getAllDemandes(): Observable<any> {
    return this.http.get(this.BASE_URL)
  }
  getDemandesDuResponsable(): Observable<Demande[]> {
    const token = localStorage.getItem('token'); // stocké après login
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Demande[]>(`${this.BASE_URL}/responsable`, { headers });
  }

  getDemandeById(id: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/${id}`); 
  }

   getEmployesByDemandeId(idDemande: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/${idDemande}/employes`);
  }

  


  addDemande(demande: Demande): Observable<string> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  // Étape 1 : Récupérer l'email du gestionnaire depuis le backend
  return this.http.get("http://localhost:8088/authentication-service/users/gestionnaire/email", {
    headers,
    responseType: 'text' // ← Important, car la réponse est du texte brut
  }).pipe(
    // Étape 2 : Utiliser l'email pour envoyer la demande
    switchMap(gestionnaireEmail => {
      const requestPayload = {
        demande,
        gestionnaireEmail: gestionnaireEmail // ← Injecté directement
      };

      return this.http.post(`${this.BASE_URL}/create`, requestPayload, {
        headers,
        responseType: 'text' as 'text'
      });
    }),
    catchError((error: HttpErrorResponse) => {
      const errorMsg = error.error || error.message || 'Erreur lors de l\'envoi de la demande';
      return throwError(() => ({ message: errorMsg }));
    })
  );
}






  deleteDemande(id: number): Observable<string> {
    return this.http.delete(this.BASE_URL + '/' + id, { responseType: 'text' }).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMsg = error.error || error.message || 'Erreur lors de la suppression du demande';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  //  modiffffffffff """"""""""""""""""""""""""""
  getLicenceNoAffecteraffecter(idLogiciel: any) {
    return this.http.get<any>("http://localhost:8088/logiciel-service/logiciels/" + idLogiciel + "/licences/noaffecter");
  }

  affecter(idEmp: any, idLicence: any) {
    const body = {
      employeId: idEmp,
      licenceId: idLicence
    };

    return this.http.post<any>('http://localhost:8088/affectation-service/affectations/creer', body);
  }

  accepter(id: any): Observable<any> {
    return this.http.put<any>(this.BASE_URL + "/" + id + "/accepter", {});
  }

  refuserAvecMotif(id: number, motif: string): Observable<any> {
  return this.http.post<any>(`${this.BASE_URL}/${id}/refuser`, { motif });
}


   


}

