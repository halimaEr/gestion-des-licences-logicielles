import { Component } from '@angular/core';
import {LayoutComponent} from '../../layout/layout.component';
import {Router, RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-dashboard-responsable',
  imports: [
    LayoutComponent,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './dashboard-responsable.component.html',
  styleUrl: './dashboard-responsable.component.css',
  standalone:true
})
export class DashboardResponsableComponent {

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
