import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResponsableService } from '../../../services/respo/responsable.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartementService } from '../../../services/departement/departement.service';

@Component({
  selector: 'app-responsables',
  templateUrl: './responsables.component.html',
  styleUrls: ['./responsables.component.css'],
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    CommonModule
  ],
  standalone: true
})
export class ResponsablesComponent implements OnInit {
  responsables: any[] = [];
  showAddForm = false;
  isEditing = false;
  responsableForm!: FormGroup;
  isCenterNotificationVisible = false;
  centerNotificationContent = '';
  centerNotificationStatus: 'success' | 'error' = 'success';
  showConfirmDelete = false;
  responsableToDelete: any = null;
  departementsDisponibles: any[] = [];
  showPassword: boolean = false;
  selectedResponsable: any = null;
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

  toggleActionMenu(responsable: any, event: MouseEvent): void {
    event.stopPropagation(); // Bloque le clic en dehors
    if (this.showActionMenu && this.selectedResponsable?.id === responsable.id) {
      this.closeActionMenu();
      return;
    }
    // Ouvre le menu
    this.selectedResponsable = responsable;
    const button = event.currentTarget as HTMLElement;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    this.actionMenuTop = rect.bottom + window.scrollY;
    this.actionMenuRight = window.innerWidth - rect.right;

    this.showActionMenu = true;
  }

  closeActionMenu(): void {
    this.showActionMenu = false;
    this.selectedResponsable = null;
  }




  constructor(
    private responsableService: ResponsableService,
    private fb: FormBuilder,
    private departementService: DepartementService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadResponsables();
    this.loadDepartements();
  }
  loadDepartements(): void {
    this.departementService.getAllDepartements().subscribe({
      next: (data) => {
        this.departementsDisponibles = data;
        console.log("hhhhhhhhhhhhhhh" + data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des départements :', err);
      }
    });
  }



  initForm(): void {
    this.responsableForm = this.fb.group({
      id: [null],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: [''],
      departementName: ['', Validators.required],
      role: ['Responsable']
    });
  }
  confirmDeleteResponsable(responsable: any): void {
    this.responsableToDelete = responsable;
    this.showConfirmDelete = true;
  }


  editResponsable(responsable: any): void {
    this.isEditing = true;
    this.showAddForm = true;
    this.responsableForm.patchValue({
      id: responsable.id,
      nom: responsable.nom,
      prenom: responsable.prenom,
      username: responsable.username,
      password: '', // Vide pour ne pas écraser l’ancien mot de passe
      departementName: responsable.departement || responsable.departementName,
      role: 'Responsable'
    });

  }
  updateResponsable(responsable: any): void {
    console.log("Responsable à modifier :", this.responsableForm.value);
    if (!responsable.id) {
      this.displayCenterNotification("Impossible de mettre à jour : ID manquant.", 'error');
      return;
    }

    this.responsableService.updateResponsable(responsable.id, responsable).subscribe({
      next: () => {
        this.displayCenterNotification("Responsable mis à jour avec succès.", 'success');
        this.loadResponsables();
        this.cancelForm();
      },
      error: (error) => {
        const errorMsg = error.error?.message || error.message || 'Erreur lors de la mise à jour';
        this.displayCenterNotification(errorMsg, 'error');
      }
    });
  }

  deleteResponsable(): void {
    if (!this.responsableToDelete?.id) return;

    this.responsableService.deleteResponsable(this.responsableToDelete.id).subscribe({
      next: () => {
        this.displayCenterNotification("Responsable supprimé avec succès.", "success");
        this.loadResponsables();
      },
      error: () => {
        this.displayCenterNotification("Erreur lors de la suppression du responsable.", "error");
      },
      complete: () => {
        this.cancelDelete(); // ferme la modale
      }
    });
  }

  cancelDelete(): void {
    this.responsableToDelete = null;
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



  addResponsable(responsable: any): void {
    this.responsableService.addResponsable(responsable).subscribe({
      next: (response: any) => {
        const message = typeof response === 'string' ? response : response.message;
        this.displayCenterNotification(message || 'Responsable ajouté avec succès', 'success');
        this.loadResponsables();
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






















  loadResponsables(): void {
    this.responsableService.getAllResponsables().subscribe({
      next: (data: any) => {
        this.responsables = data;
      },
      error: (error) => {
        console.error('Error loading responsables:', error);
      }
    });
  }

  openAddForm(): void {
    this.isEditing = false;
    this.responsableForm.reset({
      role: 'Responsable'
    });
    this.showAddForm = true;
  }



  cancelForm(): void {
    this.showAddForm = false;
    this.responsableForm.reset({
      role: 'Responsable'
    });
  }



















  onSubmit(): void {
    if (this.responsableForm.invalid) {
      return;
    }
    const responsableData = this.responsableForm.value;
    if (this.isEditing) {
      this.updateResponsable(responsableData);
    } else {
      this.addResponsable(responsableData);
    }
  }






}
