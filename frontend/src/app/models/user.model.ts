export class User {
  id?: number;
  username: string = '';
  prenom: string = '';
  nom: string = '';
  role: string = '';
  departementName: string = '';
  password: string = '';
  departmentId?: number; // ← ajouté pour filtrer

}
