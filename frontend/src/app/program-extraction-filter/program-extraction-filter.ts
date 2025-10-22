import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';

// ✅ Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// ✅ RxJS imports
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-program-extraction-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule
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

  // ✅ Liste statique des lieux
  sugested_locations = [
    { code: '126-', label: 'Réunion' },
    { code: '145-', label: 'Mayotte' },
    { code: '048-', label: 'Maurice' },
    { code: '153-', label: 'Île Tromelin' },
    { code: '152-', label: 'Îles Glorieuses' },
    { code: '154-', label: 'Île Juan De Nova' },
    { code: '155-', label: 'Île Bassas Da India' },
    { code: '156-', label: 'Île Europa' },
  ];

  // ✅ Contrôle réactif pour l’autocomplete
  locationControl = new FormControl('');
  filteredLocations$: Observable<{ code: string; label: string }[]>;

  constructor() {
    // Met à jour la liste filtrée à chaque frappe
    this.filteredLocations$ = this.locationControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterLocations(value || ''))
    );

    // Synchronisation du champ avec le filtre principal
    this.locationControl.valueChanges.subscribe(value => {
      this.filter.monitoringLocation = value || '';
    });
  }

  private filterLocations(value: string) {
    const filterValue = value.toLowerCase();
    return this.sugested_locations.filter(loc =>
      loc.label.toLowerCase().includes(filterValue) ||
      loc.code.toLowerCase().includes(filterValue)
    );
  }

  onLocationSelected(code: string) {
    this.filter.monitoringLocation = code;
    this.locationControl.setValue(code, { emitEvent: false });
  }

  isFormValid(): boolean {
    const f = this.filter;
    return f.name.trim().length > 3 && !!this.filter.monitoringLocation;
  }

  applyFilter() {
    // Synchronisation finale avant émission
    this.filter.monitoringLocation = this.locationControl.value || '';
    if (!this.isFormValid()) return;
    this.apply.emit(this.filter);
  }
}
