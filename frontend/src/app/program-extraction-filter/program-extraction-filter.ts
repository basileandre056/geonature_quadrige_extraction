import {
  Component,
  EventEmitter,
  Output,
  HostListener,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ✅ Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-program-extraction-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './program-extraction-filter.html',
  styleUrls: ['./program-extraction-filter.scss']
})
export class ProgramExtractionFilterComponent {
  @Output() apply = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  filter = {
    name: '',
    monitoringLocation: ''
  };

  // 🌍 Liste des localisations suggérées
  sugested_locations = [
    { code: '126-', label: 'Réunion' },
    { code: '145-', label: 'Mayotte' },
    { code: '048-', label: 'Maurice' },
    { code: '153-', label: 'Ile Tromelin' },
    { code: '152-', label: 'Iles Glorieuses' },
    { code: '154-', label: 'Ile Juan De Nova' },
    { code: '155-', label: 'Ile Bassas Da India' },
    { code: '156-', label: 'Ile Europa' },
  ];

  // 🔍 Filtrage dynamique
  get filteredLocations() {
    const input = this.filter.monitoringLocation.toLowerCase();
    return this.sugested_locations.filter(loc =>
      loc.label.toLowerCase().includes(input) || loc.code.toLowerCase().includes(input)
    );
  }

  submitted = false;
  showSuggestions = false;

  // Références sur input et panneau
  @ViewChild('locInput') locInput?: ElementRef<HTMLInputElement>;
  @ViewChild('suggestionsPanel') suggestionsPanel?: ElementRef<HTMLElement>;

  openSuggestions() {
    this.showSuggestions = true;
  }

  selectSuggestion(code: string) {
    this.filter.monitoringLocation = code;
    this.showSuggestions = false;
  }

  // Ferme les suggestions si clic en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;
    const inInput = this.locInput?.nativeElement.contains(target);
    const inPanel = this.suggestionsPanel?.nativeElement.contains(target);
    if (!inInput && !inPanel) {
      this.showSuggestions = false;
    }
  }

  isFormValid(): boolean {
    const f = this.filter;
    return f.name.trim().length > 3;
  }

  applyFilter() {
    this.submitted = true;
    if (!this.isFormValid()) return;
    this.apply.emit(this.filter);
  }
}
