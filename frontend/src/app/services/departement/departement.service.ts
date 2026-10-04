import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departement } from '../../models/Departement';
import { AuthService } from '../AuthService'; 

@Injectable({
  providedIn: 'root'
})
export class DepartementService {



  basURL = "http://localhost:8088/departements-service/departements";

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllDepartements(): Observable<any> {
    return this.http.get(this.basURL);
  }
  getDepartementById(id: number): Observable<any> {
    return this.http.get(this.basURL + "/" + id)
  }
  addDepartement(departement: Departement): Observable<any> {
    const headers = this.authService.getHeaders()
    return this.http.post(this.basURL + "/add", departement, { headers });
  }

  deleteDepartement(id: any): Observable<any> {
    const headers = this.authService.getHeaders()
    console.log(id)
    return this.http.delete(this.basURL + '/' + id, { headers });
  }


  updateDepartement(id: number, departement: Departement): Observable<any> {
    const headers = this.authService.getHeaders()
    return this.http.put(this.basURL + "/" + id, departement, { headers });
  }

}
