import { Component, OnInit } from '@angular/core';
import { DepartementService } from '../../../services/departement/departement.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeService } from '../../../services/employe/employe.service';
import { Employe } from '../../../models/Employe';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-employe',
  imports: [
    ReactiveFormsModule,
    NgForOf
  ],
  templateUrl: './employe.component.html',
  styleUrl: './employe.component.css'
})
export class EmployeComponent {
  employes: any;
  departements: any;
  departementID: any;
  departementNom: any
  employeID: any;
  showAddForm: boolean = false;
  showUpdateForm: boolean = false;
  showList: boolean = true;
  showDeleteModal: boolean = false;
  showSearchBar = false;
  dropdownOpen: number | null = null;
  filteredEmploye: any[] = [];
  searchTerm = '';

  // Pour gérer l'affichage  du messge du back end 
  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'success' | 'error' = 'success';

  // Méthode pour afficher la modale
  showModalWithMessage(title: string, message: string, type: 'success' | 'error') {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.showModal = true;
  }

  // Méthode pour fermer la modale de confirmation de supp
  closeModal() {
    this.showModal = false;
  }

  formGroup = new FormGroup({
    nom: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern("^[a-zA-ZÀ-ÿ '-]+$") // Lettres, accents, apostrophes, tirets
    ]),
    prenom: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern("^[a-zA-ZÀ-ÿ '-]+$")
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
    ]),
    profil: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern("^[a-zA-Z0-9 '-]+$") // Accepte lettres, chiffres, espaces, tirets
    ]),
    departementId: new FormControl('', [
      Validators.required
    ])
  });

  constructor(private departementsService: DepartementService, private employeService: EmployeService, private router: Router) { }
  ngOnInit(): void {
    this.getAllDepartements();
    this.loadAllEmployes(); // ← Nouvelle méthode
  }

  ngAfterViewInit(): void {
    document.addEventListener('click', (event: Event) => {
      if (!this.dropdownOpen) return;
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.fa-ellipsis-v')) {
        this.dropdownOpen = null;
      }
    });
  }
  // get tout les departement
  getAllDepartements() {
    this.departementsService.getAllDepartements().subscribe({
      next: rep => { this.departements = rep },
      error: err => { console.log(err.message) }
    });
  }

  // get les employes de departement selectionne 
  getAllEmployes() {
    this.employeService.getAllEmployes(this.departementID).subscribe({
      next: rep => {
        this.employes = [...rep].reverse();
        this.filteredEmploye = [...this.employes]
      },
      error: err => { console.log(err) },
    })
  }
  //  recuperer les employes de departement choisi l ors du changement 
  onDepartementChange(event: any): void {
    this.departementID = event.target.value;
    if (this.departementID) {
      this.employeService.getAllEmployes(this.departementID).subscribe({
        next: rep => {
          this.employes = [...rep].reverse();
          this.filteredEmploye = [...this.employes];
          this.departementsService.getDepartementById(this.departementID).subscribe({
            next: dep => {
              this.departementNom = dep.nom;
            },
            error: err => { console.log(err) }
          });
        },
        error: err => { console.log(err) }
      });
    } else {
      // Si "Tous les départements", charge tous les employés
      this.loadAllEmployes();
    }
  }

  // ajouter un employe 
  addEmploye(): void {
    if (this.formGroup.invalid) return;

    const employe: any = {
      nom: this.formGroup.value.nom,
      prenom: this.formGroup.value.prenom,
      email: this.formGroup.value.email,
      profil: this.formGroup.value.profil,
      departementId: this.formGroup.value.departementId // ← Ajouté
    };

    this.employeService.addEmploye(employe).subscribe({
      next: (rep) => {
        if (rep.success) {
          this.formGroup.reset();
          this.loadAllEmployes(); // Recharge tous les employés
          this.showModalWithMessage(
            'Ok!',
            rep.message,
            'success'
          );
        }
      },
      error: (err) => {
        this.showModalWithMessage(
          'Erreur',
          err.error?.message || 'Erreur lors de l\'ajout',
          'error'
        );
      }
    });
  }


  //  remplire le form avant la modification
  setFormInfoForUpdate() {
    this.employeService.getEmployeById(this.employeID).subscribe({
      next: (rep) => {
        this.formGroup.patchValue({
          nom: rep.nom,
          prenom: rep.prenom,
          email: rep.email,
          profil: rep.profil,
          departementId: rep.departementId
        });
      },
      error: (err) => {
        console.log("Erreur lors du chargement de l'employé:", err);
      }
    });
  }

  // modifier l employe 
  updateEmploye() {
    if (this.formGroup.invalid) return;

    const employeUpdated: any = {
      nom: this.formGroup.value.nom,
      prenom: this.formGroup.value.prenom,
      email: this.formGroup.value.email,
      profil: this.formGroup.value.profil,
      departementId: this.formGroup.value.departementId
    };

    this.employeService.updateEmploye(this.employeID, employeUpdated).subscribe({
      next: (rep) => {
        if (rep.success) {
          this.loadAllEmployes(); // Recharge tous les employés
          this.showUpdateForm = false;
          this.showModalWithMessage('Succès', rep.message, 'success');
        }
      },
      error: (err) => {
        this.showModalWithMessage('Erreur', err.error?.message || 'Erreur inconnue', 'error');
      }
    });
  }

  // supprimer employe  et recharger la list des employes
  deleteEmploye(): void {
    this.employeService.deleteEmploye(this.employeID).subscribe({
      next: (rep: any) => {
        this.showDeleteModal = false;
        if (rep.success) {
          // Rafraîchir la liste selon le contexte
          if (this.departementID) {
            this.getAllEmployes(); // Recharge pour le département sélectionné
          } else {
            this.loadAllEmployes(); // Recharge tous les employés
          }
          this.showModalWithMessage('Succès', rep.message, 'success');
        }
      },
      error: (err) => {
        this.showDeleteModal = false;
        this.showModalWithMessage('Erreur', err.error?.message || 'Erreur inconnue', 'error');
      }
    });
  }


  //  afficher le petit model de supp et modif dans le colone action 
  toggleDropdown(id: number): void {
    this.dropdownOpen = this.dropdownOpen === id ? null : id;
  }

  // rechercher par une mot clee
  filterEmployet() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      // Si le champ est vide, on affiche tous les logiciels
      this.filteredEmploye = [...this.employes];
    } else {
      // Sinon, on filtre
      this.filteredEmploye = this.employes.filter((emp: any) =>
        emp.nom.toLowerCase().includes(term) ||
        emp.prenom.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.profil.toLowerCase().includes(term)

      );
    }
  }


  setShowAddForm(): void {
    this.showAddForm = true;
    this.showUpdateForm = false;
    this.showDeleteModal = false;
    this.formGroup.reset({ departementId: null });
  }


  setShowList(): void {
    this.showList = true;
    this.showAddForm = false;
    this.showUpdateForm = false;
    this.showDeleteModal = false;
    this.dropdownOpen = null;
    this.getAllEmployes();
  }

  setIdEmpoye(id: any): void {
    this.employeID = id;
    this.showDeleteModal = true;
    this.dropdownOpen = null; // Ferme le menu
  }
  setShowUpdateForm(id: any): void {
    this.employeID = id;
    this.showAddForm = false;
    this.showUpdateForm = true;
    this.showDeleteModal = false;
    this.setFormInfoForUpdate();
  }

  loadAllEmployes(): void {
    this.employeService.getAllEmployess().subscribe({
      next: rep => {
        this.employes = [...rep].reverse();
        this.filteredEmploye = [...this.employes];
      },
      error: err => {
        console.log(err);
      }
    });
  }
}








