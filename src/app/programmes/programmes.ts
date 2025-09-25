import { Component } from '@angular/core';        // Permet de déclarer un composant Angular
import { FormsModule } from '@angular/forms';     // Permet de gérer les formulaires (ex: ngModel pour checkbox, input)
import { CommonModule } from '@angular/common';   // Fournit les directives de base Angular (ngIf, ngFor, etc.)
import { HttpClient } from '@angular/common/http';// Service Angular pour faire des requêtes HTTP
import { Programme } from '../models/programmes'; // Modèle TypeScript décrivant la structure d’un "Programme"
import { ExtractedLink } from '../models/extractedLinks'; // Modèle pour représenter un fichier extrait
import { ExtractedLinks } from '../extracted-links/extracted-links'; // Un autre composant que tu réutilises ici

// Décorateur qui définit un composant Angular
@Component({
  selector: 'app-programmes',   // Balise HTML utilisée pour inclure ce composant (<app-programmes></app-programmes>)
  standalone: true,
  imports: [CommonModule, FormsModule, ExtractedLinks], // Modules et composants utilisés dans ce composant
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
  isLoading: boolean = false; // ✅ nouvelle variable pour gérer l'état du bouton

  constructor(private http: HttpClient) {}

  extraireDonnees() {
    const selections = this.programmes
      .filter(p => p.checked)
      .map(p => p.name);

    if (selections.length === 0) {
      this.message = 'Veuillez sélectionner au moins un programme.';
      return;
    }


    //début du chargement
    this.isLoading = true;
    this.message = `Processing... L’extraction peut prendre une minute ou deux`;

    this.http.post('http://localhost:5000/extractions', { programmes: selections })
      .subscribe({
        next: (res: any) => {
          if (res.status === "warning") {
            this.message = res.message;
            this.extractedFiles = [];
          } else if (res.status === "ok") {
            this.message = `Backend a reçu : ${res.programmes_recus.join(', ')}`;
            this.extractedFiles = res.fichiers_zip.map((f: any) => ({
              programme: f.programme,
              url: f.url
            }));
          }
          this.isLoading = false; // fin du chargement
        },
        error: err => {
          console.error(err);
          this.message = 'Erreur lors de l’envoi au backend';
          this.isLoading = false; //  même en cas d’erreur, on réactive le bouton
        }
      });
  }
}
