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
  programmes: Programme[] = [];

  extractedDataFiles: ExtractedLink[] = [];     // ZIP extraits (données)
  extractedProgramFiles: ExtractedLink[] = [];  // CSV extraits (programmes)

  message: string = '';
  isLoading: boolean = false;
  allSelected = false;
  searchText: string = '';
  showDataFilter = false;
  showProgramFilter = false;

  dataFilter: any = null;      // filtre pour extraction de données
  programFilter: any = null;   // filtre pour extraction de programmes

  monitoringLocation: string = '';  // lieu de surveillance courant
    monitoringLabel: string = ''; //  libellé de la localisation

  private locationLabels = [
    { code: '126-', label: 'Réunion' },
    { code: '145-', label: 'Mayotte' },
    { code: '048-', label: 'Maurice' },
    { code: '153-', label: 'Île Tromelin' },
    { code: '152-', label: 'Îles Glorieuses' },
    { code: '154-', label: 'Île Juan de Nova' },
    { code: '155-', label: 'Île Bassas da India' },
    { code: '156-', label: 'Île Europa' },
  ];

  constructor(private http: HttpClient) {
    this.initialiserProgrammes();
  }

  private initialiserProgrammes() {
    this.http.get<any>('http://localhost:5000/last-programmes').subscribe({
      next: (res) => {
        if (res?.status === 'ok' && res?.programmes?.length > 0) {
          this.programmes = res.programmes;
          this.monitoringLocation = res?.monitoringLocation || '';
          this.updateMonitoringLabel();

          console.log(`[FRONTEND] ✅ Liste initialisée depuis le backend (${this.programmes.length} programmes)`);
          this.message = `Liste initialisée (${this.programmes.length} programmes pour ${this.monitoringLocation || 'lieu inconnu'})`;
        } else {
          console.warn("[FRONTEND] ⚠️ Aucun programme trouvé dans le backend");
          this.message = "Aucun programme trouvé dans le backend";
        }
      },
      error: (err) => {
        console.error("[FRONTEND] ❌ Erreur backend :", err);
        this.message = "Erreur backend, initialisation avec la liste par défaut";
      }
    });
  }



   private updateMonitoringLabel(): void {
    const found = this.locationLabels.find(l => this.monitoringLocation.startsWith(l.code));
    this.monitoringLabel = found ? found.label : '';
  }



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

  // 🔹 Gestion d’ouverture des filtres (ferme l’autre automatiquement)
  openDataFilter() {
    this.showProgramFilter = false; // fermer filtre programme
    this.showDataFilter = true;
  }

  openProgramFilter() {
    this.showDataFilter = false; // fermer filtre données
    this.showProgramFilter = true;
  }

  // 🔹 Quand le filtre de données est appliqué
  onDataFilterApplied(filterData: any) {
    console.log('[FRONTEND] 🎯 Filtre appliqué (données):', filterData);
    this.message = 'filtre de données appliqué.';
    this.showDataFilter = false; // fermeture automatique
    const { monitoringLocation, ...filterWithoutLocation } = filterData;
    this.dataFilter = filterWithoutLocation;
  }

  // 🔹 Quand le filtre de programmes est appliqué
  onProgramFilterApplied(filterData: any) {
    console.log('[FRONTEND] 📋 Filtre appliqué (programmes):', filterData);
    this.message = 'filtre de programmes appliqué.';
    this.showProgramFilter = false; // fermeture automatique
    this.programFilter = filterData;
  }

  // -----------------------------------------------------
  //  EXTRACTION DES PROGRAMMES
  // -----------------------------------------------------
  extractPrograms() {
  console.log('➡️ clic sur extractPrograms()');
  this.showDataFilter = false;
  this.showProgramFilter = false;

  if (!this.programFilter) {
    this.message = 'Veuillez définir un filtre d’extraction de programmes.';
    return;
  }

  this.isLoading = true;
  this.message = 'Extraction et filtrage des programmes en cours...';

  this.http
    .post<ProgramExtractionResponse>('http://localhost:5000/program-extraction', { filter: this.programFilter })
    .subscribe({
      next: (res) => {
        console.log('[FRONTEND] ⬅️ Réponse reçue (programmes filtrés):', res);

        //  Récupère la localisation depuis le filtre courant
        this.monitoringLocation = this.programFilter?.monitoringLocation || '';
        this.updateMonitoringLabel();

        if (res?.status === 'ok' && res?.fichiers_csv?.length > 0) {
          const csvUrl = res.fichiers_csv[0].url;
          this.chargerProgrammesDepuisCSV(csvUrl);
          this.message = `✅ Extraction terminée (${res.fichiers_csv.length} fichiers CSV)`;
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

  // -----------------------------------------------------
  //  RELANCER LE FILTRAGE SEUL (sur le CSV déjà extrait)
  // -----------------------------------------------------
  relancerFiltrageSeul() {
    console.log("➡️ clic sur relancerFiltrageSeul()");
    this.isLoading = true;
    this.http.post<any>('http://localhost:5000/filtrage_seul', { filter: this.programFilter || {} })
      .subscribe({
        next: (res) => {
          if (res?.status === 'ok' && res?.fichiers_csv?.length > 0) {
            const csvUrl = res.fichiers_csv[0].url;
            this.chargerProgrammesDepuisCSV(csvUrl);
          } else if (res?.status === 'ok' && (!res?.fichiers_csv || res.fichiers_csv.length === 0)) {
            this.message = "⚠️ Aucun CSV à filtrer, extrayez d’abord la liste des programmes.";
          } else {
            this.message = res?.message ?? 'Erreur backend';
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error("[FRONTEND] ❌ Erreur HTTP (filtrage seul):", err);
          this.message = "Erreur lors du filtrage seul.";
          this.isLoading = false;
        }
      });
  }

  // -----------------------------------------------------
  //  CHARGER LA LISTE DES PROGRAMMES DEPUIS UN CSV FILTRÉ
  // -----------------------------------------------------
  private chargerProgrammesDepuisCSV(csvUrl: string) {
    console.log("[FRONTEND] 📥 Téléchargement du CSV filtré :", csvUrl);

    this.http.get(csvUrl, { responseType: 'text' }).subscribe({
      next: (csvData) => {
        const lignes = csvData.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        const header = lignes[0].split(";");
        const data = lignes.slice(1);

        const idxCode = header.indexOf("Programme : Code");
        const idxLibelle = header.indexOf("Programme : Libellé");
        const idxEtat = header.indexOf("Programme : Etat");
        const idxDate = header.indexOf("Programme : Date de création");
        const idxResp = header.indexOf("Programme : Droit : Personne : Responsable : NOM Prénom : Liste");

        const nouveauxProgrammes = data.map(ligne => {
          const cols = ligne.split(";");
          return {
            name: cols[idxCode] ?? "",
            checked: false,
            libelle: idxLibelle !== -1 ? cols[idxLibelle] ?? "" : undefined,
            etat: idxEtat !== -1 ? cols[idxEtat] ?? "" : undefined,
            startDate: idxDate !== -1 ? cols[idxDate] ?? "" : undefined,
            responsable: idxResp !== -1 ? (cols[idxResp]?.replaceAll("|", ", ") ?? "") : undefined
          };
        }).filter(p => p.name !== "");

        this.programmes = nouveauxProgrammes;
        this.message = `✅ Liste mise à jour (${this.programmes.length} programmes depuis CSV filtré)`;
      },
      error: (err) => {
        console.error("[FRONTEND] ❌ Erreur téléchargement CSV filtré :", err);
        this.message = "Erreur lors du téléchargement du CSV filtré.";
      }
    });
  }

  // -----------------------------------------------------
  //  EXTRACTION DES DONNÉES
  // -----------------------------------------------------
  extractData() {
    console.log('➡️ clic sur extractData()');

    // Fermer les fenêtres avant extraction
    this.showDataFilter = false;
    this.showProgramFilter = false;

    const selectedPrograms = this.programmes.filter(p => p.checked).map(p => p.name);

    if (selectedPrograms.length === 0) {
      this.message = 'Veuillez sélectionner au moins un programme.';
      return;
    }

    if (!this.dataFilter) {
      this.message = 'Veuillez définir un filtre avant de lancer une extraction.';
      return;
    }

    this.isLoading = true;
    this.message = 'Extraction des données en cours...';

    this.http
      .post<ExtractionResponse>('http://localhost:5000/data-extractions', {
        programmes: selectedPrograms,
        filter: this.dataFilter
      })
      .subscribe({
        next: (res) => {
          console.log('[FRONTEND] ⬅️ Réponse reçue (données):', res);
          if (res?.status === 'ok') {
            this.extractedDataFiles = this.mapToExtractedLinks(res?.fichiers_zip);
            this.message = `Fichiers extraits (${this.extractedDataFiles.length})`;
          } else {
            this.message = res?.message ?? 'Réponse inattendue du serveur';
            this.extractedDataFiles = [];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('[FRONTEND] ❌ Erreur HTTP (données):', err);
          this.message = err?.error?.message ?? 'Erreur serveur inattendue';
          this.extractedDataFiles = [];
          this.isLoading = false;
        }
      });
  }
}
