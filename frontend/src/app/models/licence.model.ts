export interface Licence {
  id: number;
  cleLicence: string;
  logicielNom: string;
  categorieLogiciel:string;
  vesrionLogiciel:string;
  employeNom?: string;
  dateDebut?: string;
  dateFin?: string | null;
  prix:number;
  statut:string;
  nom:string;
  prenom:string;
  licenceId?:number
}
