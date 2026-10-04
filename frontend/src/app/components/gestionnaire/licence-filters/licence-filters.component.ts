import { Component, OnInit } from '@angular/core';
import { DepartementService } from '../../../services/departement/departement.service';
import { Router } from '@angular/router';
import { EmployeService } from '../../../services/employe/employe.service';
import { LicenceService } from '../../../services/licence/licence.service';
import { Licence } from '../../../models/Licence';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';



@Component({
  selector: 'app-licence-filters',
  imports: [NgForOf, NgClass, NgIf, ReactiveFormsModule, FormsModule],
  templateUrl: './licence-filters.component.html',
  styleUrl: './licence-filters.component.css'
})
export class LicenceFiltersComponent {
  licences: any;
  departements: any;
  departementID: any;
  filteredLicences: any[] = [];
  filtreStatut: string = '';
  filtreLogiciel: string = '';
  filtreVersion: string = '';
  logicielsDisponibles: string[] = [];
  versionsDisponibles: string[] = [];
  filtreAnnee: string = '';
  filtreMois: string = '';
  anneesDisponibles: number[] = [];
  moisDisponibles = [
    { value: '1', nom: 'Janvier' },
    { value: '2', nom: 'Février' },
    { value: '3', nom: 'Mars' },
    { value: '4', nom: 'Avril' },
    { value: '5', nom: 'Mai' },
    { value: '6', nom: 'Juin' },
    { value: '7', nom: 'Juillet' },
    { value: '8', nom: 'Août' },
    { value: '9', nom: 'Septembre' },
    { value: '10', nom: 'Octobre' },
    { value: '11', nom: 'Novembre' },
    { value: '12', nom: 'Décembre' },
  ];
  showRenouvlerForm: boolean = false;
  showSearchBar = false;
  searchTerm = '';

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.appliquerFiltres();
  }
  formGroupRenuvler = new FormGroup({
    dateFinARenouvler: new FormControl('', [Validators.required]),
  });






  constructor(private departementsService: DepartementService, private licenceServices: LicenceService, private router: Router) { }
  ngOnInit(): void {
    this.getAllDepartements();
    this.startTicker();
  }

  // get tout les departement
  getAllDepartements() {
    this.departementsService.getAllDepartements().subscribe({
      next: rep => {
        this.departements = rep;
        if (this.departements.length > 0) {
          this.departementID = this.departements[0].id; // ← Sélectionne le premier département
          this.getAllLicenceOfDeapartement(); // ← Charge les licences
        }
      },
      error: err => { console.log(err.message) }
    });
  }

  // get les licences de departement selectionne 
  getAllLicenceOfDeapartement() {
    this.licenceServices.getLicencesParDepartement(this.departementID).subscribe({
      next: (rep) => {
        console.log(rep);
        this.licences = rep;
        this.extractLogicielsDisponibles();
        this.extractVersionsDisponibles();
        this.extractAnneesDisponibles();
        this.startTicker();
        this.appliquerFiltres();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }



  setShowRenouvlerLicence(id: number): void {
    this.licenceID = id;
    this.showRenouvlerForm = true;

    // Pré-remplir avec la date actuelle + 1 an
    const licence = this.licences.find((l: any) => l.id === id);
    if (licence && licence.dateFin) {
      const dateObj = new Date(licence.dateFin);
      dateObj.setFullYear(dateObj.getFullYear() + 1);
      const nouvelleDateFin = dateObj.toISOString().split('T')[0];
      this.formGroupRenuvler.patchValue({
        dateFinARenouvler: nouvelleDateFin
      });
    }
  }

  onSubmitRenouvellement(): void {
    if (!this.licenceID) return;

    const nouvelleDate = this.formGroupRenuvler.value.dateFinARenouvler;
    if (!nouvelleDate) {
      this.showModalWithMessage('Erreur', 'Veuillez sélectionner une date.', 'error');
      return;
    }


    this.licenceServices.ronouvler(this.licenceID, nouvelleDate).subscribe({
      next: (rep) => {
        this.showModalWithMessage('Succès', rep.message, 'success');
        this.annulerRenouvellement();
        this.getAllLicenceOfDeapartement(); // Rafraîchit les licences

      },
      error: (err) => {
        this.showModalWithMessage('Erreur', err.error?.message || 'Échec du renouvellement.', 'error');
      }
    });
  }

  annulerRenouvellement(): void {
    this.showRenouvlerForm = false;
    this.formGroupRenuvler.reset();
    this.licenceID = null;
  }


  // Extraction des logiciels uniques pour filtre
  extractLogicielsDisponibles() {
    console.log(this.licences)
    const logicielsSet = new Set<string>();
    this.licences.forEach((lic: any) => {
      if (lic.logicielNom) {
        logicielsSet.add(lic.logicielNom);
      }
    });
    this.logicielsDisponibles = Array.from(logicielsSet).sort();
  }

  // ✅ Extraction des versions uniques
  extractVersionsDisponibles() {
    const versionsSet = new Set<string>();
    this.licences.forEach((lic: any) => {
      if (lic.vesrionLogiciel) {
        versionsSet.add(lic.vesrionLogiciel);
      }
    });
    this.versionsDisponibles = Array.from(versionsSet).sort();
  }


  //  recuperer les employes de departement choisi l ors du changement 
  onDepartementChange(event: any): void {
    this.departementID = event.target.value;
    this.resetFilters(); // ⬅️ Réinitialise les filtres
    this.getAllLicenceOfDeapartement();
  }

  resetFilters() {
    this.filtreStatut = '';
    this.filtreLogiciel = '';
    this.filtreVersion = '';
  }





  // hjjjjjjjjjjjjjjjjjj"""""""""""""""""""""""""""





  appliquerFiltres() {
  if (!this.licences || this.licences.length === 0) {
    this.filteredLicences = [];
    return;
  }

  this.filteredLicences = this.licences.filter((licence: any) => {
    // Filtre par recherche
    const searchOK = !this.searchTerm || 
      licence.cleLicence?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      licence.logicielNom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      licence.categorieLogiciel?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      licence.vesrionLogiciel?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      licence.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      licence.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      licence.email?.toLowerCase().includes(this.searchTerm.toLowerCase());

    // Filtre par statut
    const statutOK =
      !this.filtreStatut ||
      licence.statut?.toLowerCase().includes(this.filtreStatut.toLowerCase());

    // Filtre par logiciel
    const logicielOK =
      !this.filtreLogiciel ||
      licence.logicielNom?.toLowerCase().includes(this.filtreLogiciel.toLowerCase());

    // Filtre par version
    const versionOK =
      !this.filtreVersion ||
      licence.vesrionLogiciel?.toLowerCase().includes(this.filtreVersion.toLowerCase());

    // Filtre par date
    let dateOK = true;
    if (this.filtreAnnee || this.filtreMois) {
      if (!licence.dateFin) return false;
      const dateFin = new Date(licence.dateFin);
      if (this.filtreAnnee) dateOK = dateOK && dateFin.getFullYear() === +this.filtreAnnee;
      if (this.filtreMois) dateOK = dateOK && dateFin.getMonth() + 1 === +this.filtreMois;
    }

    return searchOK && statutOK && logicielOK && versionOK && dateOK;
  });
}
  




  loading = true;
  error: string | null = null;
  departmentId?: any;
  private tickSub?: Subscription;
  filtreCategorie: string = '';
  categoriesDisponibles: string[] = [];












  private startTicker() {
    this.tickSub = interval(1000).subscribe(() => {
      // Pas besoin de recalcul explicite ici, Angular rafraîchira le template
    });
  }

  private stopTicker() {
    this.tickSub?.unsubscribe();
  }

  isExpired(lic: Licence): boolean {
    if (!lic.dateFin) return false;
    return new Date(lic.dateFin).getTime() < Date.now();
  }

  timeRemainingObj(lic: Licence) {
    if (!lic.dateFin) return null;

    const end = new Date(lic.dateFin).getTime();
    const now = Date.now();
    let diff = end - now;

    if (diff <= 0) {
      return {
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true,
        totalDays: 0,
      };
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 30);
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    return { months, days, hours, minutes, seconds, expired: false, totalDays };
  }

  formatDate(iso?: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${this.pad(d.getDate())}/${this.pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  private pad(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }

  getDaysRemaining(lic: Licence): number {
    if (!lic.dateFin) return 0;
    const end = new Date(lic.dateFin).getTime();
    const now = Date.now();
    const diff = end - now;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }


  extractAnneesDisponibles() {
    const anneesSet = new Set<number>();
    this.licences.forEach((lic: any) => {
      if (lic.dateFin) {
        const annee = new Date(lic.dateFin).getFullYear();
        anneesSet.add(annee);
      }
    });
    this.anneesDisponibles = Array.from(anneesSet).sort((a, b) => a - b);
  }





  oldDatFin?: any;
  licenceID: any


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






}

