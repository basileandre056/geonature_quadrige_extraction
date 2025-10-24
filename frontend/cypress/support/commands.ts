/// <reference types="cypress" />

// ===============
// 🧩 FILTRE DONNÉES
// ===============

Cypress.Commands.add('setFilterName', (name: string) => {
  cy.get('input[formControlName="name"]').clear().type(name).blur();
});

Cypress.Commands.add('addField', (fieldName: string) => {
  cy.get('input[placeholder="Ajouter un champ"]').type(fieldName, { delay: 50 });
  cy.get('.cdk-overlay-container mat-option', { timeout: 8000 })
    .should('contain.text', fieldName)
    .first()
    .scrollIntoView()
    .click({ force: true });
});

Cypress.Commands.add('setDateRange', (start: string, end: string) => {
  cy.get('input[formControlName="startDate"]').type(start, { force: true });
  cy.get('input[formControlName="endDate"]').type(end, { force: true });
});

Cypress.Commands.add('submitFilter', () => {
  cy.contains('button', 'Valider').click({ force: true });
});

Cypress.Commands.add('checkMainMessage', (expectedText: string) => {
  cy.get('p.text-center.text-muted', { timeout: 8000 })
    .should('contain.text', expectedText);
});

// ===============
// 🧩 FILTRE PROGRAMMES
// ===============

Cypress.Commands.add('setProgramName', (name: string) => {
  cy.get('input[formControlName="name"]').clear().type(name).blur();
});

Cypress.Commands.add('setProgramLocation', (code: string, label: string) => {
  cy.get('input[formControlName="monitoringLocation"]').type(code, { delay: 50 });
  cy.get('.cdk-overlay-container mat-option', { timeout: 8000 })
    .should('contain.text', label)
    .first()
    .scrollIntoView()
    .click({ force: true });
});
