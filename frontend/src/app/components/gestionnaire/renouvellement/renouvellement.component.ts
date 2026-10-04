import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { LicenceService } from '../../../services/licence/licence.service';
import { LoginService } from '../../../services/auth/login.service';
import { Router } from '@angular/router';
import { User } from '../../../models/user.model';
import { Licence } from '../../../models/licence.model';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';
@Component({
  selector: 'app-renouvellement',
  imports: [ReactiveFormsModule, // ← Pour [formControl]
    NgClass,
    NgIf,
    NgForOf,
    FormsModule],
  templateUrl: './renouvellement.component.html',
  styleUrl: './renouvellement.component.css'
})
export class RenouvellementComponent implements OnInit {
  demandes: any[] = [];
  filteredDemandes: any;
  loading = true;
  error: string | null = null;

  // Filtres
  filtreStatut: string = '';
  filtreLogiciel: string = '';
  filtreDepartement: string = '';

  // Dropdown
  dropdownOpen: number | null = null;

  // Modale de confirmation
  showConfirmModal = false;
  confirmAction: 'approuver' | 'rejeter' | 'supprimer' | null = null;
  selectedDemande: any | null = null;
  motifRefus: string = '';

  // Notification
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' = 'success';
  // === ETAT DE LOADING POUR ACTIONS ===
  actionLoading = false;


  constructor(
    private demandeService: LicenceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.chargerDemandes();
  }

  chargerDemandes() {
    this.loading = true;
    this.demandeService.getAllDemandes().subscribe({
      next: (data) => {
        // Trie par date de création (du plus récent au plus ancien)
        this.demandes = [...data].sort((a, b) => {
          return new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
        });
        this.filteredDemandes = [...this.demandes];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger les demandes.';
        this.loading = false;
      }
    });
  }

  // === MODAL ===
  showModalWithMessage(title: string, message: string, type: 'success' | 'error') {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // === DROPDOWN ===
  toggleDropdown(id: number) {
    this.dropdownOpen = this.dropdownOpen === id ? null : id;
  }

  // === CONFIRMATION ===
  showConfirmModalFunction(demande: any, action: 'approuver' | 'rejeter' | 'supprimer') {
    this.selectedDemande = demande;
    this.confirmAction = action;
    this.showConfirmModal = true;
    if (action === 'rejeter') {
      this.motifRefus = '';
    }
  }

  annulerConfirmation() {
    this.showConfirmModal = false;
    this.motifRefus = '';
  }

  // === ACTIONS ===
  approuverDemande() {
  if (!this.selectedDemande) return;
  this.actionLoading = true;

  this.demandeService.approuverDemande(this.selectedDemande.id).subscribe({
    next: () => {
      this.showModalWithMessage('Approuvé', 'La demande a été approuvée avec succès.', 'success');
      this.chargerDemandes();
      this.annulerConfirmation();
      this.actionLoading = false;
    },
    error: () => {
      this.showModalWithMessage('Erreur', 'Impossible d’approuver la demande.', 'error');
      this.actionLoading = false;
    }
  });
}

rejeterDemande() {
  if (!this.selectedDemande || !this.motifRefus.trim()) {
    this.showModalWithMessage('Erreur', 'Le motif de refus est obligatoire.', 'error');
    return;
  }
  this.actionLoading = true;

  this.demandeService.rejeterDemande(this.selectedDemande.id, this.motifRefus).subscribe({
    next: () => {
      this.showModalWithMessage('Rejeté', 'La demande a été rejetée avec succès.', 'success');
      this.chargerDemandes();
      this.annulerConfirmation();
      this.actionLoading = false;
    },
    error: () => {
      this.showModalWithMessage('Erreur', 'Impossible de rejeter la demande.', 'error');
      this.actionLoading = false;
    }
  });
}


  supprimerDemande() {
    if (!this.selectedDemande) return;

    this.demandeService.supprimerDemande(this.selectedDemande.id).subscribe({
      next: () => {
        this.showModalWithMessage('Supprimé', 'La demande a été supprimée avec succès.', 'success');
        this.chargerDemandes();
        this.annulerConfirmation();
      },
      error: (err) => {
        this.showModalWithMessage('Erreur', 'Impossible de supprimer la demande.', 'error');
      }
    });
  }

  // === FILTRES ===
  appliquerFiltres() {
    this.filteredDemandes = this.demandes.filter(demande => {
      const statutOK = !this.filtreStatut || demande.statut?.toLowerCase().includes(this.filtreStatut.toLowerCase());
      const logicielOK = !this.filtreLogiciel || demande.logicielNom.toLowerCase().includes(this.filtreLogiciel.toLowerCase());
      const departementOK = !this.filtreDepartement || demande.demandeurDepartement?.toLowerCase().includes(this.filtreDepartement.toLowerCase());
      return statutOK && logicielOK && departementOK;
    });
  }

  // === UTILITAIRES ===
  formatDate(iso?: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${this.pad(d.getDate())}/${this.pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  private pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
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
}
