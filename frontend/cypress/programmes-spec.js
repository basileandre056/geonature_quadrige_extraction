describe('Programmes module - main interface', () => {

  beforeEach(() => {
    // 🌐 Charge la page des programmes
    cy.visit('/programmes');
  });

  it('should display the page title', () => {
    cy.contains('h2', 'Programmes à extraire').should('be.visible');
  });

  it('should display the action buttons', () => {
    cy.get('[data-qa="extract-data"]').should('be.visible');
    cy.get('[data-qa="open-data-filter"]').should('be.visible');
    cy.get('[data-qa="extract-programs"]').should('be.visible');
    cy.get('[data-qa="open-program-filter"]').should('be.visible');
  });

  it('should display the table of programmes', () => {
    cy.get('table').should('exist');
    cy.get('th').contains('Programme');
    cy.get('th').contains('Libellé');
  });

});
