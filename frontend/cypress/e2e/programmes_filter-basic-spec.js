describe('Programmes module - extraction programmes behavior without filter', () => {
  beforeEach(() => cy.visit('/programmes'));

  it('should display the main title and action buttons', () => {
    cy.contains('h2', 'Programmes à extraire').should('be.visible');
    cy.contains('button', 'Extraire les programmes').should('be.visible');
    cy.contains('button', 'Filtre programmes').should('be.visible');
  });

  it('should show an error message if extractPrograms() is called without a filter', () => {
    cy.contains('button', 'Extraire les programmes').click();
    cy.checkMainMessage('Veuillez définir un filtre d’extraction de programmes.');
  });
});

describe('Programmes module - program filter validation', () => {
  beforeEach(() => {
    cy.visit('/programmes');
    cy.contains('button', 'Filtre programmes').click();
    cy.get('app-program-extraction-filter').should('be.visible');
  });

  it('should not let apply the filter when name is invalid', () => {
    cy.setProgramName('Te');
    cy.setProgramLocation('048-', 'Maurice');
    cy.contains('button', 'Valider').should('be.disabled');
    cy.get('mat-error').should('contain.text', '3 caractères');
  });

  it('should not let apply the filter when monitoringLocation is missing', () => {
    cy.setProgramName('ValidName');
    cy.get('input[formControlName="monitoringLocation"]').clear();
    cy.get('input[formControlName="name"]').focus().blur(); // 👈 Déclenche la validation "touched"
    cy.contains('button', 'Valider').should('be.disabled');
    cy.get('mat-error').should('contain.text', 'Sélectionnez un lieu dans la liste.');
  });

  it('should apply the filter when both fields are valid', () => {
    cy.setProgramName('ValidFilter');
    cy.setProgramLocation('048-', 'Maurice');
    cy.submitFilter();
    cy.checkMainMessage('filtre de programmes appliqué.');
  });
});
