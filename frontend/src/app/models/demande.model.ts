export class Demande{
  id?: number;
  logicielId?: number;
  nomLogiciel?: string;
  versionLogiciel?: string;
  categorieLogiciel?: string;
  nbLicences: number=0;
  fournisseur: string='';
  description: string='';
  statut?: string='';
  employeIds: number[]=[];
  employes: any;
  date:string='';
  isNewLogiciel: number = 0;
}
