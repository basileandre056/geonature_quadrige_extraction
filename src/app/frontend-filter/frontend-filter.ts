import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';   // ✅ nécessaire pour *ngIf / *ngFor
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-frontend-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],            // ✅ ajoute CommonModule ici
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





  // ✅ liste complète des champs
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

  // ✅ n’affiche que les champs non encore choisis
  get remainingFields(): string[] {
    return this.availableFields.filter(f => !this.extraction_filter.fields.includes(f));
  }

  newField = '';

  isFormValid(): boolean {
    return ['name','fields','startDate','endDate','monitoringLocation']
      .every((k) => {
        const v = (this.extraction_filter as any)[k];
        return Array.isArray(v) ? v.length > 0 : v.toString().trim() !== '';
      });
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
