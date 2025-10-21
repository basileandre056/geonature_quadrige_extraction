import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtractedLink } from '../models/extractedLinks';

@Component({
  selector: 'app-extracted-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './extracted-links.html',
  styleUrls: ['./extracted-links.scss']
})
export class ExtractedLinks {
  @Input() files: ExtractedLink[] = [];
  @Input() title: string = 'Liens extraits'; //  Valeur par défaut

  // 🧠 Sélectionne une icône selon le type de fichier
  getFileIconClass(fileName: string): string {
    if (!fileName) return 'icon-generic';
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.csv')) return 'icon-csv';
    if (lower.endsWith('.zip')) return 'icon-zip';
    if (lower.endsWith('.json')) return 'icon-json';
    return 'icon-link';
  }
}
