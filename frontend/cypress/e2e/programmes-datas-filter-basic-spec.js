describe('Programmes module - extraction data behavior without filter', () => {
  beforeEach(() => cy.visit('/programmes'));

  it('should display the main title and action buttons', () => {
    cy.contains('h2', 'Programmes à extraire').should('be.visible');
    cy.contains('button', 'Extraire les données').should('be.visible');
    cy.contains('button', 'Filtre extraction données').should('be.visible');
  });

  it('should show an error message if extractData() is called without a filter', () => {
    cy.contains('button', 'Extraire les données').click();
    cy.checkMainMessage('Veuillez définir un filtre avant de lancer une extraction.');
  });
});


describe('Programmes module - data filter form validation & application', () => {
  beforeEach(() => {
    cy.visit('/programmes');
    cy.contains('button', 'Filtre extraction données').click();
    cy.get('app-frontend-filter').should('be.visible');
  });

  //
  // 🧩 Cas 1 — Nom trop court (<3 caractères)
  //
  it('should not allow applying the filter when name is invalid', () => {
    cy.setFilterName('Te');
    cy.addField('SURVEY_DATE');
    cy.contains('button', 'Valider').should('be.disabled');
    cy.get('mat-error').should('contain.text', 'au moins 3 caractères');
  });

  //
  // 🧩 Cas 2  — Nom vide
  //
   it('should not allow applying the filter when name is empty', () => {
    cy.get('input[formControlName="name"]').focus().blur(); // 👈 Déclenche la validation "touched"
    cy.addField('SURVEY_DATE');
    cy.contains('button', 'Valider').should('be.disabled');
    cy.get('mat-error').should('contain.text', 'Le nom du filtre est requis.');
  });

  //
  // 🧩 Cas 3 — Nom valide mais aucun champ sélectionné
  //
  it('should not allow applying the filter when no field is selected', () => {
    cy.setFilterName('ValidName');
    cy.contains('button', 'Valider').should('be.disabled');
    cy.get('mat-error').should('contain.text', 'au moins un champ');
  });


  //
  // 🧩 Cas 4 — Dates invalides (date de fin < date de début)
  //
  it('should not allow applying the filter when date range is invalid', () => {
    cy.setFilterName('InvalidRange');
    cy.addField('SURVEY_DATE');
    cy.setDateRange('2024-10-10', '2024-09-10');
    cy.contains('button', 'Valider').should('be.disabled');
    cy.get('mat-error').should('contain.text', 'période valide');
  });


  //
  // 🧩 Cas 5 — Une seule date (incomplète)
  //
  it('should not allow applying the filter when only one date is provided', () => {
    cy.setFilterName('HalfDate');
    cy.addField('SURVEY_DATE');
    cy.get('input[formControlName="startDate"]').type('2024-09-01', { force: true });
    cy.contains('button', 'Valider').should('be.disabled');
    cy.get('mat-error').should('contain.text', 'période valide');
  });


  //
  // ✅ Cas 6 — Nom et champ valides, sans période (valide)
  //
  it('should apply the filter when name and at least one field are valid without dates', () => {
    cy.setFilterName('MinimalValidFilter');
    cy.addField('SURVEY_DATE');
    cy.submitFilter();
    cy.checkMainMessage('filtre de données appliqué.');
  });


  //
  // ✅ Cas 7 — Nom, champ et période valides
  //
  it('should apply the filter when name, field and valid date range are all correct', () => {
    cy.setFilterName('FullValidFilter');
    cy.addField('SURVEY_DATE');
    cy.setDateRange('2024-09-01', '2024-09-15');
    cy.submitFilter();
    cy.checkMainMessage('filtre de données appliqué.');
  });
});

