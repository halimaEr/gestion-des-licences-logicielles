import { Component } from '@angular/core';
import {LayoutComponent} from '../../layout/layout.component';
import {Router, RouterOutlet,RouterLink} from '@angular/router';

@Component({
  selector: 'app-dashboard-gestionnaire',
  imports: [
    LayoutComponent,
    RouterOutlet,
    RouterLink
],
  templateUrl: './dashboard-gestionnaire.component.html',
  styleUrl: './dashboard-gestionnaire.component.css',
  standalone:true
})
export class DashboardGestionnaireComponent {

  constructor(private router:Router) {
  }

  goToDemandes(): void {
    this.router.navigate(['/dash-responsable/demandes']);
  }
  goToAddDemande():void{
    this.router.navigate(['/dash-responsable/add-demande'])
  }
  goToEtatLicences():void{
    this.router.navigate(['/dash-responsable/etat-licence'])
  }

}
