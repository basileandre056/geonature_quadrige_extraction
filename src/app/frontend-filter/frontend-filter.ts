import { Component, EventEmitter, Output, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';   //  nécessaire pour *ngIf / *ngFor
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-frontend-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './frontend-filter.html',
  styleUrls: ['./frontend-filter.scss']
})
export class FrontendFilterComponent {
  @Output() apply = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  extraction_filter = {
    name: '',
    fields: [] as string[],
    startDate: '',
    endDate: '',
    monitoringLocation: '',
    commentaire: ''
  };

// liste des localisations suggérées (tableau pour l’affichage)
sugested_locations = [
  { code: '126-', label: 'Réunion' },
  { code: '145-', label: 'Mayotte' },
  { code: '048-', label: 'Maurice' },
];

showSuggestions = false;

// refs sur l’input et le panneau de suggestions
@ViewChild('locInput') locInput?: ElementRef<HTMLInputElement>;
@ViewChild('suggestionsPanel') suggestionsPanel?: ElementRef<HTMLElement>;

openSuggestions() {
  this.showSuggestions = true;
}

selectSuggestion(code: string) {
  this.extraction_filter.monitoringLocation = code;
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


  //  liste complète des champs
  availableFields: string[] = [
    "MONITORING_LOCATION_ORDER_ITEM_TYPE_ID",
    "MONITORING_LOCATION_ORDER_ITEM_TYPE_NAME",
    "MONITORING_LOCATION_ORDER_ITEM_LABEL",
    "MONITORING_LOCATION_ORDER_ITEM_NAME",
    "MONITORING_LOCATION_ID",
    "MONITORING_LOCATION_LABEL",
    "MONITORING_LOCATION_NAME",
    "MONITORING_LOCATION_MIN_LATITUDE",
    "MONITORING_LOCATION_MIN_LONGITUDE",
    "MONITORING_LOCATION_MAX_LATITUDE",
    "MONITORING_LOCATION_MAX_LONGITUDE",
    "SURVEY_LABEL",
    "SURVEY_DATE",
    "SURVEY_COMMENT",
    "SURVEY_NB_INDIVIDUALS",
    "SURVEY_BOTTOM_DEPTH",
    "SURVEY_BOTTOM_DEPTH_UNIT_SYMBOL",
    "SURVEY_CAMPAIGN_NAME",
    "SURVEY_OCCASION_NAME",
    "SURVEY_UNDER_MORATORIUM",
    "SURVEY_MIN_LATITUDE",
    "SURVEY_MIN_LONGITUDE",
    "SURVEY_MAX_LATITUDE",
    "SURVEY_MAX_LONGITUDE",
    "SURVEY_START_LATITUDE",
    "SURVEY_START_LONGITUDE",
    "SURVEY_END_LATITUDE",
    "SURVEY_END_LONGITUDE",
    "SAMPLING_OPERATION_LABEL",
    "SAMPLING_OPERATION_TIME",
    "SAMPLING_OPERATION_COMMENT",
    "SAMPLING_OPERATION_SAMPLING_DEPARTMENT_LABEL",
    "SAMPLING_OPERATION_SAMPLING_DEPARTMENT_NAME",
    "SAMPLING_OPERATION_DEPTH_LEVEL_NAME",
    "SAMPLING_OPERATION_DEPTH",
    "SAMPLING_OPERATION_DEPTH_MIN",
    "SAMPLING_OPERATION_DEPTH_MAX",
    "SAMPLING_OPERATION_DEPTH_UNIT_SYMBOL",
    "SAMPLING_OPERATION_NB_INDIVIDUALS",
    "SAMPLING_OPERATION_SIZE",
    "SAMPLING_OPERATION_SIZE_UNIT_SYMBOL",
    "SAMPLING_OPERATION_EQUIPMENT_NAME",
    "SAMPLING_OPERATION_BATCH_NAME",
    "SAMPLING_OPERATION_BATCH_LABEL",
    "SAMPLING_OPERATION_INITIAL_POPULATION_NAME",
    "SAMPLING_OPERATION_INITIAL_POPULATION_LABEL",
    "SAMPLING_OPERATION_UNDER_MORATORIUM",
    "SAMPLING_OPERATION_MIN_LATITUDE",
    "SAMPLING_OPERATION_MIN_LONGITUDE",
    "SAMPLING_OPERATION_MAX_LATITUDE",
    "SAMPLING_OPERATION_MAX_LONGITUDE",
    "SAMPLING_OPERATION_START_LATITUDE",
    "SAMPLING_OPERATION_START_LONGITUDE",
    "SAMPLING_OPERATION_END_LATITUDE",
    "SAMPLING_OPERATION_END_LONGITUDE",
    "SAMPLE_LABEL",
    "SAMPLE_COMMENT",
    "SAMPLE_MATRIX_NAME",
    "SAMPLE_TAXON_NAME",
    "SAMPLE_NB_INDIVIDUALS",
    "SAMPLE_SIZE",
    "SAMPLE_SIZE_UNIT_NAME",
    "SAMPLE_UNDER_MORATORIUM",
    "MEASUREMENT_PROGRAMS_ID",
    "MEASUREMENT_PMFMU_PARAMETER_ID",
    "MEASUREMENT_PMFMU_MATRIX_NAME",
    "MEASUREMENT_PMFMU_FRACTION_NAME",
    "MEASUREMENT_PMFMU_METHOD_NAME",
    "MEASUREMENT_PMFMU_UNIT_SYMBOL",
    "MEASUREMENT_TAXON_GROUP_NAME",
    "MEASUREMENT_INPUT_TAXON_NAME",
    "MEASUREMENT_NUMERICAL_PRECISION_NAME",
    "MEASUREMENT_INDIVIDUAL_ID",
    "MEASUREMENT_QUALITATIVE_VALUE_NAME",
    "MEASUREMENT_NUMERICAL_VALUE",
    "MEASUREMENT_COMMENT",
    "MEASUREMENT_INSTRUMENT_NAME",
    "MEASUREMENT_ANALYST_DEPARTMENT_LABEL",
    "MEASUREMENT_ANALYST_DEPARTMENT_NAME",
    "MEASUREMENT_RECORDER_DEPARTMENT_LABEL",
    "MEASUREMENT_RECORDER_DEPARTMENT_NAME"
  ];

  //  n’affiche que les champs non encore choisis
  get remainingFields(): string[] {

    return this.availableFields.filter(f => !this.extraction_filter.fields.includes(f));

  }

    newField = '';

    isFormValid(): boolean {
    const f = this.extraction_filter;

    // Obligatoires
    if (f.name.trim() === '') return false;
    if (!Array.isArray(f.fields) || f.fields.length === 0) return false;

    // Condition : soit une période valide, soit un code de lieu, soit les deux
    const hasPeriod = f.startDate.trim() !== '' && f.endDate.trim() !== '';
    const hasLocation = f.monitoringLocation.trim() !== '';

    if (!hasPeriod && !hasLocation) return false;

    return true;
  }

  addField() {
    if (this.newField && !this.extraction_filter.fields.includes(this.newField)) {
      this.extraction_filter.fields.push(this.newField);
      this.newField = '';
    }
  }

  removeField(index: number) {
    this.extraction_filter.fields.splice(index, 1);
  }

  applyFilter() {
    if (!this.isFormValid()) return;
    this.apply.emit(this.extraction_filter);
  }
}
