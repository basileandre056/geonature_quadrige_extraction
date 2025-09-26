import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Programme } from '../models/programmes';
import { ExtractedLink } from '../models/extractedLinks';
import { ExtractedLinks } from '../extracted-links/extracted-links';
import { ExtractionResponse } from '../models/extraction-response';
import { FrontendFilterComponent } from '../frontend-filter/frontend-filter';

@Component({
  selector: 'app-programmes',
  standalone: true,
  imports: [CommonModule, FormsModule, ExtractedLinks, FrontendFilterComponent],
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

  extractedFiles: ExtractedLink[] = [];
  message: string = '';
  isLoading: boolean = false;
  allSelected = false;
  searchText: string = '';
  showFilter = false;

  //  Nouveau : stockage du filtre appliqué
  activeFilter: any = null;

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
    this.programmes.forEach(p => (p.checked = this.allSelected));
  }

  // Quand on applique le filtre
  onFilterApplied(filterData: any) {
    console.log('Filtre appliqué depuis FrontendFilter:', filterData);
    this.showFilter = false;
    this.activeFilter = filterData; //  sauvegarde du filtre
  }

  ExtraireDonnees() {
    const selections = this.programmes.filter(p => p.checked).map(p => p.name);

    if (selections.length === 0) {
      this.message = 'Veuillez sélectionner au moins un programme.';
      return;
    }

    if (!this.activeFilter) {
      this.message = 'Veuillez définir un filtre avant de lancer une extraction.';
      return;
    }

    this.isLoading = true;
    this.message = `Processing... L’extraction peut prendre une minute ou deux`;

    //  Envoi programmes + filtre au backend
    this.http
      .post<ExtractionResponse>('http://localhost:5000/extractions', {
        programmes: selections,
        filter: this.activeFilter
      })
      .subscribe({
        next: (res) => {
          if (res.status === 'ok') {
            this.message = `Backend a reçu : ${res.programmes_recus?.join(', ')}`;
            this.extractedFiles = res.fichiers_zip ?? [];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);

          if (err.status === 400) {
            this.message = err.error?.message ?? 'Requête invalide (400)';
          } else if (err.status === 404) {
            this.message = err.error?.message ?? 'Aucun fichier trouvé (404)';
          } else {
            this.message = 'Erreur serveur inattendue';
          }

          this.extractedFiles = [];
          this.isLoading = false;
        }
      });
  }
}
