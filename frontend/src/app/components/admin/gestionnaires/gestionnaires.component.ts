import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResponsableService } from '../../../services/respo/responsable.service';
import { DepartementService } from '../../../services/departement/departement.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-gestionnaires',
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgIf,
    NgForOf
  ],
  templateUrl: './gestionnaires.component.html',
  styleUrl: './gestionnaires.component.css',
  standalone: true
})
export class GestionnairesComponent implements OnInit {

  gestionnaires: any[] = [];
  showAddForm = false;
  isEditing = false;
  gestionnaireForm!: FormGroup;
  isCenterNotificationVisible = false;
  centerNotificationContent = '';
  centerNotificationStatus: 'success' | 'error' = 'success';
  showConfirmDelete = false;
  gestionnaireToDelete: any = null;
  showPassword: boolean = false;
  selectedGestionnaire: any = null;
  showActionMenu = false;
  actionMenuTop = 0;
  actionMenuRight = 0;

  ngAfterViewInit(): void {
    document.addEventListener('click', (event: Event) => {
      if (!this.showActionMenu) return;
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.fa-ellipsis-v')) {
        this.closeActionMenu();
      }
    });
  }

  toggleActionMenu(gestionnaire: any, event: MouseEvent): void {
  event.stopPropagation(); // Bloque le clic en dehors

  if (this.showActionMenu && this.selectedGestionnaire?.id === gestionnaire.id) {
    this.closeActionMenu();
    return;
  }

  // Ouvre le menu
  this.selectedGestionnaire = gestionnaire;
  const button = event.currentTarget as HTMLElement;
  if (!button) return;

  const rect = button.getBoundingClientRect();
  this.actionMenuTop = rect.bottom + window.scrollY;
  this.actionMenuRight = window.innerWidth - rect.right;

  this.showActionMenu = true;
}


  closeActionMenu(): void {
    this.showActionMenu = false;
    this.selectedGestionnaire = null;
  }




  constructor(
    private responsableService: ResponsableService,
    private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadGestionnaires();
  }

  initForm(): void {
    this.gestionnaireForm = this.fb.group({
      id: [null],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: [''],
      role: ['Gestionnaire']
    });
  }
  confirmDeleteGestionnaire(gestionnaire: any): void {
    this.gestionnaireToDelete = gestionnaire;
    this.showConfirmDelete = true;
  }


  editGestionnaire(gestionnaire: any): void {
    this.isEditing = true;
    this.showAddForm = true;
    this.gestionnaireForm.patchValue({
      id: gestionnaire.id,
      nom: gestionnaire.nom,
      prenom: gestionnaire.prenom,
      username: gestionnaire.username,
      password: '', // Vide pour ne pas écraser l’ancien mot de passe
      role: 'Gestionnaire'
    });

  }
  updateGestionnaire(gestionnaire: any): void {
    console.log("Gestionnaire à modifier :", this.gestionnaireForm.value);
    if (!gestionnaire.id) {
      this.displayCenterNotification("Impossible de mettre à jour : ID manquant.", 'error');
      return;
    }

    this.responsableService.updateResponsable(gestionnaire.id, gestionnaire).subscribe({
      next: () => {
        this.displayCenterNotification("Gestionnaire mis à jour avec succès.", 'success');
        this.loadGestionnaires();
        this.cancelForm();
      },
      error: (error) => {
        const errorMsg = error.error?.message || error.message || 'Erreur lors de la mise à jour';
        this.displayCenterNotification(errorMsg, 'error');
      }
    });
  }

  deleteGestionnaire(): void {
    if (!this.gestionnaireToDelete?.id) return;

    this.responsableService.deleteResponsable(this.gestionnaireToDelete.id).subscribe({
      next: () => {
        this.displayCenterNotification("Gestionnaire supprimé avec succès.", "success");
        this.loadGestionnaires();
      },
      error: () => {
        this.displayCenterNotification("Erreur lors de la suppression du gestionnaire.", "error");
      },
      complete: () => {
        this.cancelDelete(); // ferme la modale
      }
    });
  }

  cancelDelete(): void {
    this.gestionnaireToDelete = null;
    this.showConfirmDelete = false;
  }


  displayCenterNotification(message: string, status: 'success' | 'error') {
    this.centerNotificationContent = message;
    this.centerNotificationStatus = status;
    this.isCenterNotificationVisible = true;

    setTimeout(() => {
      this.isCenterNotificationVisible = false;
    }, 30000);
  }


  addGestionnaire(gestionnaire: any): void {
    this.responsableService.addResponsable(gestionnaire).subscribe({
      next: (response: any) => {
        const message = typeof response === 'string' ? response : response.message;
        this.displayCenterNotification(message || 'Gestionnaire ajouté avec succès', 'success');
        this.loadGestionnaires();
        this.cancelForm();
      },
      error: (error) => {
        const errorMsg = error.error?.message ||
          (typeof error.error === 'string' ? error.error : error.message) ||
          'Erreur lors de l\'ajout';
        this.displayCenterNotification(errorMsg, 'error');
      }
    });
  }


  loadGestionnaires(): void {
    this.responsableService.getAllGestionnaires().subscribe({
      next: (data: any) => {
        this.gestionnaires = data;
      },
      error: (error) => {
        console.error('Error loading gestionnaires:', error);
      }
    });
  }

  openAddForm(): void {
    this.isEditing = false;
    this.gestionnaireForm.reset({
      role: 'Gestionnaire'
    });
    this.showAddForm = true;
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.gestionnaireForm.reset({
      role: 'Gestionnaire'
    });
  }


  onSubmit(): void {
    if (this.gestionnaireForm.invalid) {
      return;
    }
    const gestionnaireData = this.gestionnaireForm.value;
    if (this.isEditing) {
      this.updateGestionnaire(gestionnaireData)
    } else {
      this.addGestionnaire(gestionnaireData)
    }
  }




}
