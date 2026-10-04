import { Component, OnInit } from '@angular/core';
import { Licence } from '../../../models/licence.model';
import { LicenceService } from '../../../services/licence/licence.service';
import { interval, Subscription } from 'rxjs';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { User } from '../../../models/user.model';
import { LoginService } from '../../../services/auth/login.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-etat-licence',
  imports: [NgForOf, NgClass, NgIf, ReactiveFormsModule, FormsModule],
  templateUrl: './etat-licence.component.html',
  styleUrl: './etat-licence.component.css',
  standalone: true,
})
export class EtatLicenceComponent implements OnInit {
  showRenouvlerForm: boolean = false;
  licences: Licence[] = [];
  filteredLicences: Licence[] = [];
  loading = true;
  error: string | null = null;
  departmentId?: any;
  private tickSub?: Subscription;
  filtreVersion: string = '';
  filtreCategorie: string = '';
  versionsDisponibles: string[] = [];
  categoriesDisponibles: string[] = [];
  filtreStatut: string = '';
  filtreLogiciel: string = '';
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

  logicielsDisponibles: string[] = [];
  // === Nouvelles propriétés pour le renouvellement groupé ===
  modeRenouvellement: boolean = false; // ← Active/désactive le mode sélection
  licencesSelectionnees: { [key: number]: boolean } = {}; // licenceId → sélectionnée ?
  formGroupRenouvellement = new FormGroup({
    dateFinCommune: new FormControl('', [Validators.required])
  });
  oldDatFin?: any;
  licenceID: any


  // Pour gérer l'affichage  du messge du back end 
  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'success' | 'error' = 'success';

  constructor(
    private licenceService: LicenceService,
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginService.getUser().subscribe((user: User | null | undefined) => {
      if (!user || !user.departmentId) {
        console.warn('Utilisateur ou département non trouvé');
        this.loading = false;
        return;
      }

      this.departmentId = user.departmentId;
      this.getLicencesByDepartement(this.departmentId);
    });
  }

  getLicencesByDepartement(departementId: any) {
    this.licenceService.getLicencesParDepartement(departementId).subscribe({
      next: (data) => {
        this.licences = Array.isArray(data) ? data : [];
        this.filteredLicences = [...this.licences];
        this.loading = false;
        this.licencesSelectionnees = {};
        this.licences.forEach(lic => {
          if (lic.licenceId != null) { // ← Vérifie que licenceId est défini (ni null ni undefined)
            this.licencesSelectionnees[lic.licenceId] = false;
          }
        });
        this.extractLogicielsDisponibles();
        this.extractAnneesDisponibles();
        this.extractVersionsDisponibles();
        this.extractCategoriesDisponibles();
        console.log(this.licences)

        this.startTicker();
      },
      error: (err) => {
        this.error = 'Impossible de charger les licences.';
        this.loading = false;
      },
    });
  }

  // Extraction des versions uniques
  extractVersionsDisponibles() {
    const set = new Set<string>();
    this.licences.forEach(lic => {
      if (lic.vesrionLogiciel) set.add(lic.vesrionLogiciel);
    });
    this.versionsDisponibles = Array.from(set).sort();
  }

  // Extraction des catégories uniques
  extractCategoriesDisponibles() {
    const set = new Set<string>();
    this.licences.forEach(lic => {
      if (lic.categorieLogiciel) set.add(lic.categorieLogiciel);
    });
    this.categoriesDisponibles = Array.from(set).sort();
  }

  // Extraction des logiciels uniques pour filtre
  extractLogicielsDisponibles() {
    const logicielsSet = new Set<string>();
    this.licences.forEach((lic) => {
      if (lic.logicielNom) {
        logicielsSet.add(lic.logicielNom);
      }
    });
    this.logicielsDisponibles = Array.from(logicielsSet).sort();
  }


