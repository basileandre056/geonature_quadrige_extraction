// frontend/cypress/e2e/programmes/programmes-basic-spec.js

describe('Programmes module - extraction behavior without filter', () => {

  //
  // Avant chaque test : on visite la page principale du module
  //
  beforeEach(() => {
    cy.visit('/programmes');
  });

  //
  // Vérifie que la page s’affiche correctement
  //
  it('should display the main title and action buttons', () => {
    cy.contains('h2', 'Programmes à extraire').should('be.visible');
    cy.contains('button', 'Extraire les programmes').should('be.visible');
    cy.contains('button', 'Filtre programmes').should('be.visible');
  });

  //
  // Cas sans filtre défini → affiche le message d’erreur
  //
  it('should show an error message if extractPrograms() is called without a filter', () => {
    // 🖱️ Clique sur le bouton
    cy.contains('button', 'Extraire les programmes').click();

    // 🧾 Vérifie que le message d’erreur apparaît
    cy.get('p.text-center.text-muted')
      .should('be.visible')
      .and('contain.text', 'Veuillez définir un filtre d’extraction de programmes.');
  });

});
