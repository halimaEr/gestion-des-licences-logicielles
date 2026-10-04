import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, Observable, of, tap, throwError} from 'rxjs';
import { Licence } from '../../models/licence.model';
import { AuthService } from '../AuthService';
@Injectable({
  providedIn: 'root'
})
export class LicenceService {

  private BASE_URL = 'http://localhost:8088/logiciel-service/licences'; 
  basURL = "http://localhost:8088/logiciel-service/logiciels";
  private apiUrl = 'http://localhost:8088/logiciel-service';



  constructor(private  http : HttpClient,private authService:AuthService) { }

  getLicencesParDepartement(departementId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/departement/${departementId}`);
  }
  getLicenceByIdd(dLicence: number):Observable<any>{
    return this.http.get(this.BASE_URL+"/"+dLicence)
  }

  ronouvler( licenceId: number, dateFin: any): Observable<any> {
  const formData = new FormData();
  formData.append('dateFin', dateFin); 
  const headers = this.authService.getHeaders()

  return this.http.patch(
    "http://localhost:8088/logiciel-service/licences/"+licenceId+"/ronouvler",
    formData,{headers}
  );
}

  getAllLicences(idLogiciel : any):Observable<any>{
    return this.http.get(this.basURL+"/"+idLogiciel+"/licences");
  }
  getAllLicencees():Observable<any>{
    return this.http.get(this.BASE_URL);
  }
  getLicenceById(idlogiciel: number, idLicence: number):Observable<any>{
    return this.http.get(this.basURL+"/"+idlogiciel+"/licences/"+idLicence)
  }

  getLicencesByDemandeId(demandeId: number): Observable<any> {
    return this.http.get(this.BASE_URL+"/by-demande/"+demandeId);
  }

  addLicence(idLogiciel: any,licence :any):Observable<any>{
    const headers = this.authService.getHeaders()
    const body = {
    ...licence,
    demandeId: licence.demandeId // S'assurer que cet ID est bien inclus
  };
    return this.http.post(this.basURL+"/"+idLogiciel+"/licences/add",body,{headers});
  }

  addMultipleLicences(logicielId: number, licences: any[]): Observable<any> {
  const headers = this.authService.getHeaders();
  
  // Log de débogage
  console.log('=== ENVOI MULTIPLE LICENCES ===');
  console.log('URL:', `${this.basURL}/${logicielId}/licences/multiple`);
  console.log('Nombre de licences:', licences.length);
  console.log('Données:', JSON.stringify(licences, null, 2));
  
  return this.http.post<any>(
    `${this.basURL}/${logicielId}/licences/multiple`, 
    licences, 
    { headers }
  ).pipe(
    tap(response => {
      console.log('=== RÉPONSE SERVEUR ===');
      console.log('Réponse:', response);
    }),
    catchError(error => {
      console.error('=== ERREUR SERVEUR ===');
      console.error('Erreur:', error);
      return throwError(() => error);
    })
  );
}



  updateLicence(idlogiciel:number, idLicence:number,licence :any):Observable<any>{
    const headers = this.authService.getHeaders()
    return this.http.put(this.basURL+"/"+idlogiciel+"/licences/"+idLicence,licence,{headers});
  }
  
  deleteLicence(logicielId: number, licenceId: number): Observable<any> {
    const headers = this.authService.getHeaders()
  return this.http.delete<any>(this.basURL+"/"+logicielId+"/licences/"+licenceId,{headers})
    .pipe(
      catchError((error: HttpErrorResponse) => {
 
        if (error.error) {
          return throwError(() => error.error); 
        }
        return throwError(() => 'Erreur inconnue');
      })
    );
}

envoyerDemandeRenouvellement(demande: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/demandes-renouvellement/envoyer`, demande);
}

getAllDemandes():Observable<any>{
    return this.http.get(this.apiUrl+"/demandes-renouvellement");
  }

  approuverDemande(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/demandes-renouvellement/${id}/approuver`, {});
  }

  rejeterDemande(id: number, motifRefus: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/demandes-renouvellement/${id}/rejeter`, {
    motifRefus
  });
}
supprimerDemande(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/demandes-renouvellement/${id}`);
}

getLicencesActives(): Observable<any[]> {
  return this.http.get<any[]>(`${this.BASE_URL}/active`);
}

getLicencesLibres(): Observable<any[]> {
  return this.http.get<any[]>(`${this.BASE_URL}/libre`);
}

getLicencesExpirees(): Observable<Licence[]> {
  return this.http.get<Licence[]>(`${this.BASE_URL}/expired`);
}

getLicencesExpirantBientot(): Observable<Licence[]> {
  return this.http.get<Licence[]>(`${this.BASE_URL}/expiring-soon`).pipe(
    catchError(err => {
      if (err.status === 404) {
        return of([]); // Retourne tableau vide si 404
      }
      return throwError(() => err);
    })
  );
}

}
