import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LogicielService } from '../../../services/logiciel/logiciel.service';
import { LicenceService } from '../../../services/licence/licence.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DemandeService } from '../../../services/demande/demande.service';
import { CommonModule } from '@angular/common';
import { EmployeService } from '../../../services/employe/employe.service';

@Component({
  selector: 'app-licence',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './licence.component.html',
  styleUrl: './licence.component.css'
})
export class LicenceComponent implements OnInit {
  licences: any[] = [];
  logicielID: number | null = null;
  idDemande: number | null = null;
  showAddForm: boolean = false;
  showUpdateForm: boolean = false;
  showList: boolean = true;
  showDeleteModal: boolean = false;
  showRenouvlerForm: boolean = false;
  dropdownOpen: number | null = null;
  filteredLicences: any[] = [];
  searchTerm = '';
  showSearchBar: boolean = false;
  employes: any[] = []; // ← Nouvelle variable pour stocker les employés
  employesConcernes: any[] = []; // ← Employés de la demande (pour le mode paquet)
  

  formGroup = new FormGroup({
    cleLicence: new FormControl('', [Validators.required, Validators.minLength(2)]),
    prix: new FormControl('', [Validators.required]),
    dateDebut: new FormControl('', [Validators.required]),
    dateFin: new FormControl('', [Validators.required]),
    creationMode: new FormControl<'simple' | 'paquet'>('simple'), // ← Correction ici
    nbCopies: new FormControl(2, [Validators.min(2)]),
    employeId: new FormControl('') // ← Nouveau contrôle
  });

  formGroupRenuvler = new FormGroup({
    dateFinARenouvler: new FormControl('', [Validators.required]),
  });

  nbLicencesDemandees: number = 0;
  licenceID: number | null = null;

  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'success' | 'error' = 'success';

  constructor(
    private logicielService: LogicielService,
    private licenceService: LicenceService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private demandeService: DemandeService,
    private employeService: EmployeService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.logicielID = Number(params.get('id'));

      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras?.state?.['idDemande']) {
        this.idDemande = navigation.extras.state['idDemande'];
      } else if (history.state?.idDemande) {
        this.idDemande = history.state.idDemande;
      } else {
        const savedId = sessionStorage.getItem('currentDemandeId');
        if (savedId) {
          this.idDemande = Number(savedId);
        }
      }

