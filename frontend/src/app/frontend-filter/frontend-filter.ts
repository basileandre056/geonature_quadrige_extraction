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
    'MEASUREMENT_COMMENT',
    'MEASUREMENT_PMFMU_METHOD_NAME',
    'MEASUREMENT_NUMERICAL_VALUE',
    'MEASUREMENT_PMFMU_PARAMETER_NAME',
    'MEASUREMENT_REFERENCE_TAXON_NAME',
    'MEASUREMENT_REFERENCE_TAXON_TAXREF',
    'MEASUREMENT_STRATEGIES_NAME',
    'MEASUREMENT_UNDER_MORATORIUM',
    'MEASUREMENT_PMFMU_UNIT_SYMBOL',
    'MONITORING_LOCATION_BATHYMETRY',
    'MONITORING_LOCATION_CENTROID_LATITUDE',
    'MONITORING_LOCATION_CENTROID_LONGITUDE',
    'MONITORING_LOCATION_ID',
    'MONITORING_LOCATION_LABEL',
    'MONITORING_LOCATION_NAME',
    'SAMPLE_LABEL',
    'SAMPLE_MATRIX_NAME',
    'SAMPLE_SIZE',
    'SAMPLE_TAXON_NAME',
    'SURVEY_COMMENT',
    'SURVEY_DATE',
    'SURVEY_LABEL',
    'SURVEY_NB_INDIVIDUALS',
    'SURVEY_OBSERVER_DEPARTMENT_ID',
    'SURVEY_OBSERVER_DEPARTMENT_LABEL',
    'SURVEY_OBSERVER_DEPARTMENT_NAME',
    'SURVEY_OBSERVER_DEPARTMENT_SANDRE',
    'SURVEY_OBSERVER_ID',
    'SURVEY_OBSERVER_NAME',
    'SURVEY_PROGRAMS_NAME',
    'SURVEY_RECORDER_DEPARTMENT_ID',
    'SURVEY_RECORDER_DEPARTMENT_LABEL',
    'SURVEY_RECORDER_DEPARTMENT_NAME',
    'SURVEY_RECORDER_DEPARTMENT_SANDRE',
    'SURVEY_TIME',
    'SURVEY_UNDER_MORATORIUM',


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

  // Nom du filtre : requis + longueur minimale
  const nameValid = name && name.trim().length >= 3;

  // Champs à extraire : au moins un
  const fieldsValid = Array.isArray(fields) && fields.length > 0;

  // Période : facultative, mais si une date existe, il faut les deux et start ≤ end
  let periodValid = true;
  if (startDate || endDate) {
    periodValid = !!(startDate && endDate && startDate <= endDate);
  }

  return nameValid && fieldsValid && periodValid;
}

/** ✅ Indique si la section “Champs à extraire” est invalide */
get fieldsInvalid(): boolean {
  const fields: string[] = (this.filterForm.value.fields as string[]) || [];
  return fields.length === 0;
}

/** ✅ Indique si la période est invalide */
get dateRangeInvalid(): boolean {
  const { startDate, endDate } = this.filterForm.value;
  if (!startDate && !endDate) return false; // pas de période => OK
  if (!startDate || !endDate) return true;  // une seule date => erreur
  return startDate > endDate;               // ordre incorrect
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

  const formatDate = (d: Date | null): string | null => {
    if (!d) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filterData = {
    name: this.filterForm.value.name,
    fields: this.filterForm.value.fields,
    startDate: formatDate(this.filterForm.value.startDate),
    endDate: formatDate(this.filterForm.value.endDate)
  };

  this.apply.emit(filterData);
}

}
