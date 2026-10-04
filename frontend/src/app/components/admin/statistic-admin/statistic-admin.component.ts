// src/app/components/admin/statistic-admin/statistic-admin.component.ts
import { Component, ViewChild, ElementRef, OnDestroy, AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { StatistiqueService } from '../../../services/statistique/statistique.service';
import { FormsModule } from '@angular/forms';
import { DepartementService } from '../../../services/departement/departement.service';
import { DatePipe, NgIf } from '@angular/common';
import * as XLSX from 'xlsx';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-statistic-admin',
  standalone: true,
  imports: [FormsModule,DatePipe,NgIf],
  templateUrl: './statistic-admin.component.html',
  styleUrls: ['./statistic-admin.component.css'],
})
export class StatisticAdminComponent implements AfterViewInit, OnDestroy {

  // Filtres
selectedYearDepartement: number = new Date().getFullYear();
selectedYearLogiciel: number = new Date().getFullYear();  selectedDepartement: number | null = null;

  // Données KPI
  totalDepartements = 0;
  totalEmployes = 0;
  totalResponsables = 0;

  // Données graphiques
  departementStat: { departementNom: string; coutTotal: number; coutConsomme?: number }[] = [];
  logicielStat: { nomLogiciel: string; coutTotal: number; coutConsomme: number }[] = [];

  // Départements (pour le dropdown)
  departements: { id: number; nom: string }[] = [];

  // Graphiques
  barChartCout: Chart | null = null;
  barChartLogiciel: Chart | null = null;

// Pour le modal de détails
showDetailsModal = false;
selectedLogicielNom: string | null = null;
employesDetails: any[] = [];


  // Références aux canvas
  @ViewChild('totalValue', { static: false }) totalValue!: ElementRef;
  @ViewChild('inProgressValue', { static: false }) inProgressValue!: ElementRef;
  @ViewChild('acceptedValue', { static: false }) acceptedValue!: ElementRef;
  @ViewChild('barChartCoutCanvas', { static: false }) barChartCoutCanvas!: ElementRef;
  @ViewChild('barChartLogicielCanvas', { static: false }) barChartLogicielCanvas!: ElementRef;

  constructor(
    private statisticService: StatistiqueService,
    private departementService: DepartementService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.loadDepartements().then(() => {
      this.onFilterChange(); // Charge les données et les graphiques
      this.getStatisticStats(); // KPI
    });
  }

  ngOnDestroy(): void {
    if (this.barChartCout) this.barChartCout.destroy();
    if (this.barChartLogiciel) this.barChartLogiciel.destroy();
  }

