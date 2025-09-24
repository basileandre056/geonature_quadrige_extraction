import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FichierExtrait } from '../models/fichiers-extraits';

@Component({
  selector: 'app-extracted-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './extracted-links.html',
  styleUrls: ['./extracted-links.scss']
})
export class ExtractedLinks {
  @Input() files: FichierExtrait[] = [];
}