      if (this.idDemande) {
        this.getDemandeInfo();
        this.getLicencesByDemandeId();
        this.getEmployesConcernes();
      } else {
        console.error('Aucun ID de demande trouvé');
        this.showModalWithMessage('Erreur', 'Impossible d\'identifier la demande.', 'error');
      }
    });

    // Surveiller les changements de mode
    this.formGroup.get('creationMode')?.valueChanges.subscribe(mode => {
      this.onModeChange();
    });
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


  private getEmployesConcernes(): void {
    if (!this.idDemande) return;

    this.demandeService.getEmployesByDemandeId(this.idDemande).subscribe({
      next: (employes: any[]) => {
        this.employesConcernes = employes;
        console.log('Employés concernés:', this.employesConcernes);
      },
      error: (err) => {
        console.error('Erreur chargement employés:', err);
      }
    });
  }

  // Nouvelle méthode pour charger tous les employés (pour la sélection manuelle)
  private chargerTousLesEmployes(): void {
    if (!this.idDemande) return;
    this.demandeService.getEmployesByDemandeId(this.idDemande).subscribe({
      next: (employes: any[]) => {
        this.employes = employes;
        console.log('Tous les employés:', this.employes);
      },
      error: (err) => {
        console.error('Erreur chargement employés:', err);
      }
    });
  }



  private getDemandeInfo(): void {
    if (!this.idDemande) return;

    this.demandeService.getDemandeById(this.idDemande).subscribe({
      next: (demande: any) => {
        this.nbLicencesDemandees = demande.nbLicences || 0;
        console.log(`Licences demandées : ${this.nbLicencesDemandees}`);
      },
      error: (err) => {
        console.error('Erreur chargement demande:', err);
        this.showModalWithMessage('Erreur', 'Impossible de charger la demande.', 'error');
      }
    });
  }

  getLicencesByDemandeId(): void {
    if (!this.idDemande) {
      console.error('Aucun ID de demande spécifié');
      return;
    }

    this.licenceService.getLicencesByDemandeId(this.idDemande).subscribe({
      next: (response) => {
        if (response.success) {
          this.licences = response.data;
          this.filteredLicences = [...this.licences];
          console.log('Licences chargées:', this.licences);
        } else {
          console.error('Erreur:', response.message);
        }
      },
      error: (err) => {
        console.error('Erreur HTTP:', err);
      }
    });
  }

  reloadLicences(): void {
    this.getLicencesByDemandeId();
  }

  get licencesCrees(): number {
    return this.licences.length;
  }

  get peutAjouter(): boolean {
    return this.licencesCrees < this.nbLicencesDemandees;
  }

  get nbLicencesRestantesPourPaquet(): number {
    return Math.max(0, this.nbLicencesDemandees - this.licencesCrees);
  }

  get creationMode(): 'simple' | 'paquet' {
    const mode = this.formGroup.get('creationMode')?.value;
    return mode === 'simple' || mode === 'paquet' ? mode : 'simple';
  }
  get nbCopies(): number {
    return this.formGroup.get('nbCopies')?.value || 2;
  }

  onModeChange(): void {
    if (this.creationMode === 'paquet') {
      const maxCopies = this.nbLicencesRestantesPourPaquet;
      this.formGroup.get('nbCopies')?.setValue(Math.min(maxCopies, 10));
    }
  }

  onSubmit() {
    if (!this.idDemande) {
      this.showModalWithMessage('Erreur', 'Aucune demande associée trouvée.', 'error');
      return;
    }

    const baseLicence: any = {
      cleLicence: this.formGroup.value.cleLicence?.trim() || '',
      prix: this.formGroup.value.prix,
      dateDebut: this.formGroup.value.dateDebut,
      dateFin: this.formGroup.value.dateFin,
      demandeId: this.idDemande,
    };

    if (this.creationMode === 'simple') {
      // Mode simple - avec employé sélectionné
      const employeId = this.formGroup.value.employeId;

      if (!employeId) {
        this.showModalWithMessage('Erreur', 'Veuillez sélectionner un employé.', 'error');
        return;
      }

      // Ajouter la licence puis l'affecter
      this.licenceService.addLicence(this.logicielID!, baseLicence).subscribe({
        next: (rep) => {
          // Après création de la licence, faire l'affectation
          const nouvelleLicenceId = rep.data.licenceId; // Supposons que la réponse contient l'ID
          if (!nouvelleLicenceId) {
            this.showModalWithMessage('Erreur', 'ID de licence manquant dans la réponse.', 'error');
            return;
          }
          this.affecterLicence(nouvelleLicenceId, employeId);
        },
        error: (err) => {
          this.showModalWithMessage('Erreur', err.error?.message || 'Erreur lors de l\'ajout', 'error');
        }
      });

    } else if (this.creationMode === 'paquet') {
      // Mode paquet - affectation automatique aux employés de la demande
      const licencesToCreate: any[] = [];
      const nbCopies = this.nbCopies;
      const cleCommune = baseLicence.cleLicence?.trim() || `PKG-${Date.now()}`;

      // Vérifier qu'on a assez d'employés
      if (this.employesConcernes.length < nbCopies) {
        this.showModalWithMessage('Erreur',
          `Vous avez demandé ${nbCopies} licences, mais seulement ${this.employesConcernes.length} employés sont associés à cette demande.`,
          'error');
        return;
      }

      // Créer les licences
      for (let i = 0; i < nbCopies; i++) {
        licencesToCreate.push({
          cleLicence: cleCommune,
          prix: baseLicence.prix,
          dateDebut: baseLicence.dateDebut,
          dateFin: baseLicence.dateFin,
          demandeId: baseLicence.demandeId
        });
      }

      // Créer les licences d'abord
      this.licenceService.addMultipleLicences(this.logicielID!, licencesToCreate).subscribe({
        next: (rep) => {
          // ✅ Récupérer les IDs des licences créées
          // → Ton backend doit retourner la liste des licences créées avec leurs IDs
          const licencesCrees = rep?.licences || [];

          if (licencesCrees.length !== nbCopies) {
            this.showModalWithMessage('Attention',
              'Certaines licences n\'ont pas pu être affectées car les IDs sont manquants.',
              'error');
          } else {
            // ✅ Affecter chaque licence à un employé
            let affectationsEnCours = 0;
            let erreursAffectation = 0;

            licencesCrees.forEach((licence: any, index: number) => {
              const employeId = this.employesConcernes[index]?.id;
              if (employeId && licence.id) {
                this.demandeService.affecter(employeId, licence.id).subscribe({
                  next: () => {
                    affectationsEnCours++;
                    // Si c'est la dernière affectation, afficher le succès
                    if (affectationsEnCours + erreursAffectation === licencesCrees.length) {
                      this.finaliserCreationPaquet(nbCopies);
                    }
                  },
                  error: (err) => {
                    console.error(`Erreur affectation licence ${licence.id} à employé ${employeId}:`, err);
                    erreursAffectation++;
                    if (affectationsEnCours + erreursAffectation === licencesCrees.length) {
                      this.finaliserCreationPaquet(nbCopies, erreursAffectation);
                    }
                  }
                });
              } else {
                erreursAffectation++;
                if (affectationsEnCours + erreursAffectation === licencesCrees.length) {
                  this.finaliserCreationPaquet(nbCopies, erreursAffectation);
                }
              }
            });
          }
        },
        error: (err) => {
          this.showModalWithMessage('Erreur', err.error?.message || 'Erreur lors de la création du paquet', 'error');
        }
      });
    }}

  private finaliserCreationPaquet(nbCopies: number, erreursAffectation: number = 0): void {
  if (erreursAffectation > 0) {
    this.showModalWithMessage('Attention',
      `${nbCopies} licences créées, mais ${erreursAffectation} n'ont pas pu être affectées.`,
      'error');
  } else {
    this.showModalWithMessage('Succès!',
      `${nbCopies} licences créées et affectées automatiquement aux employés.`,
      'success');
  }
  this.resetFormAndClose();
  this.reloadLicences();
}

  private affecterLicence(licenceId: number, employeId: any): void {
    this.demandeService.affecter(employeId, licenceId).subscribe({
      next: (rep) => {
        this.showModalWithMessage('Succès!', 'Licence créée et affectée avec succès', 'success');
        this.resetFormAndClose();
        this.reloadLicences();
      },
      error: (err) => {
        this.showModalWithMessage('Attention',
          'Licence créée mais erreur lors de l\'affectation: ' + err.message,
          'error');
        this.resetFormAndClose();
        this.reloadLicences();
      }
    });
  }

  testBackendDirectly() {
    if (!this.idDemande) return;

    const testLicences = [
      {
        cleLicence: "TEST-1-" + Date.now(),
        prix: 100,
        dateDebut: "2025-01-01",
        dateFin: "2026-01-01",
        demandeId: this.idDemande
      },
      {
        cleLicence: "TEST-2-" + Date.now(),
        prix: 100,
        dateDebut: "2025-01-01",
        dateFin: "2026-01-01",
        demandeId: this.idDemande
      }
    ];

    console.log('Test direct avec:', testLicences);

    this.licenceService.addMultipleLicences(this.logicielID!, testLicences).subscribe({
      next: (response) => {
        console.log('TEST RÉUSSI - Réponse:', response);
        this.showModalWithMessage('Test', 'Backend fonctionne correctement', 'success');
        this.reloadLicences();
      },
      error: (error) => {
        console.error('TEST ÉCHOUÉ - Erreur:', error);
        this.showModalWithMessage('Test', 'Problème backend: ' + error.message, 'error');
      }
    });
  }

  resetFormAndClose(): void {
    this.showAddForm = false;
    this.formGroup.reset({
      creationMode: 'simple',
      nbCopies: 2,
      employeId: ''
    });
    this.showSearchBar = false;
  }

  setFormInfoForUpdate(id: number): void {
    this.licenceID = id;
    this.licenceService.getLicenceById(this.logicielID!, id).subscribe({
      next: (rep) => {
        const licence = rep.message;
        this.formGroup.patchValue({
          cleLicence: licence.cleLicence,
          prix: licence.prix,
          dateDebut: licence.dateDebut,
          dateFin: licence.dateFin,
        });
        this.showUpdateForm = true;
        this.showAddForm = false;
      },
      error: (err) => {
        this.showModalWithMessage('Erreur', 'Impossible de charger la licence', 'error');
      }
    });
  }

  updateLicence(): void {
    if (!this.licenceID || !this.logicielID) return;

    const updatedLicence: any = {
      cleLicence: this.formGroup.value.cleLicence?.trim() || '',
      prix: this.formGroup.value.prix,
      dateDebut: this.formGroup.value.dateDebut,
      dateFin: this.formGroup.value.dateFin,
      demandeId: this.idDemande,
    };

    this.licenceService.updateLicence(this.logicielID, this.licenceID, updatedLicence).subscribe({
      next: (rep) => {
        this.showModalWithMessage('Succès!', rep.message, 'success');
        this.showUpdateForm = false;
        this.reloadLicences();
      },
      error: (err) => {
        this.showModalWithMessage('Erreur', err.message, 'error');
      }
    });
  }

  setLicenceIdForDelete(id: number): void {
    this.licenceID = id;
    this.showDeleteModal = true;
  }

  deleteLicence(): void {
    if (!this.licenceID || !this.logicielID) return;

    this.licenceService.deleteLicence(this.logicielID, this.licenceID).subscribe({
      next: (rep) => {
        this.showDeleteModal = false;
        this.showModalWithMessage('Succès!', rep.message, 'success');
        this.reloadLicences();
      },
      error: (err) => {
        this.showModalWithMessage('Erreur', err.message, 'error');
      }
    });
  }

  setShowRenouvlerLicence(id: number): void {
    this.licenceID = id;
    this.showRenouvlerForm = true;

    this.licenceService.getLicenceById(this.logicielID!, id).subscribe({
      next: (response) => {
        const ancienneDateFin = response.message.dateFin;
        const dateObj = new Date(ancienneDateFin);
        dateObj.setFullYear(dateObj.getFullYear() + 1);
        const nouvelleDateFin = dateObj.toISOString().split('T')[0];

        this.formGroupRenuvler.patchValue({
          dateFinARenouvler: nouvelleDateFin
        });
      },
      error: (err) => {
        this.showModalWithMessage('Erreur', 'Impossible de charger la licence', 'error');
      }
    });
  }

  onSubmitRenouvellement(): void {
    if (!this.licenceID) return;

    const nouvelleDate = this.formGroupRenuvler.value.dateFinARenouvler;
    this.licenceService.ronouvler(this.licenceID, nouvelleDate).subscribe({
      next: (rep) => {
        this.showModalWithMessage('Succès!', rep.message, 'success');
        this.annulerRenouvellement();
        this.reloadLicences();
      },
      error: (err) => {
        this.showModalWithMessage('Erreur', err.message, 'error');
      }
    });
  }

  annulerRenouvellement(): void {
    this.showRenouvlerForm = false;
    this.formGroupRenuvler.reset();
  }

  setShowList(): void {
    this.showList = true;
    this.showAddForm = false;
    this.showUpdateForm = false;
    this.showRenouvlerForm = false;
    this.showDeleteModal = false;
    this.dropdownOpen = null;
    this.searchTerm = '';
    this.reloadLicences();
  }

  setShowAddForm(): void {
    this.showList = true;
    this.showAddForm = true;
    this.showUpdateForm = false;
    this.formGroup.reset({
      creationMode: 'simple',
      nbCopies: 2,
      employeId: ''
    });
    this.chargerTousLesEmployes();
    this.showSearchBar = false;
  }

  toggleDropdown(id: number): void {
    this.dropdownOpen = this.dropdownOpen === id ? null : id;
  }

  filterLicences(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredLicences = [...this.licences];
    } else {
      this.filteredLicences = this.licences.filter((l: any) =>
        l.cleLicence.toLowerCase().includes(term) ||
        l.prix.toString().includes(term)
      );
    }
  }

  showModalWithMessage(title: string, message: string, type: 'success' | 'error'): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  get nbCopiesValue(): number {
    const value = this.formGroup.get('nbCopies')?.value;
    return value ? Number(value) : 0;
  }

  get exceedsMaxCopies(): boolean {
    return this.nbCopiesValue > this.nbLicencesRestantesPourPaquet;
  }

}