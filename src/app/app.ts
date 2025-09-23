import { Component } from '@angular/core';
import { Programmes } from './programmes/programmes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Programmes],
  template: `
    <h1>Mon Application Angular</h1>
    <app-programmes></app-programmes>
  `
})
export class App {}
