import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {DemandeService} from '../../../services/demande/demande.service';
import {LoginService} from '../../../services/auth/login.service';
import {Demande} from '../../../models/demande.model';
import {EmployeService} from '../../../services/employe/employe.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-demande',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './demande.component.html',
  styleUrl: './demande.component.css',
  standalone:true
})
export class DemandeComponent implements OnInit{
  demandes: any[] = [];
  loading = true;
  filteredDemandes: Demande[] = [];
  logicielsDisponibles: string[] = [];
  filtreStatut: string = '';
  filtreLogiciel: string = '';
  filtreVersion: string = '';
  filtreCategorie: string = '';
  versionsDisponibles: string[] = [];
  categoriesDisponibles: string[] = [];



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


  constructor(private demandeService:DemandeService) {
  }

  ngOnInit(): void {
    this.demandeService.getDemandesDuResponsable().subscribe({
      next: (data) => {
        console.log(data)
        this.demandes = [...data].reverse();
        this.logicielsDisponibles = [
          ...new Set(
            data
              .map(d => d.nomLogiciel) // Récupère tous les noms
              .filter((nom): nom is string => !!nom) // Filtre les undefined/null
          )
        ];
        // Versions uniques
        this.versionsDisponibles = [
          ...new Set(
            data
              .map(d => d.versionLogiciel)
              .filter((v): v is string => !!v)
          )
        ];

        // Catégories uniques
        this.categoriesDisponibles = [
          ...new Set(
            data
              .map(d => d.categorieLogiciel)
              .filter((c): c is string => !!c)
          )
        ];
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des demandes :', err);
        this.loading = false;
      }
    });

  }
  appliquerFiltres() {
    this.filteredDemandes = this.demandes.filter(demande => {
      const statutOK = !this.filtreStatut || demande.statut?.toLowerCase().includes(this.filtreStatut.toLowerCase());
      const logicielOK = !this.filtreLogiciel || demande.nomLogiciel.toLowerCase().includes(this.filtreLogiciel.toLowerCase());
      const versionOK = !this.filtreVersion || demande.versionLogiciel.toLowerCase().includes(this.filtreVersion.toLowerCase());
      const categorieOK = !this.filtreCategorie || demande.categorieLogiciel.toLowerCase().includes(this.filtreCategorie.toLowerCase());

      return statutOK && logicielOK && versionOK && categorieOK  ;
    });
  }



  showModals:any

  selectedEmployes: any[] = [];

  openEmployesModal(employes: any[]): void {
    this.selectedEmployes = employes;
    this.showModals = true;
  }

  closeModal(): void {
    this.showModals = false;
    this.selectedEmployes = [];
  }


  //""""""""""""""""""""MODIF ICI """"""""""""""""""""""""""""""""""""""""""
  selectedDemande : any
  idEmploye :any
  showAffectationForm:any
  licencesNonAffectees:any
  selectedLicenceId :any
  showListOfDemandes:boolean = true

  openDetail(demande: any) {
    this.showListOfDemandes = false
    this.selectedDemande = { ...demande }; // Copie pour éviter les mutations
  }

  getLicenceNoAffecteraffecter(logicielId:any ,idemploye:any) {
    this.idEmploye = idemploye;
    const idLogiciel = logicielId;
    console.log(idLogiciel)
    console.log(this.idEmploye)

    this.showAffectationForm = true;

    this.demandeService.getLicenceNoAffecteraffecter(idLogiciel).subscribe({
      next:(rep)=>{this.licencesNonAffectees=rep
        console.log(rep)
      },
      error:(err)=>{console.log(err)}
    });
  }
  onLicenceChange(event: any): void {
    this.selectedLicenceId = event.target.value
    console.log('Licence sélectionnée ID :', this.selectedLicenceId);
  }

  affecter(){
    console.log("employe id"+this.idEmploye)
    console.log("licence id"+this.selectedLicenceId)
    this.demandeService.affecter(this.idEmploye,this.selectedLicenceId).subscribe({
      next:(rep)=>{
        console.log(rep)
        this.showModalWithMessage(
          'Ok!',
          rep.message,
          'success'
        );
        this.showAffectationForm=false
           },
      error:(err)=>{
        console.log(err)
        this.showModalWithMessage(
          'Erreur',
          err.error.message,
          'error'
        );
        }
    });
  }

}
