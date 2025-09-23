import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Programme } from '../models/programmes';

@Component({
  selector: 'app-programmes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programmes.html',
  styleUrls: ['./programmes.scss']
})
export class Programmes {
  programmes: Programme[] = [
    { name: 'EI_RUN_KELONIA_BELT_POISSON', checked: false },
    { name: 'EI_RUN_GRAND-PORT_BELT_POISSON', checked: false },
    { name: 'UTOPIAN_RUN_COR-SEARAM_PA_POISSONS', checked: false }
  ];

  extractions: string[] = [];

  message: string = '';  // message de confirmation depuis le backend

  constructor(private http: HttpClient) {}

  extraireDonnees() {
    // On récupère uniquement les noms cochés
    this.extractions = this.programmes
      .filter(p => p.checked)
      .map(p => p.name);

    // Envoi au backend
    this.http.post('http://localhost:5000/extractions', { programmes: this.extractions })
      .subscribe({
        next: (res: any) => {
          console.log('Programmes envoyés au backend', res);
          this.message = `Backend a reçu : ${res.programmes_recus.join(', ')}`;
        },
        error: err => {
          console.error('Erreur lors de l’envoi', err);
          this.message = 'Erreur lors de l’envoi au backend';
        }
      });
  }
}
