import { Component } from '@angular/core';        // Permet de déclarer un composant Angular
import { FormsModule } from '@angular/forms';     // Permet de gérer les formulaires (ex: ngModel pour checkbox, input)
import { CommonModule } from '@angular/common';   // Fournit les directives de base Angular (ngIf, ngFor, etc.)
import { HttpClient } from '@angular/common/http';// Service Angular pour faire des requêtes HTTP
import { Programme } from '../models/programmes'; // Modèle TypeScript décrivant la structure d’un "Programme"
import { ExtractedLink } from '../models/extractedLinks'; // Modèle pour représenter un fichier extrait
import { ExtractedLinks } from '../extracted-links/extracted-links'; // Un autre composant que tu réutilises ici
import { ExtractionResponse } from '../models/extraction-response';
import { FrontendFilterComponent } from '../frontend-filter/frontend-filter';

// Décorateur qui définit un composant Angular
@Component({
  selector: 'app-programmes',   // Balise HTML utilisée pour inclure ce composant (<app-programmes></app-programmes>)
  standalone: true,
  imports: [CommonModule, FormsModule, ExtractedLinks, FrontendFilterComponent], // Modules et composants utilisés dans ce composant
  templateUrl: './programmes.html',
  styleUrls: ['./programmes.scss']
})
export class Programmes {
  programmes: Programme[] = [
    { name: 'EI_RUN_KELONIA_BELT_POISSON', checked: false },
    { name: 'EI_RUN_GRAND-PORT_BELT_POISSON', checked: false },
    { name: 'UTOPIAN_RUN_COR-SEARAM_PA_POISSONS', checked: false },
    { name: 'AAMP_BENTHOS_FAU', checked: false },
    { name: 'EFFET-RESERVE_LAREUNION_BELT_POISSON', checked: false },
    { name: 'EFFET-RESERVE_LAREUNION_PA_POISSON', checked: false },
    { name: 'EI_RUN_BASSIN_GRANDE-ANSE_BELT_POISSON', checked: false },
    { name: 'EI_RUN_BEAUFONDS_PCS_POISSON', checked: false },
    { name: 'EI_RUN_BOUCAN_PCS_POISSON', checked: false },
    { name: 'EI_RUN_CILAOS_BELT_POISSON', checked: false },
    { name: 'EI_RUN_COR-SEARAM_BELT_POISSON', checked: false },
    { name: 'EI_RUN_COR-SEARAM_PA_POISSONS', checked: false },
    { name: 'EI_RUN_GRAND-PORT_BELT_INVERT', checked: false },
    { name: 'EI_RUN_NRL_PCS_POISSON', checked: false },
    { name: 'GCRMN_LAREUNION_BELT_INVERT', checked: false },
    { name: 'UTOPIAN_RUN_COR-SEARAM_HOLOTHURIES', checked: false },
    { name: 'RESEAUAMP_SXM_BELT_POISSONS', checked: false },
    { name: 'RESEAUAMP_SBH_QUADRAT_OURSINS', checked: false }
  ];

  //initialisation des variables :
  extractedFiles: ExtractedLink[] = [];
  message: string = '';
  isLoading: boolean = false; //  variable pour gérer l'état du bouton extraire

  allSelected = false; // Variable pour gérer la sélection de tous les programmes

  searchText: string = ''; // le texte tapé dans la barre

  showFilter = false;

  constructor(private http: HttpClient) {}

  get filteredProgrammes() {
  if (!this.searchText) {
    return this.programmes;
  }
  return this.programmes.filter(p =>
    p.name.toLowerCase().includes(this.searchText.toLowerCase())
  );
}

  toggleAll() {
  this.programmes.forEach(p => p.checked = this.allSelected);
}


  onFilterApplied(filterData: any) {
    console.log('Filtre appliqué depuis FrontendFilter:', filterData);
    this.showFilter = false;
    // TODO: envoyer filterData au backend
  }


  ExtraireDonnees() {
  // Récupère les noms des programmes cochés
  const selections = this.programmes
    .filter(p => p.checked)
    .map(p => p.name);

    //si aucuns programme selectionnes
    if (selections.length === 0) {
      this.message = 'Veuillez sélectionner au moins un programme.';
      return;
    }
    // Mise à jour de l’état pour indiquer que le traitement est en cours
    this.isLoading = true;
    this.message = `Processing... L’extraction peut prendre une minute ou deux`;


    // Envoie une requête POST au backend avec les programmes sélectionnés
    this.http.post<ExtractionResponse>('http://localhost:5000/extractions', { programmes: selections })
      .subscribe({
        next: (res) => {
          // Cas normal (status=ok)
          if (res.status === "ok") {
            this.message = `Backend a reçu : ${res.programmes_recus?.join(', ')}`;
            this.extractedFiles = res.fichiers_zip ?? [];
          }
          this.isLoading = false;
        },
        error: (err) => {
          // Ici Angular déclenche error car le backend renvoie 400 ou 404
          console.error(err);

          if (err.status === 400) {
            this.message = err.error?.message ?? 'Requête invalide (400)';
          } else if (err.status === 404) {
            this.message = err.error?.message ?? 'Aucun fichier trouvé (404)';
          } else {
            this.message = 'Erreur serveur inattendue';
          }
          // Réinitialisation des variables
          this.extractedFiles = [];
          this.isLoading = false;
        }
    });
  }
}

