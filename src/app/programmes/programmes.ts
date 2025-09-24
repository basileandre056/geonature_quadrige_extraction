import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Programme } from '../models/programmes';
import { FichierExtrait } from '../models/fichiers-extraits';
import { ExtractedLinks } from '../extracted-links/extracted-links.component';

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
    { name: 'UTOPIAN_RUN_COR-SEARAM_PA_POISSONS', checked: false }
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

    this.http.post('http://localhost:5000/extractions', { programmes: selections })
      .subscribe({
        next: (res: any) => {
          this.message = `Backend a reçu : ${res.programmes_recus.join(', ')}`;
          this.extractedFiles = res.links_fichiers_zip.map((url: string, i: number) => ({
            programme: res.programmes_recus[i],
            url
          }));
        },
        error: err => {
          console.error(err);
          this.message = 'Erreur lors de l’envoi au backend';
        }
      });
  }
}
