import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

// ✅ Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-frontend-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './frontend-filter.html',
  styleUrls: ['./frontend-filter.scss']
})
export class FrontendFilterComponent {
  @Output() apply = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  /** ✅ Formulaire principal */
  filterForm: FormGroup;

  /** ✅ Liste complète des champs disponibles */
  availableFields: string[] = [
    'MONITORING_LOCATION_ORDER_ITEM_TYPE_ID',
    'MONITORING_LOCATION_ORDER_ITEM_TYPE_NAME',
    'MONITORING_LOCATION_ORDER_ITEM_LABEL',
    'MONITORING_LOCATION_ORDER_ITEM_NAME',
    'MONITORING_LOCATION_ID',
    'MONITORING_LOCATION_LABEL',
    'MONITORING_LOCATION_NAME',
    'SURVEY_LABEL',
    'SURVEY_DATE',
    'SURVEY_COMMENT',
    'SURVEY_NB_INDIVIDUALS',
    'SAMPLE_LABEL',
    'SAMPLE_MATRIX_NAME',
    'SAMPLE_TAXON_NAME',
    'SAMPLE_SIZE',
    'MEASUREMENT_NUMERICAL_VALUE',
    'MEASUREMENT_UNIT_SYMBOL',
    'MEASUREMENT_METHOD_NAME',
    'MEASUREMENT_COMMENT'
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      fields: [[]],
      fieldInput: new FormControl(''),
      startDate: new FormControl<Date | null>(null),
      endDate: new FormControl<Date | null>(null)
    });
  }

  /** ✅ Getter pour le champ d’ajout (pour éviter les erreurs TS) */
  get fieldInputControl(): FormControl {
    return this.filterForm.get('fieldInput') as FormControl;
  }

  /** ✅ Getter pour les champs restants à ajouter */
  get remainingFields(): string[] {
    const selected: string[] = (this.filterForm.value.fields as string[]) || [];
    return this.availableFields.filter((f: string) => !selected.includes(f));
  }

  /** ✅ Vérifie la validité du formulaire */
  isFormValid(): boolean {
    const { name, fields, startDate, endDate } = this.filterForm.value;
    if (!name || name.trim().length <= 3) return false;
    if (!Array.isArray(fields) || fields.length === 0) return false;
    if (startDate && endDate && startDate > endDate) return false;
    return true;
  }

  /** ✅ Ajoute un champ sélectionné */
  addField(field: string): void {
    if (!field) return;
    const fields: string[] = (this.filterForm.value.fields as string[]) || [];
    if (!fields.includes(field)) {
      this.filterForm.patchValue({ fields: [...fields, field], fieldInput: '' });
    }
  }

  /** ✅ Supprime un champ */
  removeField(field: string): void {
    const fields: string[] = (this.filterForm.value.fields as string[]) || [];
    this.filterForm.patchValue({
      fields: fields.filter((f: string) => f !== field)
    });
  }

  /** ✅ Envoi du filtre au parent */
  applyFilter(): void {
    if (!this.isFormValid()) return;

    const filterData = {
      name: this.filterForm.value.name,
      fields: this.filterForm.value.fields,
      startDate: this.filterForm.value.startDate,
      endDate: this.filterForm.value.endDate
    };

    this.apply.emit(filterData);
  }
}
