import { Component } from '@angular/core';
import { Programmes } from './programmes/programmes';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Programmes],
  templateUrl: './app.html'
})
export class App {}
