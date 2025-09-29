import { Component, EventEmitter, Output } from '@angular/core';
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

  isFormValid(): boolean {
    return this.filter.name.trim() !== '' && this.filter.monitoringLocation.trim() !== '';
  }

  applyFilter() {
    if (!this.isFormValid()) return;
    this.apply.emit(this.filter);
  }
}
