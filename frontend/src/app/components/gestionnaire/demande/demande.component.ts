import { Component, OnInit, HostListener } from '@angular/core';
import { DepartementService } from '../../../services/departement/departement.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { DemandeService } from '../../../services/demande/demande.service';
import { LogicielService } from '../../../services/logiciel/logiciel.service';
import { NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';


@Component({
  selector: 'app-demande',

  imports: [ReactiveFormsModule, NgForOf, NgClass, NgIf, ReactiveFormsModule, FormsModule, NgTemplateOutlet],

  templateUrl: './demande.component.html',
  styleUrl: './demande.component.css'
})



export class DemandeComponentt implements OnInit {
  demandes: any;
  demandeID: any;
  showList: boolean = true;
  selectedDemande: any | null = null;
  logicielId: any
  showConfirmModal = false;
  confirmAction: 'accepter' | 'refuser' | null = null;
  dropdownOpen: number | null = null;
  filteredDemandes: any[] = [];
  logicielsDisponibles: any[] = [];
  filtreStatut: any = '';
  filtreLogiciel: any = '';
  filtreVersion: any = '';
  filtreCategorie: any = '';
  versionsDisponibles: any[] = [];
  categoriesDisponibles: any[] = [];
  filtreDepartement: string = '';
  departementsDisponibles: any[] = []; 
  motifRefus: string = ''; 


  // Pour gérer la modale
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
  constructor(private demandeService: DemandeService, private logicielService: LogicielService, private router: Router) { }
  ngOnInit(): void {
    this.getAllDemandes();
  }

  getAllDemandes() {
  this.demandeService.getAllDemandes().subscribe({
    next: (data) => {
      // Trie par date de création (du plus récent au plus ancien)
      // Si tu as un champ `dateCreation`, utilise-le
      // Sinon, trie par ID (si auto-incrémenté)
      this.demandes = [...data].sort((a, b) => {
        // Option 1: Si tu as un champ `dateCreation`
        // return new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();

        // Option 2: Si tu n'as pas de date, trie par ID (du plus grand au plus petit)
        return (b.id || 0) - (a.id || 0);
      });

      this.filteredDemandes = [...this.demandes];

      // Extraire les filtres
      this.departementsDisponibles = [
        ...new Set(
          this.demandes
            .map((d: any) => d.departementResponsable)
            .filter((dept: any): dept is string => !!dept)
        )
      ];

      this.logicielsDisponibles = [
        ...new Set(
          this.demandes
            .map((d: any) => d.nomLogiciel)
            .filter((nom: any): nom is string => !!nom)
        )
      ];

      this.versionsDisponibles = [
        ...new Set(
          this.demandes
            .map((d: any) => d.versionLogiciel)
            .filter((v: any): v is string => !!v)
        )
      ];

      this.categoriesDisponibles = [
        ...new Set(
          this.demandes
            .map((d: any) => d.categorieLogiciel)
            .filter((c: any): c is string => !!c)
        )
      ];

      this.appliquerFiltres();
    },
    error: (err) => {
      console.error('Erreur lors du chargement des demandes :', err);
    }
  });
}
  get demandesFiltrees() {
    if (this.filtreStatut === 'Tous') {
      this.filteredDemandes = this.demandes
      return this.filteredDemandes;
    }

    if (this.filtreStatut === 'En cours') {
      return this.demandes.filter((d: any) =>
        d.statut !== 'Acceptée' && d.statut !== 'Refusée'
      );
    }

    return this.demandes.filter((d: any) => d.statut === this.filtreStatut);
  }


  setShowList() {
    this.showList = true;
    this.getAllDemandes();
  }

  openDetail(demande: any) {
    this.selectedDemande = { ...demande }; // Copie pour éviter les mutations
  }

  closeDetail() {
    this.selectedDemande = null;
  }





  telechargerPDF() {
    // Ici tu peux générer un PDF ou télécharger les données
    alert('Téléchargement du PDF (à implémenter avec jsPDF ou impression)');
    // Exemple : imprimer les détails
    const printContent = `
      <h2>Détail de la demande</h2>
      <p><strong>Logiciel :</strong> ${this.selectedDemande?.nomLogiciel}</p>
      <p><strong>Licences :</strong> ${this.selectedDemande?.nbLicences}</p>
      <p><strong>Responsable :</strong> ${this.selectedDemande?.responsable.nom} ${this.selectedDemande?.responsable.prenom}</p>
      <p><strong>Statut :</strong> ${this.selectedDemande?.statut}</p>
    `;
    const newWin = window.open('', '_blank');
    newWin?.document.write(printContent);
    newWin?.document.close();
    newWin?.print();
  }




  refuserDemande(id: any) {
    if (!this.motifRefus?.trim()) {
      this.showModalWithMessage('Erreur', 'Veuillez indiquer un motif de refus.', 'error');
      return;
    }

    this.showConfirmModal = false;

    // Appelle le nouveau endpoint avec le motif
    this.demandeService.refuserAvecMotif(id, this.motifRefus).subscribe({
      next: (rep) => {
        this.showModalWithMessage('Succès', rep.message, 'success');
        this.closeDetail();
        this.getAllDemandes();
        this.motifRefus = ''; // Réinitialise après envoi
      },
      error: (err) => {
        this.showModalWithMessage('Erreur', err.error?.message || 'Erreur lors du refus', 'error');
      }
    });
  }

  annulerConfirmation() {
    this.showConfirmModal = false;
    this.motifRefus = '';
  }



  // """"""""""""""""""""""""""""""""""""""""""
  ShowAccepterDemande(idDemand: any, idLogiciel: any, nbrlicence: any) {
    this.showConfirmModal = false;

    this.demandeService.accepter(idDemand).subscribe({
      next: (rep) => {
        this.showModalWithMessage('Ok!', rep.message, 'success');

        if (idLogiciel === null) {
          // 👉 Stocker temporairement l'idDemande dans sessionStorage
          sessionStorage.setItem('pendingDemandeId', idDemand.toString());

          setTimeout(() => {
            this.router.navigate(['/dash-gestionnaire/logiciel'], {
              state: { idDemande: idDemand } // Toujours utile pour navigation directe
            });
          }, 1500);
        } else {
          this.logicielService.updateNbrLicenceOfLogiciel(idLogiciel, nbrlicence).subscribe({
            next: (rep) => console.log('Licences mises à jour:', rep),
            error: (err) => console.log('Erreur mise à jour:', err)
          });

          setTimeout(() => {
            this.router.navigate(['/dash-gestionnaire/logiciel', idLogiciel, 'licences']);
          }, 1500);
        }
      },
      error: (err) => {
        this.showModalWithMessage('Erreur', err.error.message, 'error');
      }
    });
  }

  showConfirmModalFunction(demande: any, rep: any) {
    this.selectedDemande = demande;
    this.showConfirmModal = true;
    this.confirmAction = rep;
    if (rep === 'refuser') {
      this.motifRefus = ''; 
    }
  }
  toggleDropdown(id: number) {
    this.dropdownOpen = this.dropdownOpen === id ? null : id;
  }


  appliquerFiltres() {
    this.filteredDemandes = this.demandes.filter((demande: any) => {
      const statutOK = !this.filtreStatut || demande.statut?.toLowerCase().includes(this.filtreStatut.toLowerCase());
      const logicielOK = !this.filtreLogiciel || demande.nomLogiciel.toLowerCase().includes(this.filtreLogiciel.toLowerCase());
      const versionOK = !this.filtreVersion || demande.versionLogiciel.toLowerCase().includes(this.filtreVersion.toLowerCase());
      const categorieOK = !this.filtreCategorie || demande.categorieLogiciel.toLowerCase().includes(this.filtreCategorie.toLowerCase());
      const departementOK = !this.filtreDepartement || demande.departementResponsable?.toLowerCase().includes(this.filtreDepartement.toLowerCase());

      return statutOK && logicielOK && versionOK && categorieOK && departementOK;
    });
  }

  showModals: any

  selectedEmployes: any[] = [];

  openEmployesModal(employes: any[]): void {
    this.selectedEmployes = employes;
    this.showModals = true;
  }

  closeModal(): void {
    this.showModals = false;
    this.selectedEmployes = [];
  }

  gererLicence(logicielId: number, demandeId: number) {
    console.log('Navigation avec:', { logicielId, demandeId });

    // Stocker l'ID de demande dans sessionStorage
    sessionStorage.setItem('currentDemandeId', demandeId.toString());

    this.router.navigate(['/dash-gestionnaire/logiciel', logicielId, 'licences'], {
      state: { idDemande: demandeId }
    });
  }

  

}