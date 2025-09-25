import { Component } from '@angular/core';
import { Programmes } from './programmes/programmes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Programmes],
  templateUrl: './app.html'
})
export class App {}
