import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-program-extraction-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  templateUrl: './program-extraction-filter.html',
  styleUrls: ['./program-extraction-filter.scss']
})
export class ProgramExtractionFilterComponent {
  @Output() apply = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  /** ✅ Formulaire réactif */
  filterForm: FormGroup;

  /** ✅ Liste statique des lieux */
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

  filteredLocations$: Observable<{ code: string; label: string }[]>;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      monitoringLocation: new FormControl('', Validators.required)
    });

    this.filteredLocations$ = this.filterForm.get('monitoringLocation')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterLocations(value || ''))
    );
  }

  private filterLocations(value: string) {
    const filterValue = value.toLowerCase();
    return this.sugested_locations.filter(loc =>
      loc.label.toLowerCase().includes(filterValue) ||
      loc.code.toLowerCase().includes(filterValue)
    );
  }

  /** ✅ Validation globale */
  isFormValid(): boolean {
    return this.filterForm.valid;
  }

  /** ✅ Application du filtre */
  applyFilter(): void {
    if (!this.isFormValid()) return;
    this.apply.emit(this.filterForm.value);
  }
}
