import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { isLoggedInGuard } from './guards/is-logged-in.guard';
import { ResponsablesComponent } from './components/admin/responsables/responsables.component';
import { GestionnairesComponent } from './components/admin/gestionnaires/gestionnaires.component';
import { DashboardResponsableComponent } from './components/responsable/dashboard-responsable/dashboard-responsable.component';
import { DemandeComponent } from './components/responsable/demande/demande.component';
import { AddDemandeComponent } from './components/responsable/add-demande/add-demande.component';
import { EtatLicenceComponent } from './components/responsable/etat-licence/etat-licence.component';

// hdhhdhhdhd
import { DepartementsComponent } from './components/admin/departements/departements.component';
import { EmployeComponent } from './components/admin/employe/employe.component';
import { LogicielComponent } from './components/gestionnaire/logiciel/logiciel.component';
import { LicenceComponent } from './components/gestionnaire/licence/licence.component';
import { StatisticGestionaireComponent } from './components/gestionnaire/statistic-gestionaire/statistic-gestionaire.component';
import { DemandeComponentt } from './components/gestionnaire/demande/demande.component';
import { AffectationDetailsComponent } from './components/gestionnaire/affectation-details/affectation-details.component';
import { DashboardGestionnaireComponent } from './components/gestionnaire/dashboard-gestionnaire/dashboard-gestionnaire.component';
import { LicenceFiltersComponent } from './components/gestionnaire/licence-filters/licence-filters.component';
import { StatisticAdminComponent } from './components/admin/statistic-admin/statistic-admin.component';
import { RenouvellementComponent } from './components/gestionnaire/renouvellement/renouvellement.component';


export const routes: Routes = [
  {
    path: '', component: LoginComponent
    
  },
  {
    path: 'dashboard', component: DashboardComponent,
    canActivate: [isLoggedInGuard],
    data: { roles: ['Admin'] }, 
    children: [
      { path: "", component: StatisticAdminComponent },
      { path: 'responsables', component: ResponsablesComponent },
      { path: 'gestionnaires', component: GestionnairesComponent },
      { path: "departments", component: DepartementsComponent },
      { path: "employes", component: EmployeComponent },
    ]
  },

  {
    path: 'dash-responsable', component: DashboardResponsableComponent,
    canActivate: [isLoggedInGuard],
    data: { roles: ['Responsable'] }, 
    children: [
      { path: "", component: EtatLicenceComponent },
      { path: 'demandes', component: DemandeComponent },
      { path: 'add-demande', component: AddDemandeComponent },
      { path: 'etat-licence', component: EtatLicenceComponent },
      
    ]
  },
  {
    path: 'dash-gestionnaire', component: DashboardGestionnaireComponent,
    canActivate: [isLoggedInGuard],
    data: { roles: ['Gestionnaire'] }, 
    children: [
      { path: "", component: StatisticGestionaireComponent },
      { path: "logiciel", component: LogicielComponent },
      { path: "licences", component: LicenceFiltersComponent },
      { path: "demandes", component: DemandeComponentt },
      { path: 'logiciel/:id/licences', component: LicenceComponent },
      { path: 'affectation-details', component: AffectationDetailsComponent },
      { path: 'renouvellement', component: RenouvellementComponent }
    ]
  },
  // {
  //   path: 'responsables', component: ResponsablesComponent
  // },
  // {
  //   path: 'add-demande', component: AddDemandeComponent
  // },
  // { path: 'etat-licence', component: EtatLicenceComponent },
  // { path: 'renouvellement', component: RenouvellementComponent }





];
