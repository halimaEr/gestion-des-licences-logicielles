import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Logiciel } from '../../models/Logiciel';
import { AuthService } from '../AuthService'; 

@Injectable({
  providedIn: 'root'
})


export class LogicielService {
  basURL = "http://localhost:8088/logiciel-service/logiciels";
  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllLogiciel(): Observable<any> {
    return this.http.get(this.basURL);
  }
  getLogicielById(id: number): Observable<any> {
    return this.http.get(this.basURL + "/" + id)
  }


  addLogiciel(logicielAvecDemandeId: any): Observable<any> {
    const headers = this.authService.getHeaders()
    return this.http.post(this.basURL + "/add-avec-demande", logicielAvecDemandeId, { headers });
  }

  addLogicielSansIdDemande(logicielSansDemandeId: any): Observable<any> {
    const headers = this.authService.getHeaders()
    return this.http.post(this.basURL + "/add", logicielSansDemandeId, { headers });
  }

  deleteLogiciel(id: any): Observable<any> {
    console.log(id)
    const headers = this.authService.getHeaders()
    return this.http.delete(this.basURL + '/' + id, { headers });
  }

  updateLogiciel(id: number, logiciel: Logiciel): Observable<any> {
    const headers = this.authService.getHeaders()
    return this.http.put(this.basURL + "/" + id, logiciel, { headers });
  }
  updateNbrLicenceOfLogiciel(idlogiciel: number, nbrLicence: any): Observable<any> {
    const headers = this.authService.getHeaders()
    return this.http.put(this.basURL + "/" + idlogiciel+"/modifiernbrlicence/"+nbrLicence, { headers });
  }

}
