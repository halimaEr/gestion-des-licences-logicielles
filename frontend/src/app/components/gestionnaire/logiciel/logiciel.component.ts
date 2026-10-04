import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LogicielService } from '../../../services/logiciel/logiciel.service'; 
import { Logiciel } from '../../../models/Logiciel';
import { DashboardGestionnaireComponent } from '../dashboard-gestionnaire/dashboard-gestionnaire.component';

@Component({
  selector: 'app-logiciel',
  imports: [
    ReactiveFormsModule, FormsModule,

  ],
  templateUrl: './logiciel.component.html',
  styleUrl: './logiciel.component.css'
})
export class LogicielComponent {

  logiciels: any;
  logicielID: any;
  idDemand: any;
  showAddForm: boolean = false;
  showUpdateForm: boolean = false;
  showList: boolean = true;
  showDeleteModal: boolean = false;
  showSearchBar = false;
  dropdownOpen: number | null = null;
  filteredLogiciels: any[] = [];
  searchTerm = '';
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

  // Méthode pour fermer la modale
  closeModal() {
    this.showModal = false;
  }

  formGroup = new FormGroup({
    nom: new FormControl('', [Validators.required]),
    version: new FormControl('', [Validators.required, Validators.minLength(2)]),
    categorie: new FormControl('', [Validators.required, Validators.minLength(2)]),
  })

  constructor(private logicielService: LogicielService, private router: Router) { }
  ngOnInit(): void {

    const navigation = this.router.getCurrentNavigation();
    const routerState = navigation?.extras?.state;
    if (routerState && routerState['idDemande']) {
      this.idDemand = routerState['idDemande'];
      console.log('ID récupéré via router.getCurrentNavigation:', this.idDemand);
    } else {
      const historyState = window.history.state;
      if (historyState && historyState['idDemande']) {
        this.idDemand = historyState['idDemande'];
        console.log('ID récupéré via window.history.state:', this.idDemand);
      } else {
        console.warn('Aucun ID trouvé dans le state.');
      }
    }
    console.log("Final idDemand =", this.idDemand);
    this.getAllLogiciels();

  }


  getAllLogiciels() {
    this.logicielService.getAllLogiciel().subscribe({
      next: rep => {
        this.logiciels = [...rep].reverse();
        this.filteredLogiciels = [...this.logiciels];
      },
      error: err => { console.log(err.message) }
    });
  }
  setShowList() {
    this.showList = true;
    this.showAddForm = false;
    this.showUpdateForm = false;
    this.getAllLogiciels();
  }


  onSubmit() {
    const logiciel: Logiciel = {
      nom: this.formGroup.value.nom || '',
      version: this.formGroup.value.version || '',
      categorie: this.formGroup.value.categorie || '',
    };
    const payload = {
      logiciel: logiciel,
      idDemande: this.idDemand
    };

    if(this.idDemand == null){
      this.logicielService.addLogicielSansIdDemande(logiciel).subscribe({
        next: (rep) => {
          console.log('Succès:', rep);
          this.showModalWithMessage(
            'Ok!',
            rep.message,
            'success'
          );
          this.setShowList(); // revient à la liste
          this.getAllLogiciels(); // recharge la liste
          this.formGroup.reset();
        },
        error: (err) => {
          console.log('Erreur:', err);
          this.showModalWithMessage(
            'Erreur',
            err.error?.message,
            'error'
          );
          this.setShowList();
          this.getAllLogiciels();
        }
      });

    }else{

    this.logicielService.addLogiciel(payload).subscribe({
      next: (rep) => {
        console.log('Succès:', rep);
        this.showModalWithMessage(
          'Ok!',
          rep.message,
          'success'
        );
        this.setShowList(); // revient à la liste
        this.getAllLogiciels(); // recharge la liste
        this.formGroup.reset();
      },
      error: (err) => {
        console.log('Erreur:', err);
        this.showModalWithMessage(
          'Erreur',
          err.error?.message,
          'error'
        );
        this.setShowList();
        this.getAllLogiciels();
      }
    });
  }
}

  updateLogiciel() {
    const l: Logiciel = {
      nom: this.formGroup.value.nom || '',
      version: this.formGroup.value.version || '',
      categorie: this.formGroup.value.categorie || '',
    }
    this.logicielService.updateLogiciel(this.logicielID, l).subscribe({
      next: (rep) => {
        console.log(rep),
          this.showModalWithMessage(
            'Ok!',
            rep.message,
            'success'
          );
        this.showList = true
        this.showUpdateForm = false
        this.getAllLogiciels();
      },
      error: (err) => {
        console.log(err)
        this.showModalWithMessage(
          'Erreur',
          err.error.message,
          'error'
        );
        this.showList = true
        this.showUpdateForm = false
        this.getAllLogiciels();
      }
    })
  }


  setLogicielIdForDelete(id: any) {
    this.logicielID = id;
    this.showDeleteModal = true;

  }
  deleteLogiciel() {
    this.logicielService.deleteLogiciel(this.logicielID).subscribe({
      next: (rep: any) => {
        this.showDeleteModal = false;
        if (rep.success) {
          this.logiciels = this.logiciels.filter((l: Logiciel) => l.id !== this.logicielID);
          this.filteredLogiciels = [...this.logiciels]
          this.showModalWithMessage(
            'Ok!',
            rep.message,
            'success'
          );
        } else {
          console.log("erreur");
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

      }
    });
  }




  setShowAddForm() {
    this.showUpdateForm = false;
    this.showList = true
    this.showAddForm = true;
  }

  setShowUpdateForm(id: any) {
    this.logicielID = id;
    this.showList = true;
    this.showAddForm = false;
    this.showUpdateForm = true;
    this.setFormInfoForUpdate()

  }
  setFormInfoForUpdate() {
    this.logiciels = this.logicielService.getLogicielById(this.logicielID).subscribe({
      next: (rep) => {
        this.logiciels = rep;
        console.log(rep);
        this.formGroup.patchValue({
          nom: rep.nom,
          version: rep.version,
          categorie: rep.categorie,
        })
        this.getAllLogiciels()
      },
      error: (err) => { console.log("erreur") }
    });
  }



  // cette partie est pour les action 



  toggleDropdown(id: number) {
    this.dropdownOpen = this.dropdownOpen === id ? null : id;
  }

  gererLicence(id: number,) {
    this.router.navigate(['/dash-gestionnaire/logiciel', id, 'licences'], {
      state: { idDemande: this.idDemand } 
    })

  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('td.relative')) {
      this.dropdownOpen = null;
    }
  }
  filterLogiciels() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      // Si le champ est vide, on affiche tous les logiciels
      this.filteredLogiciels = [...this.logiciels];
    } else {
      // Sinon, on filtre
      this.filteredLogiciels = this.logiciels.filter((logiciel: any) =>
        logiciel.nom.toLowerCase().includes(term) ||
        logiciel.version.toLowerCase().includes(term) ||
        logiciel.categorie.toLowerCase().includes(term)
      );
    }
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
  //  """""""""""""""""""""""""""" new parte of creation logiciel """"""""
}




