import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { Employe } from '../../models/Employe';
import { AuthService } from '../AuthService'; 

@Injectable({
  providedIn: 'root'
})
export class EmployeService {

  getEmployesByDepartement(departementId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/departement/${departementId}`);
  }
  constructor(private http: HttpClient, private authService: AuthService) { }
  private BASE_URL = "http://localhost:8088/employe-service/employes";
  basURL = "http://localhost:8088";

  getAllEmployess(): Observable<any> {
    return this.http.get(this.BASE_URL);
  }

  getAllEmployes(departementId: any): Observable<any> {
    return this.http.get(this.basURL + "/departements-service/departements/" + departementId + "/employes");
  }
  getEmployeById(employeId: any): Observable<any> {
    return this.http.get(this.basURL + "/employe-service/employes/" + employeId);
  }

  addEmploye(employe: Employe): Observable<any> {
    const headers = this.authService.getHeaders()
    return this.http.post(this.basURL + "/employe-service/employes/add", employe, { headers })
  }
  updateEmploye(employeId: any, employe: Employe): Observable<any> {
    const headers = this.authService.getHeaders()
    return this.http.put(this.basURL + "/employe-service/employes/" + employeId, employe, { headers })
  }
  deleteEmploye(employeId: any) {
    const headers = this.authService.getHeaders()
    return this.http.delete(this.basURL + "/employe-service/employes/" + employeId, { headers })
  }
  getAffectationDetailOfEmploye(employeId: any) {
    const headers = this.authService.getHeaders()
    return this.http.get(this.basURL + "/affectation-service/affectations/employe/" + employeId + "/licences", { headers })
  }

  supprimerAffectation(employeId: any, licenceId: any) {
    const headers = this.authService.getHeaders()
    return this.http.delete(this.basURL + "/affectation-service/affectations/employe/" + employeId + "/licence/" + licenceId, { headers })
  }

  getAllEmployesWithLicences(): Observable<any[]> {
  // 1. Récupère les IDs des employés ayant des licences
  return this.http.get<number[]>(`${this.basURL}/affectation-service/affectations/employes-with-licences`).pipe(
    switchMap(employeIds => {
      if (employeIds.length === 0) {
        return of([]);
      }
      // 2. Récupère les détails des employés
      return this.http.post<any[]>(`${this.BASE_URL}/search/by-ids`, employeIds);
    })
  );
}

}




