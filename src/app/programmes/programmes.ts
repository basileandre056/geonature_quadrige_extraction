import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { Programme } from '../models/programmes';
import { ExtractedLink } from '../models/extractedLinks';
import { ExtractedLinks } from '../extracted-links/extracted-links';

import { ExtractionResponse } from '../models/extraction-response';
import { ProgramExtractionResponse } from '../models/program-extraction-response';
import { FrontendFilterComponent } from '../frontend-filter/frontend-filter';
import { ProgramExtractionFilterComponent } from '../program-extraction-filter/program-extraction-filter';

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

  extractedFiles: ExtractedLink[] = [];         // ZIP des données
  extractedProgramFiles: ExtractedLink[] = [];  // CSV des programmes

  message: string = '';
  isLoading: boolean = false;
  allSelected = false;
  searchText: string = '';
  showFilter = false;
  showExtractionFilter = false;

  data_filter: any = null;     // filtre pour extraction de données
  programs_filter: any = null; // filtre pour extraction de programmes

  constructor(private http: HttpClient) {}

  private mapToExtractedLinks(raw: any): ExtractedLink[] {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item: any) => {
        const file_name =
          item?.file_name ??
          item?.programme ??
          item?.name ??
          'fichier';
        const url = item?.url ?? '';
        return { file_name, url } as ExtractedLink;
      })
      .filter((f: ExtractedLink) => !!f.url);
  }

  get filteredProgrammes() {
    if (!this.searchText) return this.programmes;
    return this.programmes.filter(p =>
      p.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  toggleAll() {
    this.programmes.forEach(p => (p.checked = this.allSelected));
  }

  onFilterApplied(filterData: any) {
    console.log('[FRONTEND] Filtre appliqué (données):', filterData);
    this.showFilter = false;
    this.data_filter = filterData;
  }

  onExtractionFilterApplied(filterData: any) {
    console.log('[FRONTEND] Filtre appliqué (programmes):', filterData);
    this.showExtractionFilter = false;
    this.programs_filter = filterData;
  }

  Extraire_programmes() {
    console.log('➡️ clic sur Extraire_programmes()');
    if (!this.programs_filter) {
      this.message = 'Veuillez définir un filtre d’extraction de programmes.';
      return;
    }

    this.isLoading = true;
    this.message = 'Extraction des programmes en cours...';

    this.http
  .post<ProgramExtractionResponse>('http://localhost:5000/program-extraction', {
    filter: this.programs_filter
  })
  .subscribe({
    next: (res) => {
      console.log('[FRONTEND] ⬅️ Réponse reçue (programmes):', res);
      if (res?.status === 'ok') {
        this.extractedProgramFiles = this.mapToExtractedLinks(res?.fichiers_csv);
        this.message = `CSV programmes disponible (${this.extractedProgramFiles.length} fichier(s))`;
      } else {
        this.message = res?.message ?? 'Réponse inattendue du serveur';
      }
      this.isLoading = false;
    },
    error: (err) => {
      console.error('[FRONTEND] ❌ Erreur HTTP (programmes):', err);
      this.message = err?.error?.message ?? 'Erreur serveur inattendue';
      this.isLoading = false;
    }
  });
  }

  Extraire_donnees() {
    console.log('➡️ clic sur Extraire_donnees()');
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
    this.message = 'Extraction des données en cours...';

    this.http
      .post<ExtractionResponse>('http://localhost:5000/extractions', {
        programmes: selections,
        filter: this.data_filter
      })
      .subscribe({
        next: (res) => {
          console.log('[FRONTEND] ⬅️ Réponse reçue (données):', res);
          if (res?.status === 'ok') {
            this.extractedFiles = this.mapToExtractedLinks(res?.fichiers_zip);
            this.message = `Fichiers extraits (${this.extractedFiles.length})`;
          } else {
            this.message = res?.message ?? 'Réponse inattendue du serveur';
            this.extractedFiles = [];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('[FRONTEND] ❌ Erreur HTTP (données):', err);
          this.message = err?.error?.message ?? 'Erreur serveur inattendue';
          this.extractedFiles = [];
          this.isLoading = false;
        }
      });
  }
}
