import { Component } from '@angular/core';
import { EmployeService } from '../../../services/employe/employe.service';
import { Router } from '@angular/router';
import { LoginService } from '../../../services/auth/login.service';
import { User } from '../../../models/user.model';
import { FormsModule } from '@angular/forms';
import { DepartementService } from '../../../services/departement/departement.service';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-affectation-details',
  imports: [FormsModule, NgForOf],
  templateUrl: './affectation-details.component.html',
  styleUrl: './affectation-details.component.css'
})
export class AffectationDetailsComponent {
  showList: boolean = true;
  employes: any[] = [];           // Tous les employés (non filtrés)
  employesFiltres: any[] = [];    // Employés après application du filtre
  affectation: any;
  employId: any;
  showListOfDetails: boolean = false;
  showDeleteModal: boolean = false;
  affectationId: any;
  departemntID: any;
  filtreDepartement: string = '';
  departementsDisponibles: string[] = [];
  // Notification
  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'success' | 'error' = 'success';
  showSearchBar = false;
  searchTerm = '';

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.appliquerFiltres();
  }

  // Méthode pour afficher la modale
  showModalWithMessage(title: string, message: string, type: 'success' | 'error') {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.showModal = true;
  }

  // Méthode pour fermer la modale
  closeModal() {
    this.showModal = false;
  }

  setAffectationIdForDelete(id: any) {
    this.affectationId = id;
    this.showDeleteModal = true;
    console.log('ID affectation à supprimer:', this.affectationId);
  }

  constructor(
    private employeService: EmployeService,
    private loginService: LoginService,
    private router: Router,
    private departementService: DepartementService
  ) { }

  ngOnInit(): void {
    this.loginService.getUser().subscribe((user: User | null | undefined) => {
      if (!user || !user.departmentId) {
        console.warn('Utilisateur ou département non trouvé');
        return;
      }

      this.departemntID = user.departmentId;
      console.log('Département ID utilisateur:', this.departemntID);
      this.loadEmployesWithLicences();
    });
  }

  private loadEmployesWithLicences() {
    // 1. Récupère les employés avec licences
    this.employeService.getAllEmployesWithLicences().subscribe({
      next: (employes) => {
        console.log('✅ Employés reçus:', employes);

        // 2. Récupère tous les départements
        this.departementService.getAllDepartements().subscribe({
          next: (departements) => {
            console.log('✅ Départements reçus:', departements);

            // 3. Crée un mapping ID (string) → Nom
            const deptMap = new Map<string, string>();
            departements.forEach((dept: any) => {
              const idStr = String(dept.id); // ✅ Toujours en string
              deptMap.set(idStr, dept.nom);
              console.log(`Mapping: ID=${idStr} → Nom=${dept.nom}`);
            });

            // 4. Ajoute le nom du département à chaque employé
            this.employes = employes.map(emp => {
              const deptIdStr = String(emp.departementId); // ✅ Toujours convertir en string
              const nom = deptMap.get(deptIdStr) || 'Département inconnu';
              console.log(`Employé: ${emp.nom} ${emp.prenom} | departmentId=${emp.departmentId} → ${nom}`);
              return {
                ...emp,
                departementNom: nom
              };
            });

            // 5. Initialise la liste filtrée
            this.employesFiltres = [...this.employes];

            // 6. Extraire les noms de départements uniques pour le filtre
            this.departementsDisponibles = [
              ...new Set(
                this.employes.map(e => e.departementNom)
              )
            ].sort();

            // Applique les filtres initiaux (Tous)
            this.appliquerFiltres();
          },
          error: (err) => {
            console.error('Erreur chargement départements:', err);
            // Fallback si échec du chargement des départements
            this.employes = employes.map(emp => ({
              ...emp,
              departementNom: 'Département inconnu'
            }));
            this.employesFiltres = [...this.employes];
            this.departementsDisponibles = ['Département inconnu'];
          }
        });
      },
      error: (err) => {
        console.error('Erreur chargement employés:', err);
      }
    });
  }

  appliquerFiltres() {
  this.employesFiltres = this.employes.filter(e => {
    // CORRECTION ICI : utiliser departementNom, pas departement
    const departementOK = !this.filtreDepartement || e.departementNom === this.filtreDepartement;

    // Filtre par recherche
    const searchOK = !this.searchTerm || 
      e.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      e.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      e.profil.toLowerCase().includes(this.searchTerm.toLowerCase());

    return departementOK && searchOK;
  });
}
  setEmployeId(idemp: any) {
    this.employId = idemp;
    this.showListOfDetails = true;
    this.showList = false;
    this.employeService.getAffectationDetailOfEmploye(idemp).subscribe({
      next: rep => {
        this.affectation = rep;
        console.log('Affectations:', rep);
      },
      error: err => {
        console.error('Erreur récupération affectations:', err);
      }
    });
  }

  deleteAffectation() {
    if (!this.employId || !this.affectationId) {
      console.warn('Données manquantes pour suppression');
      return;
    }

    this.employeService.supprimerAffectation(this.employId, this.affectationId).subscribe({
      next: () => {
        console.log(`Suppression: employé=${this.employId}, licence=${this.affectationId}`);
        this.showDeleteModal = false;
        this.showModalWithMessage(
          'Succès',
          'Affectation supprimée avec succès',
          'success'
        );
        // Rafraîchir la liste des affectations
        this.setEmployeId(this.employId);
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.showDeleteModal = false;
        this.showModalWithMessage(
          'Erreur',
          err.error?.message || 'Une erreur est survenue',
          'error'
        );
      }
    });
  }
}