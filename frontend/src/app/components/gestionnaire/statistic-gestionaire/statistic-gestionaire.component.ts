import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import * as XLSX from 'xlsx';
import { color } from 'chart.js/helpers';
import { LicenceService } from '../../../services/licence/licence.service';
import { DepartementService } from '../../../services/departement/departement.service';
import { StatistiqueService } from '../../../services/statistique/statistique.service';
import { StatisticAdminComponent } from '../../admin/statistic-admin/statistic-admin.component';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-statistic-gestionaire',
  standalone: true,
  imports: [StatisticAdminComponent],
  templateUrl: './statistic-gestionaire.component.html',
  styleUrls: ['./statistic-gestionaire.component.css']
})
export class StatisticGestionaireComponent implements OnInit, OnDestroy {

  // Variables statistiques
  totalDemandes = 0;
  enCours = 0;
  accepte = 0;
  refusee = 0;
  logiciels = 0;
  licences = 0;
  top5Logiciels: { nom: string; nombreLicences: number }[] = [];



  // Variables pour les statistiques
  totalLicences = 0;
  licencesActives = 0;
  licencesExpirees = 0;
  licencesEnAttente = 0;
  licencesNonAttribuees = 0;
  licencesExpirantBientot = 0; 
  pourcentageExpirantBientot = 0; 
  pourcentageNonAttribuees = 0;

  // Pourcentages pour l'état des licences
  pourcentageValides = 0;
  pourcentageExpire30Jours = 0;
  pourcentageExpirees = 0;

  // Instances des graphiques
  pieChart: Chart | null = null;
  barChart: Chart | null = null;

  // Références aux éléments HTML
  @ViewChild('totalValue', { static: true }) totalValue!: ElementRef;
  @ViewChild('inProgressValue', { static: true }) inProgressValue!: ElementRef;
  @ViewChild('acceptedValue', { static: true }) acceptedValue!: ElementRef;
  @ViewChild('rejectedValue', { static: true }) rejectedValue!: ElementRef;
  @ViewChild('softwareValue', { static: true }) softwareValue!: ElementRef;
  @ViewChild('licenceValue', { static: true }) licenceValue!: ElementRef;

  @ViewChild('pieChartCanvas', { static: true }) pieChartCanvas!: ElementRef;
  @ViewChild('barChartCanvas', { static: true }) barChartCanvas!: ElementRef;

  constructor(private statisticService: StatistiqueService, private licenceServices: LicenceService, private departementsService: DepartementService) { }

  ngOnInit(): void {
    this.getStatistic();
    this.loadLicenceStats();

  }

  ngOnDestroy(): void {
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
  }

  getStatistic(): void {
    this.statisticService.getStatistic().subscribe({
      next: (response) => {
        console.log('Données reçues du backend:', response);

        //  Mettre à jour les statistiques avec les données du backend
        this.totalDemandes = response.demande.total;
        this.enCours = response.demande.enCours;
        this.accepte = response.demande.acceptee;
        this.refusee = response.demande.refusee;
        this.logiciels = response.licence.totalLogiciels;
        this.licences = response.licence.totalLicences;
        this.top5Logiciels = response.top5Logiciels

        //  Créer les graphiques uniquement après avoir reçu les données
        this.createPieChart();
        this.createBarChart();

        // Animer les chiffres
        this.animateNumber(this.totalValue, this.totalDemandes);
        this.animateNumber(this.inProgressValue, this.enCours);
        this.animateNumber(this.acceptedValue, this.accepte);
        this.animateNumber(this.rejectedValue, this.refusee);
        this.animateNumber(this.softwareValue, this.logiciels);
        this.animateNumber(this.licenceValue, this.licences);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des statistiques:', err);
        // Optionnel : afficher un message à l'utilisateur
      }
    });
  }

