import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {EmployeService} from '../../../services/employe/employe.service';
import {LoginService} from '../../../services/auth/login.service';
import {DemandeService} from '../../../services/demande/demande.service';
import {User} from '../../../models/user.model';
import {Logiciel} from '../../../models/logiciel.model';
import {LogicielService} from '../../../services/logiciel/logiciel.service';
import {Demande} from '../../../models/demande.model';

@Component({
  selector: 'app-add-demande',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './add-demande.component.html',
  styleUrl: './add-demande.component.css',
  standalone:true
})
export class AddDemandeComponent implements OnInit{

  demandeForm!: FormGroup;
  afficherModale: boolean = false;
  isCenterNotificationVisible = false;
  centerNotificationContent = '';
  centerNotificationStatus: 'success' | 'error' = 'success';
  employesDisponibles: any[] = [];
  selectedEmployees: any[] = [];
  departmentId?: number;
  showConfirmModal = false;
  pendingDemandeData: any = null;
  logiciels: any[]=[];
  isOtherSelected = false;
  newLogicielName: string = '';
  loading = false;
  selectedLogicielId: number | null = null; // DÉCLARATION AJOUTÉE ICI

  constructor( private loginService:LoginService,
               private fb:FormBuilder,
               private employeService:EmployeService,
               private demandeService:DemandeService,
               private logicielService:LogicielService) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadLogiciels()

    this.loginService.getUser().subscribe((user: User | null | undefined) => {
      if (!user || !user.departmentId) {
        console.warn('Utilisateur ou département non trouvé');
        return;
      }

      this.departmentId = user.departmentId;
      console.log("departement id "+this.departmentId)
      this.loadEmployes(this.departmentId);
    });
  }

  loadLogiciels() {
    this.logicielService.getAllLogiciel().subscribe({
      next: (data) => {
        this.logiciels = data;
      },
      error: (err) => {
        console.error('Erreur chargement logiciels', err);
      }
    });
  }

  initForm() {
    this.demandeForm = this.fb.group({
      logicielId: ['', Validators.required],
      nbLicences: [1, [Validators.required, Validators.min(1)]],
      fournisseur: [''],
      description: ['', Validators.required],
      employeIds: [[]],
      isNewLogiciel: [false]
    });

    this.demandeForm.get('nbLicences')?.valueChanges.subscribe(() => {
      this.selectedEmployees = [];
      this.updateFormEmployeIds();
    });
  }

  displayCenterNotification(message: string, status: 'success' | 'error') {
    this.centerNotificationContent = message;
    this.centerNotificationStatus = status;
    this.isCenterNotificationVisible = true;

    setTimeout(() => {
      this.isCenterNotificationVisible = false;
    }, 30000);
  }

  openConfirmModal(demandeData: any) {
    this.pendingDemandeData = demandeData;
    this.showConfirmModal = true;
  }

  loadEmployes(departementId: number) {
    this.employeService.getEmployesByDepartement(departementId).subscribe({
      next: (data) => {
        this.employesDisponibles = data;
      },
      error: (err) => {
        console.error('Erreur chargement employés', err);
      }
    });
  }

  isEmployeeCountValid() {
    return this.selectedEmployees.length === this.demandeForm.get('nbLicences')?.value;
  }

  get maxSelectable(): number {
    return this.demandeForm.get('nbLicences')?.value || 0;
  }

  isAlreadySelected(id: number): boolean {
    return this.selectedEmployees.some(e => e.id === id);
  }

  onSelectEmployee(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedId = +target.value;

    if (!selectedId || this.selectedEmployees.length >= this.maxSelectable) return;

    const selected = this.employesDisponibles.find(e => e.id === selectedId);
    if (selected && !this.isAlreadySelected(selectedId)) {
      this.selectedEmployees.push(selected);
      this.updateFormEmployeIds();
    }

    target.value = '';
  }

  removeEmployee(id: number): void {
    this.selectedEmployees = this.selectedEmployees.filter(e => e.id !== id);
    this.updateFormEmployeIds();
  }

  updateFormEmployeIds(): void {
    const ids = this.selectedEmployees.map(e => e.id);
    this.demandeForm.get('employeIds')?.setValue(ids);
  }

  fermerModale() {
    this.afficherModale = false;
  }

  onLogicielChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;

    if (selectedValue === 'autre') {
      this.isOtherSelected = true;
      this.selectedLogicielId = null;
      this.demandeForm.patchValue({
        logicielId: 'autre',
        fournisseur: ''
      });
    } else {
      this.isOtherSelected = false;
      this.selectedLogicielId = +selectedValue;
      const logiciel = this.logiciels.find(l => l.id === this.selectedLogicielId);
      if (logiciel) {
        this.demandeForm.patchValue({
          logicielId: selectedValue,
          fournisseur: logiciel.fournisseur || ''
        });
      }
    }
  }

  confirmSendDemande() {
    if (!this.pendingDemandeData) return;

    // Vérification si "Autre" est sélectionné mais aucun nom n'est saisi
    if (this.isOtherSelected && !this.newLogicielName.trim()) {
      this.displayCenterNotification('Veuillez saisir le nom du nouveau logiciel', 'error');
      return;
    }


    // Préparer les données à envoyer
    const demandeData: any = {
      logicielId: this.isOtherSelected ? null : this.selectedLogicielId,
      nomLogiciel :this.isOtherSelected ? null :  this.logiciels.filter(l => l.id == this.selectedLogicielId),
      nouveauNomLogiciel: this.isOtherSelected ? this.newLogicielName.trim() : undefined,
      fournisseur: this.pendingDemandeData.fournisseur,
      nbLicences: this.pendingDemandeData.nbLicences,
      description: this.pendingDemandeData.description,
      employeIds: this.selectedEmployees.map(emp => emp.id),
      isNewLogiciel: this.isOtherSelected,
      date: new Date().toISOString().split('T')[0],
      statut: 'En attente'
    };

    // Nettoyer les données null/undefined
    Object.keys(demandeData).forEach(key => {
      if (demandeData[key] === null || demandeData[key] === undefined) {
        delete demandeData[key];
      }
    });

    console.log('Données envoyées:', demandeData);
    this.loading = true;

    this.demandeService.addDemande(demandeData).subscribe({
      next: (response) => {
        this.loading = false;
        this.displayCenterNotification('Demande envoyée avec succès', 'success');
        this.resetForm();
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.message ||
          (typeof error.error === 'string' ? error.error : error.message) ||
          'Erreur lors de l\'ajout';
        this.displayCenterNotification(errorMsg, 'error');      }
    });

    this.showConfirmModal = false;
  }

  resetForm() {
    this.demandeForm.reset({
      logicielId: '',
      nbLicences: 1,
      fournisseur: '',
      description: '',
      employeIds: []
    });
    this.selectedEmployees = [];
    this.isOtherSelected = false;
    this.newLogicielName = '';
    this.selectedLogicielId = null;
    this.fermerModale();
  }
}
