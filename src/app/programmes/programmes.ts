import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Programme } from '../models/programmes';
import { FichierExtrait } from '../models/fichiers-extraits';
import { ExtractedLinks } from '../extracted-links/extracted-links';

@Component({
  selector: 'app-programmes',
  standalone: true,
  imports: [CommonModule, FormsModule, ExtractedLinks],
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


  extractedFiles: FichierExtrait[] = [];
  message: string = '';

  constructor(private http: HttpClient) {}

  extraireDonnees() {
    const selections = this.programmes
      .filter(p => p.checked)
      .map(p => p.name);

    if (selections.length === 0) {
      this.message = 'Veuillez sélectionner au moins un programme.';
      return;
    }

    this.message = `Processing... L’extraction peut prendre une minute ou deux`;

    this.http.post('http://localhost:5000/extractions', { programmes: selections })
      .subscribe({
        next: (res: any) => {
          if (res.status === "warning") {
            this.message = res.message;
            this.extractedFiles = [];
            return;
          }

          if (res.status === "ok") {
            this.message = `Backend a reçu : ${res.programmes_recus.join(', ')}`;
            this.extractedFiles = res.fichiers_zip.map((f: any) => ({
              programme: f.programme,
              url: f.url
            }));
          }
        },
        error: err => {
          console.error(err);
          this.message = 'Erreur lors de l’envoi au backend';
        }
      });
  }
}
