import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    commentaire: ''
  };

  newField = '';

  //  Liste complète des champs possibles
  availableFields: string[] = [
    "MONITORING_LOCATION_ORDER_ITEM_TYPE_ID",
    "MONITORING_LOCATION_ORDER_ITEM_TYPE_NAME",
    "MONITORING_LOCATION_ORDER_ITEM_LABEL",
    "MONITORING_LOCATION_ORDER_ITEM_NAME",
    "MONITORING_LOCATION_ID",
    "MONITORING_LOCATION_LABEL",
    "MONITORING_LOCATION_NAME",
    "SURVEY_LABEL",
    "SURVEY_DATE",
    "SURVEY_COMMENT",
    "SURVEY_NB_INDIVIDUALS",
    "SAMPLE_LABEL",
    "SAMPLE_MATRIX_NAME",
    "SAMPLE_TAXON_NAME",
    "SAMPLE_SIZE",
    "MEASUREMENT_NUMERICAL_VALUE",
    "MEASUREMENT_UNIT_SYMBOL",
    "MEASUREMENT_METHOD_NAME",
    "MEASUREMENT_COMMENT"
  ];

  //  Liste des champs restants à choisir
  get remainingFields(): string[] {
    return this.availableFields.filter(f => !this.extraction_filter.fields.includes(f));
  }

  // ✅ Nouvelle validation simplifiée :
isFormValid(): boolean {
  const f = this.extraction_filter;

  // Vérifie que le nom existe et fait plus de 3 caractères
  if (!f.name || f.name.trim().length <= 3) return false;

  // Vérifie que les champs à extraire existent
  if (!Array.isArray(f.fields) || f.fields.length === 0) return false;

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
