import { Component, EventEmitter, Output, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-program-extraction-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
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


  // liste des localisations suggérées (tableau pour l’affichage)
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

submitted = false;

showSuggestions = false;

// refs sur l’input et le panneau de suggestions
@ViewChild('locInput') locInput?: ElementRef<HTMLInputElement>;
@ViewChild('suggestionsPanel') suggestionsPanel?: ElementRef<HTMLElement>;

openSuggestions() {
  this.showSuggestions = true;
}

selectSuggestion(code: string) {
  this.filter.monitoringLocation = code;
  this.showSuggestions = false;
}

// ferme si clic en dehors de l’input et du panneau
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
    return this.filter.name.trim() !== '' && this.filter.monitoringLocation.trim() !== '';
  }

  applyFilter() {
    this.submitted = true;
    if (!this.isFormValid()) return;
    this.apply.emit(this.filter);
  }
}