  // Charger la liste des départements
  loadDepartements(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.departementService.getAllDepartements().subscribe({
        next: (deps) => {
          this.departements = deps;
          resolve();
        },
        error: (err) => {
          console.error('Erreur lors du chargement des départements:', err);
          reject(err);
        }
      });
    });
  }

  // Gérer les changements de filtres
  onFilterChange(): void {
  const year = this.selectedYearDepartement;
  if (year < 2000 || year > 2100) {
    alert("Veuillez entrer une année valide entre 2000 et 2100.");
    this.selectedYearDepartement = new Date().getFullYear();
    return;
  }

  setTimeout(() => {
    this.getStatistic();
    this.getStatisticParLogiciel();
  }, 0);
}

  // Récupérer les coûts par département
  getStatistic(): void {
    this.statisticService.getStatistiqueParAnnee(this.selectedYearDepartement).subscribe({
      next: (response) => {
        this.departementStat = response || [];
        this.createBarChartCout();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des statistiques par département:', err);
      }
    });
  }

  // Récupérer les coûts par logiciel (filtré par année et département)
  getStatisticParLogiciel(): void {
    this.statisticService.getCoutsParLogicielParAnneeEtDepartement(this.selectedYearLogiciel, this.selectedDepartement).subscribe({
      next: (response) => {
        this.logicielStat = response || [];
        this.createBarChartLogiciel();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des coûts par logiciel:', err);
      }
    });
  }

  // Récupérer les KPI (total départements, employés...)
  getStatisticStats(): void {
    this.statisticService.getStatisticOfAdmin().subscribe({
      next: (response) => {
        this.totalDepartements = response.totalDepartements?.totalDepartements || 0;
        this.totalEmployes = response.totalEmployes?.totalEmployes || 0;

        this.animateNumber(this.totalValue, this.totalDepartements);
        this.animateNumber(this.inProgressValue, this.totalEmployes);
        this.animateNumber(this.acceptedValue, 0);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des KPI:', err);
      }
    });
  }

  // Graphique 1 : Coût par département (barres verticales)
  createBarChartCout(): void {
  setTimeout(() => {
    if (!this.barChartCoutCanvas?.nativeElement) {
      console.warn('Canvas non disponible pour le graphique de coût par département');
      return;
    }

    const canvas = this.barChartCoutCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Context 2D non disponible');
      return;
    }

    if (this.barChartCout) {
      this.barChartCout.destroy();
    }

    const labels = this.departementStat.map(d => d.departementNom);
    const totalData = this.departementStat.map(d => d.coutTotal);
    const consommeData = this.departementStat.map(d => d.coutConsomme || 0);

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Coût total (Dh)',
            data: totalData,
            backgroundColor: '#911924',
            borderColor: '#911924',
            borderWidth: 1
          },
          {
            label: 'Coût consommé (Dh)',
            data: consommeData,
            backgroundColor: 'rgba(135, 139, 146, 0.8)',
            borderColor: 'rgba(135, 139, 146, 0.8)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                return ctx.dataset.label + ': ' + ctx.parsed.y + ' Dh';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Coût (Dh)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Département'
            }
          }
        }
      }
    };

    this.barChartCout = new Chart(ctx, config);
  }, 0); // ← Clé : attendre le prochain cycle de rendu
}

  // Graphique 2 : Coût par logiciel (barres horizontales)
  createBarChartLogiciel(): void {
  setTimeout(() => {
    if (!this.barChartLogicielCanvas?.nativeElement) {
      console.warn('Canvas non disponible pour le graphique de coût par logiciel');
      return;
    }

    const canvas = this.barChartLogicielCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Context 2D non disponible');
      return;
    }

    if (this.barChartLogiciel) {
      this.barChartLogiciel.destroy();
    }

    const labels = this.logicielStat.map(l => l.nomLogiciel);
    const totalData = this.logicielStat.map(l => l.coutTotal);
    const consommeData = this.logicielStat.map(l => l.coutConsomme);

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Coût total (Dh)',
            data: totalData,
            backgroundColor: '#911924',
            borderColor: '#911924',
            borderWidth: 1
          },
          {
            label: 'Coût consommé (Dh)',
            data: consommeData,
            backgroundColor: 'rgba(135, 139, 146, 0.8)',
            borderColor: 'rgba(135, 139, 146, 0.8)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                return ctx.dataset.label + ': ' + ctx.parsed.y + ' Dh';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Coût (Dh)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Nom du logiciel'
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const nomLogiciel = this.logicielStat[index].nomLogiciel;
            this.openDetailsModal(nomLogiciel);
          }
        }
      }
    };

    this.barChartLogiciel = new Chart(ctx, config);
  }, 0); // ← Clé : attendre le prochain cycle de rendu
}

  // Animation des chiffres KPI
  animateNumber(element: ElementRef | undefined, target: number): void {
    if (!element || !element.nativeElement) return;

    let current = 0;
    const stepTime = 30;
    const steps = Math.max(20, Math.floor(target / 10)); // Ajuste selon la valeur
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.nativeElement.textContent = Math.round(current);
    }, stepTime);
  }

  // Pour afficher le nom du département dans le titre
  getDepartementName(id: number | null): string {
    const dept = this.departements.find(d => d.id === id);
    return dept ? dept.nom : 'Inconnu';
  }

  openDetailsModal(nomLogiciel: string): void {
  this.selectedLogicielNom = nomLogiciel;
  this.employesDetails = []; // Réinitialiser
  this.showDetailsModal = true;

  // Appeler le backend
  this.statisticService.getDetailsLogiciel(nomLogiciel, this.selectedYearLogiciel, this.selectedDepartement)
    .subscribe({
      next: (data) => {
        this.employesDetails = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails:', err);
        // Optionnel : afficher un message
        this.employesDetails = [];
      }
    });
}

