import { Component, OnInit, HostListener } from '@angular/core';
import { DepartementService } from '../../../services/departement/departement.service'; 
import { Router } from '@angular/router';
import { Departement } from '../../../models/Departement';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DashboardComponent } from "../dashboard/dashboard.component";

@Component({
  selector: 'app-departements',
  imports: [
    ReactiveFormsModule, DashboardComponent,
    DashboardComponent
  ],
  templateUrl: './departements.component.html',
  styleUrl: './departements.component.css',
  standalone: true
})
export class DepartementsComponent implements OnInit {
  departements: any;
  departementID: any;
  showAddForm: boolean = false;
  showUpdateForm: boolean = false;
  showList: boolean = true;
  showDeleteModal: boolean = false;
  showSearchBar = false;
  dropdownOpen: number | null = null;
  filteredDepartement: any[] = [];
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
    nom: new FormControl('', [Validators.required, Validators.minLength(2)]),
  })

  //  injection des depandances via constructeur
  constructor(private departementsService: DepartementService, private router: Router) { }

  // premier chose executer l'ors de la chargement de la page 
  ngOnInit(): void {
    this.getAllDepartements();
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
  // recuperer les departements et stocker dans departements et recopie departements dans filteredDepartement pour son utilisation dans la recherche
  getAllDepartements() {
    this.departementsService.getAllDepartements().subscribe({
      next: rep => {
        this.departements = [...rep].reverse();
        this.filteredDepartement = [...this.departements]
      },
      error: err => { console.log(err.message) }
    });
  }
  //  methode d'ajout d'un departement 

  onSubmit() {
    // recuperer le nom depuis le form
    const dep: Departement = {
      nom: this.formGroup.value.nom || ''
    }
    this.departementsService.addDepartement(dep).subscribe({
      next: (rep) => {
        console.log(rep),
          this.showModalWithMessage(
            'Ok!',
            rep.message,
            'success'
          );
        //  recharger form et la list des departements pour que on peut voir le dep ajouter sans refrechement de page
        this.formGroup.reset();
        this.getAllDepartements();
      },
      error: (err) => {
        console.log(err)
        this.showModalWithMessage(
          'Erreur',
          err.error.message,
          'error'
        );
      }
    })
  }
  //  supprimer le departement
  deleteDepartement() {
    this.departementsService.deleteDepartement(this.departementID).subscribe({
      next: (rep: any) => {
        this.showDeleteModal = false;
        if (rep.success) {
          // recharger la list des departement sans departement supprimee
          this.departements = this.departements.filter((d: Departement) => d.id !== this.departementID);
          console.log(rep),
            this.showModalWithMessage(
              'Ok!',
              rep.message,
              'success'
            );
            this.formGroup.reset();
            this.getAllDepartements();
        }
      },
      error: (err) => {
        console.log(err);
        this.showDeleteModal = false;
        this.showModalWithMessage(
          'Erreur',
          err.error.message,
          'error'
        );
        this.formGroup.reset();
        this.getAllDepartements();
      }
    });
  }

  // Recuperer le departement a modifie
  setFormInfoForUpdate() {
    this.getAllDepartements()
    this.departements = this.departementsService.getDepartementById(this.departementID).subscribe({
      next: (rep) => {
        this.departements = rep;
        console.log(rep);
        // remplire form par les donnees recuperee
        this.formGroup.patchValue({
          nom: rep.nom,
        })
      },
      error: (err) => { console.log("erreur") }
    });
  }

  // modifier departement

  updateDepartement() {
    const departementUpdated: Departement = {
      //recuperer les donnee remplit dans form si il sont modifie sinon conserve l'ancienne
      nom: this.formGroup.value.nom || this.departements.nom,
    }
    this.departementsService.updateDepartement(this.departementID, departementUpdated).subscribe({
      next: (rep) => {
        console.log(rep),
          this.showModalWithMessage(
            'Ok!',
            rep.message,
            'success'
          ); this.getAllDepartements();
      },
      error: (err) => {
        this.showModalWithMessage(
          'Erreur',
          err.error.message,
          'error'
        );
        this.getAllDepartements();
      }
    })
  }
  // afficher  le model de confirmation de suppression de departement  et recuperer departementId
  setDepartementIdForDelete(id: any) {
    this.departementID = id;
    this.showDeleteModal = true;

  }
  // rechercher un departement par son nom
  filterDepartement() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      // Si le champ est vide, on affiche tous les logiciels
      this.filteredDepartement = [...this.departements];
    } else {
      // Sinon, on filtre
      this.filteredDepartement = this.departements.filter((dep: any) =>
        dep.nom.toLowerCase().includes(term)

      );
    }
  }

  //  pour afficher la petit partie du action (supprimer et modifier )
  toggleDropdown(id: number) {
    this.dropdownOpen = this.dropdownOpen === id ? null : id;
  }

  setShowAddForm() {
    this.showUpdateForm = false;
    this.showList = true
    this.showAddForm = true;
  }
  setShowUpdateForm(id: any) {
    this.departementID = id;
    this.showAddForm = false;
    this.showUpdateForm = true;
    this.setFormInfoForUpdate()

  }

  setShowList() {
    this.showList = true;
    this.showAddForm = false;
    this.showUpdateForm = false;
    this.getAllDepartements();
  }

}



