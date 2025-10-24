describe('Programmes module - extraction data behavior without filter', () => {

  beforeEach(() => {
    cy.visit('/programmes');
  });

  it('should display the main title and action buttons', () => {
    cy.contains('h2', 'Programmes à extraire').should('be.visible');
    cy.contains('button', 'Extraire les données').should('be.visible');
    cy.contains('button', 'Filtre extraction données').should('be.visible');
  });

  it('should show an error message if extractData() is called without a filter', () => {
    cy.contains('button', 'Extraire les données').click();

    cy.get('p.text-center.text-muted')
      .should('be.visible')
      .and('contain.text', 'Veuillez définir un filtre avant de lancer une extraction.');
  });
});


describe('Programmes module - data filter form validation', () => {

  beforeEach(() => {
    cy.visit('/programmes');
    cy.contains('button', 'Filtre extraction données').click();
    cy.get('app-frontend-filter').should('be.visible');
  });

  //
  // 🧩 Cas 1 — Nom trop court (<3 caractères)
  //
  it('should not allow applying the filter when name is invalid', () => {
    cy.get('input[formControlName="name"]').type('Te');

    cy.get('input[placeholder="Ajouter un champ"]').type('SURVEY_DATE', { delay: 50 });
    cy.get('.cdk-overlay-container mat-option', { timeout: 8000 })
      .should('contain.text', 'SURVEY_DATE')
      .first()
      .click({ force: true });

    cy.contains('button', 'Valider').should('be.disabled');

    cy.get('mat-error')
      .should('be.visible')
      .and('contain.text', 'Le nom du filtre doit faire au moins 3 caractères');

    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('not.contain.text', 'filtre de données appliqué.');
  });


  //
  // 🧩 Cas 2 — Nom valide mais aucun champ sélectionné
  //
  it('should not allow applying the filter when no field is selected', () => {
    cy.get('input[formControlName="name"]').type('ValidName');
    cy.contains('button', 'Valider').should('be.disabled');

    cy.get('mat-error')
      .should('be.visible')
      .and('contain.text', 'Veuillez choisir au moins un champ à extraire.');
  });


  //
  // 🧩 Cas 3 — Nom vide
  //
  it('should not allow applying the filter when name is empty', () => {
    cy.get('input[placeholder="Nom du filtre"]').focus().blur();

    cy.get('mat-error')
      .should('be.visible')
      .and('contain.text', 'Le nom du filtre est requis.');

    cy.contains('button', 'Valider').should('be.disabled');
  });


  //
  // 🧩 Cas 4 — Champ d’extraction ajouté mais pas de nom
  //
  it('should not allow applying the filter when field is selected but name missing', () => {
  cy.get('input[placeholder="Ajouter un champ"]').type('SURVEY_DATE', { delay: 50 });
  cy.get('.cdk-overlay-container mat-option', { timeout: 8000 })
    .should('contain.text', 'SURVEY_DATE')
    .first()
    .click({ force: true });

  // Force le champ "name" à être touché pour que l'erreur s'affiche
  cy.get('input[formControlName="name"]').focus().blur();

  cy.contains('button', 'Valider').should('be.disabled');

  cy.get('mat-error')
    .should('be.visible')
    .and('contain.text', 'Le nom du filtre est requis.');
});



  //
  // 🧩 Cas 5 — Dates invalides (date de fin < date de début)
  //
  it('should not allow applying the filter when date range is invalid', () => {
    cy.get('input[formControlName="name"]').type('InvalidDate');
    cy.get('input[placeholder="Ajouter un champ"]').type('SURVEY_DATE', { delay: 50 });
    cy.get('.cdk-overlay-container mat-option', { timeout: 8000 })
      .should('contain.text', 'SURVEY_DATE')
      .first()
      .click({ force: true });

    cy.get('input[formControlName="startDate"]').type('2024-10-10', { force: true });
    cy.get('input[formControlName="endDate"]').type('2024-09-10', { force: true });

    cy.contains('button', 'Valider').should('be.disabled');

    cy.get('mat-error')
      .should('be.visible')
      .and('contain.text', 'Entrez une période valide');
  });


  //
  // 🧩 Cas 6 — Une seule date (incomplète)
  //
  it('should not allow applying the filter when only one date is provided', () => {
    cy.get('input[formControlName="name"]').type('HalfDate');
    cy.get('input[placeholder="Ajouter un champ"]').type('SURVEY_DATE', { delay: 50 });
    cy.get('.cdk-overlay-container mat-option', { timeout: 8000 })
      .should('contain.text', 'SURVEY_DATE')
      .first()
      .click({ force: true });

    cy.get('input[formControlName="startDate"]').type('2024-09-01', { force: true });

    cy.contains('button', 'Valider').should('be.disabled');

    cy.get('mat-error')
      .should('be.visible')
      .and('contain.text', 'Entrez une période valide');
  });


  //
  // ✅ Cas 7 — Nom et champ valides, sans période (valide)
  //
  it('should apply the filter when name and at least one field are valid without dates', () => {
    cy.get('input[formControlName="name"]').type('MinimalValidFilter');
    cy.get('input[placeholder="Ajouter un champ"]').type('SURVEY_DATE', { delay: 50 });
    cy.get('.cdk-overlay-container mat-option', { timeout: 8000 })
      .should('contain.text', 'SURVEY_DATE')
      .first()
      .click({ force: true });

    // ✅ Le bouton Valider doit être actif
    cy.contains('button', 'Valider').should('not.be.disabled');

    // 🖱️ Valider
    cy.contains('button', 'Valider').click({ force: true });

    // ✅ Message de succès
    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'filtre de données appliqué.');
  });


  //
  // ✅ Cas 8 — Nom, champ et période valides
  //
  it('should apply the filter when name, field and valid date range are all correct', () => {
    cy.get('input[formControlName="name"]').type('FullValidFilter');
    cy.get('input[placeholder="Ajouter un champ"]').type('SURVEY_DATE', { delay: 50 });
    cy.get('.cdk-overlay-container mat-option', { timeout: 8000 })
      .should('contain.text', 'SURVEY_DATE')
      .first()
      .click({ force: true });

    cy.get('input[formControlName="startDate"]').type('2024-09-01', { force: true });
    cy.get('input[formControlName="endDate"]').type('2024-09-15', { force: true });

    // ✅ Le bouton doit être activé
    cy.contains('button', 'Valider').should('not.be.disabled');

    // 🖱️ Cliquer sur Valider
    cy.contains('button', 'Valider').click({ force: true });

    // ✅ Message de succès
    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'filtre de données appliqué.');
  });

});
