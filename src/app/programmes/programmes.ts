import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Programme } from '../models/programmes';
import { ExtractedLink } from '../models/extractedLinks';
import { ExtractedLinks } from '../extracted-links/extracted-links';
import { ExtractionResponse } from '../models/extraction-response';
import { FrontendFilterComponent } from '../frontend-filter/frontend-filter';
import { ProgramExtractionFilterComponent } from '../program-extraction-filter/program-extraction-filter';
import { ProgramResponse } from '../models/programs_response';

@Component({
  selector: 'app-programmes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ExtractedLinks,
    FrontendFilterComponent,
    ProgramExtractionFilterComponent
  ],
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
  showExtractionFilter = false;

  // ✅ deux filtres séparés
  data_filter: any = null;     // filtre pour l’extraction des données
  programs_filter: any = null; // filtre pour la mise à jour des programmes

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

  // Quand on applique le filtre d’extraction de données
  onFilterApplied(filterData: any) {
    console.log('Filtre appliqué depuis FrontendFilter:', filterData);
    this.showFilter = false;
    this.data_filter = filterData;
  }

  // Quand on applique le filtre d’extraction de programmes
  onExtractionFilterApplied(filterData: any) {
    console.log('Filtre extraction appliqué:', filterData);
    this.showExtractionFilter = false;
    this.programs_filter = filterData;
  }

  //  Mise à jour des programmes depuis le backend
 Extraire_programmes() {
  if (!this.programs_filter) {
    this.message = 'Veuillez définir un filtre d’extraction de programmes.';
    console.warn("[FRONTEND] ❌ Aucun filtre défini pour l’extraction des programmes");
    return;
  }

  this.isLoading = true;
  this.message = `Mise à jour des programmes en cours...`;
  console.log("[FRONTEND] ➡️ Envoi de la requête à /program-extraction avec :", this.programs_filter);

  this.http
    .post<ProgramResponse>('http://localhost:5000/program-extraction', {
      filter: this.programs_filter
    })
    .subscribe({
      next: (res) => {
        console.log("[FRONTEND] ⬅️ Réponse reçue :", res);
        if (res.status === 'ok' && res.programmes_recus) {
          this.programmes = res.programmes_recus.map(p => ({
            name: p.code,
            lieu_mnemonique: p.lieu_mnemonique,
            checked: false
          }));
          this.message = `Liste des programmes mise à jour (${this.programmes.length})`;
          console.log("[FRONTEND] ✅ Programmes mis à jour :", this.programmes);
        } else {
          this.message = res.message ?? 'Réponse inattendue du serveur';
          console.warn("[FRONTEND] ⚠️ Réponse inattendue :", res);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error("[FRONTEND] ❌ Erreur HTTP :", err);
        this.message = err.error?.message ?? 'Erreur serveur inattendue';
        this.isLoading = false;
      }
    });
}
  // ⚡️ Extraction des données depuis le backend
  ExtraireDonnees() {
    const selections = this.programmes.filter(p => p.checked).map(p => p.name);

    if (selections.length === 0) {
      this.message = 'Veuillez sélectionner au moins un programme.';
      return;
    }

    if (!this.data_filter) {
      this.message = 'Veuillez définir un filtre avant de lancer une extraction.';
      return;
    }

    this.isLoading = true;
    this.message = `Processing... L’extraction peut prendre une minute ou deux`;

    this.http
      .post<ExtractionResponse>('http://localhost:5000/extractions', {
        programmes: selections,
        filter: this.data_filter
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