  // Appliquer filtres
  appliquerFiltres() {
    this.filteredLicences = this.licences.filter(licence => {
      const statutOK =
        !this.filtreStatut ||
        (licence.statut?.toLowerCase() === this.filtreStatut.toLowerCase());

      const logicielOK =
        !this.filtreLogiciel ||
        (licence.logicielNom.toLowerCase() === this.filtreLogiciel.toLowerCase());

      const versionOK =
        !this.filtreVersion ||
        (licence.vesrionLogiciel.toLowerCase() === this.filtreVersion.toLowerCase());

      const categorieOK =
        !this.filtreCategorie ||
        (licence.categorieLogiciel.toLowerCase() === this.filtreCategorie.toLowerCase());

      let dateOK = true;
      if (this.filtreAnnee || this.filtreMois) {
        if (!licence.dateFin) return false;
        const dateFin = new Date(licence.dateFin);
        if (this.filtreAnnee) dateOK = dateOK && dateFin.getFullYear() === +this.filtreAnnee;
        if (this.filtreMois) dateOK = dateOK && dateFin.getMonth() + 1 === +this.filtreMois;
      }

      return statutOK && logicielOK && versionOK && categorieOK && dateOK;
    });
  }





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
    this.licences.forEach((lic) => {
      if (lic.dateFin) {
        const annee = new Date(lic.dateFin).getFullYear();
        anneesSet.add(annee);
      }
    });
    this.anneesDisponibles = Array.from(anneesSet).sort((a, b) => a - b);
  }






  // Méthode pour afficher la modale
  showModalWithMessage(title: string, message: string, type: 'success' | 'error') {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.showModal = true;
  }

  formGroupRenuvler = new FormGroup({
    dateFinARenouvler: new FormControl(this.oldDatFin, [Validators.required]),
  })



  setShowRenouvlerLicence(id: any) {
    this.licenceID = id;
    this.showRenouvlerForm = true;

    // Récupérer la licence pour pré-remplir la date actuelle
    this.licenceService.getLicenceByIdd(id).subscribe({
      next: (licence) => {
        // Extraire la dateFin (ex: "2025-08-22")
        const dateActuelle = licence.dateFin; // Supposé être au format ISO "YYYY-MM-DD"
        console.log(dateActuelle)

        if (dateActuelle) {
          // Pré-remplir le formulaire avec la date actuelle
          this.formGroupRenuvler.patchValue({
            dateFinARenouvler: dateActuelle
          });
        } else {
          // Si pas de dateFin, laisser vide (ou mettre une valeur par défaut)
          this.formGroupRenuvler.reset(); // ou patchValue avec null
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de la licence:', err);
        alert('Impossible de charger les détails de la licence.');
        this.showRenouvlerForm = false;
      }
    });
  }
  annulerRenouvellement() {
    this.showRenouvlerForm = false;
  }

  onSubmitRenouvellement() {
    const nouvelleDate = this.formGroupRenuvler.value.dateFinARenouvler;

    if (!nouvelleDate) {
      this.showModalWithMessage('Erreur', 'Veuillez sélectionner une date.', 'error');
      return;
    }

    // Récupérer l'ID de l'utilisateur connecté (le demandeur)
    this.loginService.getUser().subscribe(user => {
      if (!user || !user.id) {
        this.showModalWithMessage('Erreur', 'Utilisateur non authentifié.', 'error');
        return;
      }

      const demande = {
        licenceId: this.licenceID,
        nouvelleDateFin: nouvelleDate,
        demandeurId: user.id // ← ID du responsable qui fait la demande
      };

      // Appel au service pour envoyer la demande
      this.licenceService.envoyerDemandeRenouvellement(demande).subscribe({
        next: () => {
          this.showRenouvlerForm = false;
          this.showModalWithMessage(
            'Demande envoyée',
            'Votre demande de renouvellement a été transmise au gestionnaire.',
            'success'
          );
          // Optionnel : rafraîchir la liste des licences
          this.getLicencesByDepartement(this.departmentId);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.showRenouvlerForm = false;
          this.showModalWithMessage(
            'Erreur',
            err.error?.message || 'Impossible d’envoyer la demande.',
            'error'
          );
        }
      });
    });
  }


  // Activer/désactiver le mode renouvellement
  toggleModeRenouvellement() {
    this.modeRenouvellement = !this.modeRenouvellement;
    if (!this.modeRenouvellement) {
      // Réinitialiser la sélection et le formulaire
      this.licences.forEach(lic => {
        if (lic.licenceId != null) {
        this.licencesSelectionnees[lic.licenceId] = false;
        }
      });
      this.formGroupRenouvellement.reset();
    }
  }

  // Inverser la sélection d'une licence
  toggleSelection(licenceId: number | undefined) {
  if (licenceId == null) return; // ← Sécurité
  this.licencesSelectionnees[licenceId] = !this.licencesSelectionnees[licenceId];
}

  // Obtenir les licences sélectionnées
  getSelectionnees(): Licence[] {
  return this.licences.filter(lic => 
    lic.licenceId != null && this.licencesSelectionnees[lic.licenceId]
  );
}

  // Soumettre les demandes groupées
  onSubmitRenouvellementGroupe() {
    const dateFin = this.formGroupRenouvellement.value.dateFinCommune;

    if (!dateFin) {
      this.showModalWithMessage('Erreur', 'Veuillez choisir une date de fin.', 'error');
      return;
    }

    const selectionnees = this.getSelectionnees();
    if (selectionnees.length === 0) {
      this.showModalWithMessage('Erreur', 'Veuillez sélectionner au moins une licence.', 'error');
      return;
    }



    this.loginService.getUser().subscribe({
      next: (user) => {
        if (!user || !user.id) {

          this.showModalWithMessage('Erreur', 'Utilisateur non authentifié.', 'error');
          return;
        }

        let successCount = 0;
        let errorCount = 0;
        const total = selectionnees.length;

        selectionnees.forEach(lic => {
          const demande = {
            licenceId: lic.licenceId,
            nouvelleDateFin: dateFin,
            demandeurId: user.id
          };

          this.licenceService.envoyerDemandeRenouvellement(demande).subscribe({
            next: () => {
              successCount++;
              this.verifierFinEnvoi(successCount, errorCount, total);
            },
            error: () => {
              errorCount++;
              this.verifierFinEnvoi(successCount, errorCount, total);
            }
          });
        });
      },
      error: () => {

        this.showModalWithMessage('Erreur', 'Impossible de récupérer vos informations.', 'error');
      }
    });
  }

  // Vérifier si toutes les demandes sont traitées
  private verifierFinEnvoi(success: number, erreurs: number, total: number) {
    if (success + erreurs === total) {
      if (erreurs === 0) {
        this.showModalWithMessage(
          'Succès',
          `${total} demande(s) envoyée(s) au gestionnaire.`,
          'success'
        );
        // Rafraîchir les licences pour mettre à jour les dates/statuts si besoin
        this.getLicencesByDepartement(this.departmentId);
      } else {
        this.showModalWithMessage(
          'Partiellement échoué',
          `${success} réussie(s), ${erreurs} échec(s).`,
          'error'
        );
      }
      // Réinitialiser le mode
      this.toggleModeRenouvellement();
    }
  }


}


