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
    fields: '',
    periods: [{ startDate: '', endDate: '' }],
    monitoringLocation: ''
  };

  addPeriod() {
    this.filter.periods.push({ startDate: '', endDate: '' });
  }

  applyFilter() {
    this.apply.emit(this.filter);
  }
}