  createPieChart(): void {
    const canvas = this.pieChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Impossible d\'accéder au contexte 2D du canvas pieChart.');
      return;
    }

    // Détruire l'ancien graphique s'il existe
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const data = {
      labels: ['En cours', 'Acceptées', 'Refusées'],
      datasets: [
        {
          data: [this.enCours, this.accepte, this.refusee],
          backgroundColor: ['orange', 'green', 'red'],
          hoverOffset: 4
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return `${context.label}: ${context.raw}`;
            }
          }
        }
      }
    };

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: options
    });
  }

  createBarChart(): void {
    const canvas = this.barChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Impossible d\'accéder au contexte 2D du canvas barChart.');
      return;
    }

    // Détruire l'ancien graphique s'il existe
    if (this.barChart) {
      this.barChart.destroy();
    }

    const labels = this.top5Logiciels.map(item => item.nom);
    const data = this.top5Logiciels.map(item => item.nombreLicences);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Nombre de licences',
          data: data,
          backgroundColor: 'green',
          borderColor: 'red',
          borderWidth: 1
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x' as const, // 🔥 Barres horizontales
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return `Licences: ${context.raw}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Nombre de licences',
            color: 'black',
            padding: 20 //
          }
        },
        x: {
          title: {
            display: true,
            text: 'Logiciels',
            color: 'black',
            padding: 16
          }
        }
      }
    };

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: options
    });
  }

  animateNumber(element: ElementRef, target: number): void {
    let current = 0;
    const stepTime = 30;
    const increment = target > 20 ? Math.ceil(target / 20) : 1;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.nativeElement.textContent = current;
    }, stepTime);
  }

  exportToExcel(): void {
    const statsData = [
      { 'Statistique': 'Total Demandes', 'Valeur': this.totalDemandes },
      { 'Statistique': 'Demandes En cours', 'Valeur': this.enCours },
      { 'Statistique': 'Demandes Acceptées', 'Valeur': this.accepte },
      { 'Statistique': 'Demandes Refusées', 'Valeur': this.refusee },
      { 'Statistique': 'Nombre de Logiciels', 'Valeur': this.logiciels },
      { 'Statistique': 'Nombre de Licences', 'Valeur': this.licences }
    ];

    const topLogicielsData = this.top5Logiciels.map(item => ({
      'Logiciel': item.nom,
      'Nombre de Licences': item.nombreLicences
    }));

    const workbook = XLSX.utils.book_new();
    const worksheetStats = XLSX.utils.json_to_sheet(statsData);
    const worksheetTop = XLSX.utils.json_to_sheet(topLogicielsData);

    XLSX.utils.book_append_sheet(workbook, worksheetStats, 'Statistiques');
    XLSX.utils.book_append_sheet(workbook, worksheetTop, 'Top Logiciels');

    XLSX.writeFile(workbook, `Statistiques_${new Date().toLocaleDateString('fr-FR')}.xlsx`);
  }




  // hhhhhhhhhhh
  departementID: any;
  nbrLicence: any;
  departements: any

  // get tout les departement
  getAllDepartements() {
    this.departementsService.getAllDepartements().subscribe({
      next: rep => { this.departements = rep },
      error: err => { console.log(err.message) }
    });
  }

  getAllLicenceOfDeapartement() {

    this.licenceServices.getLicencesParDepartement(this.departementID).subscribe({
      next: rep => {
        console.log(rep)
        console.log(rep.length)
        this.nbrLicence = rep.length + 1

      },
      error: err => { console.log(err) },
    })
  }
  onDepartementChange(event: any): void {
    this.departementID = event.target.value;
    this.getAllLicenceOfDeapartement();
  }

  loadLicenceStats(): void {
    // Récupérer les licences actives
    this.licenceServices.getLicencesActives().subscribe({
      next: (licencesActives) => {
        this.licencesActives = licencesActives.length;
        this.updatePourcentages();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des licences actives:', err);
      }
    });

    // Récupérer les licences libres (non attribuées)
    this.licenceServices.getLicencesLibres().subscribe({
      next: (licencesLibres) => {
        this.licencesNonAttribuees = licencesLibres.length;
        this.updatePourcentages();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des licences libres:', err);
      }
    });

    // Récupérer les licences expirées
    this.licenceServices.getLicencesExpirees().subscribe({
      next: (licencesExpirees) => {
        this.licencesExpirees = licencesExpirees.length;
        this.updatePourcentages();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des licences expirées:', err);
      }
    });

    this.licenceServices.getLicencesExpirantBientot().subscribe({
      next: (licences) => {
        this.licencesExpirantBientot = licences.length;
        this.updatePourcentages(); // <-- Recalculer les pourcentages
      },
      error: (err) => {
        console.error('Erreur lors du chargement des licences expirant bientôt:', err);
      }
    });
  }

  // Méthode pour recalculer les pourcentages
  updatePourcentages(): void {
  const totalGeneral = this.licencesActives + this.licencesExpirees + this.licencesNonAttribuees;

  // Calcul des pourcentages généraux (basés sur totalGeneral)
  if (totalGeneral > 0) {
    this.pourcentageValides = Math.round((this.licencesActives / totalGeneral) * 100);
    this.pourcentageExpirees = Math.round((this.licencesExpirees / totalGeneral) * 100);
    this.pourcentageNonAttribuees = Math.round((this.licencesNonAttribuees / totalGeneral) * 100);
  } else {
    this.pourcentageValides = 0;
    this.pourcentageExpirees = 0;
    this.pourcentageNonAttribuees = 0;
  }

  // Pourcentage de "expirant bientôt" par rapport aux licences ACTIVES uniquement
  if (this.licencesActives > 0) {
    this.pourcentageExpirantBientot = Math.round((this.licencesExpirantBientot / this.licencesActives) * 100);
  } else {
    this.pourcentageExpirantBientot = 0;
  }
}







}

