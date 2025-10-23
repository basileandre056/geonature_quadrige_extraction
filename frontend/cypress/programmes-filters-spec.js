describe('Programmes module - search and filters', () => {

  beforeEach(() => {
    cy.visit('/programmes');
  });

  it('should filter programmes based on search input', () => {
    cy.get('.search-field input')
      .type('marine', { delay: 100 });

    cy.get('table mat-row')
      .each(($row) => {
        cy.wrap($row).should('contain.text', 'marine');
      });
  });

  it('should clear the search when clicking the close button', () => {
    cy.get('.search-field input').type('test');
    cy.get('.search-field button[aria-label="Effacer la recherche"]').click();
    cy.get('.search-field input').should('have.value', '');
  });

});
