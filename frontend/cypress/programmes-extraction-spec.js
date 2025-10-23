describe('Programmes module - extraction actions', () => {

  beforeEach(() => {
    cy.visit('/programmes');
  });

  it('should trigger data extraction when clicking the button', () => {
    cy.intercept('GET', '/api/extraction/data*').as('extractData');
    cy.get('[data-qa="extract-data"]').click();
    cy.wait('@extractData');
  });

  it('should open the program filter modal', () => {
    cy.get('[data-qa="open-program-filter"]').click();
    cy.get('app-program-extraction-filter').should('be.visible');
  });

});