closeDetailsModal(): void {
  this.showDetailsModal = false;
  this.selectedLogicielNom = null;
  this.employesDetails = [];
}


// Dans StatisticAdminComponent
async exportAdminToExcel(): Promise<void> {
  try {
    // Créer un nouveau classeur Excel
    const workbook = XLSX.utils.book_new();
    
    // 1. Feuille pour les statistiques par département
    const deptData = [
      ['Statistiques par Département'],
      ['Année', this.selectedYearDepartement],
      [],
      ['Département', 'Coût Total (Dh)', 'Coût Consommé (Dh)']
    ];
    
    this.departementStat.forEach(item => {
      deptData.push([item.departementNom, item.coutTotal, item.coutConsomme || 0]);
    });
    
    const worksheetDept = XLSX.utils.aoa_to_sheet(deptData);
    XLSX.utils.book_append_sheet(workbook, worksheetDept, 'Stats par Département');
    
    // 2. Feuille pour les statistiques par logiciel
    const logicielData = [
      ['Statistiques par Logiciel'],
      ['Année', this.selectedYearLogiciel],
      ['Département', this.selectedDepartement ? this.getDepartementName(this.selectedDepartement) : 'Tous'],
      [],
      ['Logiciel', 'Coût Total (Dh)', 'Coût Consommé (Dh)', 'Pourcentage Consommé']
    ];
    
    this.logicielStat.forEach(item => {
      const pourcentageConsomme = item.coutTotal > 0 
        ? ((item.coutConsomme / item.coutTotal) * 100).toFixed(2) + '%'
        : '0%';
      
      logicielData.push([
        item.nomLogiciel, 
        item.coutTotal, 
        item.coutConsomme,
        pourcentageConsomme
      ]);
    });
    
    // Ajouter les totaux
    const totalCoutTotal = this.logicielStat.reduce((sum, item) => sum + item.coutTotal, 0);
    const totalCoutConsomme = this.logicielStat.reduce((sum, item) => sum + item.coutConsomme, 0);
    const totalPourcentage = totalCoutTotal > 0 
      ? ((totalCoutConsomme / totalCoutTotal) * 100).toFixed(2) + '%'
      : '0%';
    
    logicielData.push([]);
    logicielData.push(['TOTAL', totalCoutTotal, totalCoutConsomme, totalPourcentage]);
    
    const worksheetLogiciel = XLSX.utils.aoa_to_sheet(logicielData);
    XLSX.utils.book_append_sheet(workbook, worksheetLogiciel, 'Stats par Logiciel');
    
    // 3. Feuille pour les détails des employés par logiciel
    const employesData = [
      ['Détails des Employés par Logiciel'],
      ['Année', this.selectedYearLogiciel],
      ['Département', this.selectedDepartement ? this.getDepartementName(this.selectedDepartement) : 'Tous'],
      [],
      ['Logiciel', 'Coût Total (Dh)', 'Coût Consommé (Dh)', 'Nom Employé', 'Date Affectation', 'Date Demande']
    ];
    
    // Récupérer les détails de tous les logiciels
    const allDetails = await this.getDetailsForAllLogiciels();
    
    allDetails.forEach(detail => {
      employesData.push([
        detail.logiciel,
        detail.coutTotal,
        detail.coutConsomme,
        detail.nomEmploye,
        detail.dateAffectation ? new Date(detail.dateAffectation).toLocaleDateString('fr-FR') : '',
        detail.dateDemande ? new Date(detail.dateDemande).toLocaleDateString('fr-FR') : ''
      ]);
    });
    
    const worksheetEmployes = XLSX.utils.aoa_to_sheet(employesData);
    XLSX.utils.book_append_sheet(workbook, worksheetEmployes, 'Détails Employés');
    
    // 4. Feuille de synthèse par logiciel (regroupement)
    const summaryData = [
      ['Synthèse par Logiciel'],
      ['Année', this.selectedYearLogiciel],
      ['Département', this.selectedDepartement ? this.getDepartementName(this.selectedDepartement) : 'Tous'],
      [],
      ['Logiciel', 'Coût Total (Dh)', 'Coût Consommé (Dh)', 'Nombre d\'Employés', 'Coût Moyen par Employé (Dh)']
    ];
    
    // Grouper les détails par logiciel
    const logicielMap = new Map();
    
    allDetails.forEach(detail => {
      if (!logicielMap.has(detail.logiciel)) {
        logicielMap.set(detail.logiciel, {
          logiciel: detail.logiciel,
          coutTotal: detail.coutTotal,
          coutConsomme: detail.coutConsomme,
          employeCount: 0,
          employes: []
        });
      }
      
      const logicielInfo = logicielMap.get(detail.logiciel);
      if (detail.nomEmploye !== 'Aucun employé') {
        logicielInfo.employeCount++;
        logicielInfo.employes.push(detail.nomEmploye);
      }
    });
    
    // Ajouter les données groupées à la feuille
    let totalEmployes = 0;
    logicielMap.forEach(logicielInfo => {
      const coutMoyen = logicielInfo.employeCount > 0 
        ? (logicielInfo.coutConsomme / logicielInfo.employeCount).toFixed(2)
        : '0';
      
      summaryData.push([
        logicielInfo.logiciel,
        logicielInfo.coutTotal,
        logicielInfo.coutConsomme,
        logicielInfo.employeCount,
        coutMoyen
      ]);
      
      totalEmployes += logicielInfo.employeCount;
    });
    
    // Ajouter les totaux
    const totalCout = this.logicielStat.reduce((sum, item) => sum + item.coutTotal, 0);
    const totalConsomme = this.logicielStat.reduce((sum, item) => sum + item.coutConsomme, 0);
    const coutMoyenTotal = totalEmployes > 0 ? (totalConsomme / totalEmployes).toFixed(2) : '0';
    
    summaryData.push([]);
    summaryData.push(['TOTAL', totalCout, totalConsomme, totalEmployes, coutMoyenTotal]);
    
    const worksheetSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, worksheetSummary, 'Synthèse Logiciels');
    
    // Générer le fichier Excel
    const fileName = `Statistiques_Admin_${new Date().getFullYear()}_${new Date().getMonth() + 1}_${new Date().getDate()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
  } catch (error) {
    console.error('Erreur lors de l\'exportation Excel:', error);
    alert('Une erreur est survenue lors de l\'exportation. Veuillez réessayer.');
  }
}



// Dans StatisticAdminComponent
// Dans StatisticAdminComponent
async getDetailsForAllLogiciels(): Promise<any[]> {
  const allDetails: any[] = [];
  
  // Parcourir tous les logiciels pour récupérer leurs détails
  for (const logiciel of this.logicielStat) {
    try {
      // Utilisation de firstValueFrom au lieu de toPromise()
      const details = await firstValueFrom(
        this.statisticService.getDetailsLogiciel(
          logiciel.nomLogiciel, 
          this.selectedYearLogiciel, 
          this.selectedDepartement
        )
      );
      
      // Ajouter les détails avec le nom du logiciel
      if (details && details.length > 0) {
        details.forEach((detail: any) => {
          allDetails.push({
            logiciel: logiciel.nomLogiciel,
            coutTotal: logiciel.coutTotal,
            coutConsomme: logiciel.coutConsomme,
            ...detail
          });
        });
      } else {
        // Ajouter une entrée même si aucun employé n'est trouvé
        allDetails.push({
          logiciel: logiciel.nomLogiciel,
          coutTotal: logiciel.coutTotal,
          coutConsomme: logiciel.coutConsomme,
          nomEmploye: 'Aucun employé',
          dateAffectation: '',
          dateDemande: ''
        });
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des détails pour ${logiciel.nomLogiciel}:`, error);
      
      // Ajouter une entrée d'erreur
      allDetails.push({
        logiciel: logiciel.nomLogiciel,
        coutTotal: logiciel.coutTotal,
        coutConsomme: logiciel.coutConsomme,
        nomEmploye: 'Erreur de chargement',
        dateAffectation: '',
        dateDemande: ''
      });
    }
  }
  
  return allDetails;
}



}