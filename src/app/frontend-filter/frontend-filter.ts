import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-frontend-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './frontend-filter.html',
  styleUrls: ['./frontend-filter.scss']
})


export class FrontendFilterComponent {
  @Output() apply = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  filter = {
    name: '',
    fields: [] as string[],
    startDate: '',
    endDate: '',
    monitoringLocation: '',
    commentaire: ''   // ✅ optionnel
  };

  //  liste des champs obligatoires
  requiredFields: (keyof typeof this.filter)[] = [
    'name',
    'fields',
    'startDate',
    'endDate',
    'monitoringLocation'
  ];

  newField = '';  // champ temporaire pour ajouter un élément




  isFormValid(): boolean {
  return this.requiredFields.every(field => {
    const value = this.filter[field];
    if (Array.isArray(value)) {
      return value.length > 0;  // ex. fields
    }
    return value.toString().trim() !== ''; // string non vide
  });
}


  addField() {
    if (this.newField.trim()) {
      this.filter.fields.push(this.newField.trim());
      this.newField = '';
    }
  }

  removeField(index: number) {
    this.filter.fields.splice(index, 1);
  }

  applyFilter() {
  // petite sécurité au cas où le bouton ne serait pas bien désactivé
  if (!this.isFormValid()) {
    return;
  }
  this.apply.emit(this.filter);
}


}
