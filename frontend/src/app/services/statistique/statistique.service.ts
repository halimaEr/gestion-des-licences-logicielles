import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable,forkJoin} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {
  basURLDemande = "http://localhost:8088/demande-service/demandes/stats";
  basURL = "http://localhost:8088/logiciel-service";

  constructor(private  http : HttpClient) { }
  getStatistic():Observable<any>{
    return forkJoin({
      departementStat: this.http.get<any>("http://localhost:8088/logiciel-service/licences/departements"),
      demande: this.http.get<any>(this.basURLDemande),
      licence: this.http.get<any>(this.basURL+"/licences/stats"),
      top5Logiciels: this.http.get<any>(this.basURL+"/logiciels/top-logiciels")
    });
  }
  getStatisticOfAdmin():Observable<any>{
    return forkJoin({
      departementStat: this.http.get<any>("http://localhost:8088/logiciel-service/licences/departements"),
      totalDepartements:this.http.get<any>("http://localhost:8088/departements-service/departements/stats"),
      totalEmployes :this.http.get<any>("http://localhost:8088/employe-service/employes/stats"),
      // totalResponsables :this.http.get<any>(this.basURLDemande),
      departementAndCout :this.http.get<any>("http://localhost:8088/logiciel-service/licences/couts-par-departement")

    });
  }
  

  getStatistiqueParAnnee(annee?: number): Observable<any[]> {
    const year = annee ? annee : new Date().getFullYear();
    const params = new HttpParams().set('annee', year.toString());
  
    return this.http.get<any[]>("http://localhost:8088/logiciel-service/licences/couts-par-departement", { params });
  }

  getCoutsParLogicielParAnneeEtDepartement(year: number, departementId: number | null): Observable<any[]> {
  let params = new HttpParams().set('annee', year);
  if (departementId !== null) {
    params = params.set('departementId', departementId);
  }
  return this.http.get<any[]>("http://localhost:8088/logiciel-service/licences/statistiques/par-logiciel", { params });
}

getDetailsLogiciel(nom: string, annee: number, departementId: number | null): Observable<any[]> {
  let params = new HttpParams().set('annee', annee);
  if (departementId !== null) {
    params = params.set('departementId', departementId);
  }
  return this.http.get<any[]>(
    `http://localhost:8088/logiciel-service/licences/logiciel/${nom}/details`,
    { params }
  );
}

}


