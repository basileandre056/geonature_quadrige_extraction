// frontend/cypress/e2e/programmes/programmes-basic-spec.js

describe('Programmes module - extraction data behavior without filter', () => {

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
    cy.contains('button', 'Extraire les données').should('be.visible');
    cy.contains('button', 'Filtre extraction données').should('be.visible');
  });

  //
  // Cas sans filtre défini → affiche le message d’erreur
  //
  it('should show an error message if extractDatas() is called without a filter', () => {
    // 🖱️ Clique sur le bouton
    cy.contains('button', 'Extraire les données').click();

    // 🧾 Vérifie que le message d’erreur apparaît
    cy.get('p.text-center.text-muted')
      .should('be.visible')
      .and('contain.text', 'Veuillez définir un filtre avant de lancer une extraction.');
  });

});


describe('Programmes module - program filter validation only with required fields', () => {

  beforeEach(() => {
    cy.visit('/programmes');
  });


  it('should not let apply the filter when field title is invalid', () => {
    // 🖱️ Ouvrir le filtre de programmes
    cy.contains('button', 'Filtre programmes').click();

    // Vérifier que le composant de filtre est affiché
    cy.get('app-program-extraction-filter').should('be.visible');

    // 📝 Nom du filtre - Saisir un nom trop court (< 3 caractères)
    cy.get('input[formControlName="name"]').type('Te'); // Moins de 3 caractères

    // 📝 Localisation - Saisir une localisation valide
    cy.get('input[formControlName="monitoringLocation"]').type('048-', { delay: 50 });

    // 🕒 Attendre que la liste d'options d'autocomplétion apparaisse
    cy.get('.cdk-overlay-container mat-option', { timeout: 8000 })
      .should('exist')
      .and('contain.text', 'Maurice')
      .first()
      .scrollIntoView()
      .click({ force: true });

    // ❌ Le bouton "Valider" ne doit pas être cliquable si le nom est invalide
    cy.contains('button', 'Valider').should('be.disabled');

    // 🖱️ Essayer de valider le filtre (ce test ne devrait pas être appliqué)
    cy.contains('button', 'Valider').click({ force: true });

    // ✅ Vérifier que le filtre n'a pas été appliqué :
    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('be.visible')
      .and('not.contain.text', 'filtre de programmes appliqué.');

    // 🎯 Vérifier que le message d’erreur du champ "name" est affiché
    cy.get('mat-error')
      .should('be.visible')
      .and('contain.text', 'Le nom du filtre doit faire au moins 3 caractères');

  });


   it('should not let apply the filter when monitoringLocation is missing', () => {
      // 🖱️ Ouvrir le filtre de programmes
      cy.contains('button', 'Filtre programmes').click();

      // Vérifier que le composant de filtre est affiché
      cy.get('app-program-extraction-filter').should('be.visible');

      // ✅ Nom du filtre valide
      cy.get('input[formControlName="name"]').type('TestFilter');

      // ✅ Localisation : ne pas saisir de localisation (la laisser vide)
      cy.get('input[formControlName="monitoringLocation"]').clear();

      // 🖱️ Essayer de valider avec localisation manquante
      cy.contains('button', 'Valider').click({ force: true });

      // ❌ Le bouton "Valider" ne doit pas être cliquable si la localisation est manquante
      cy.contains('button', 'Valider').should('be.disabled');

      // 🎯 Vérifier qu’aucun message de succès n’apparaît
      cy.get('p.text-center.text-muted', { timeout: 8000 })
        .should('be.visible')
        .and('not.contain.text', 'filtre de programmes appliqué.');

      // 🎯 Vérifier le message d’erreur pour la localisation manquante
      cy.get('mat-error')
        .should('be.visible')
        .and('contain.text', 'Sélectionnez un lieu dans la liste.');
    });



  it('should apply the filter when both fields are valid', () => {
  cy.contains('button', 'Filtre programmes').click();

  cy.get('app-program-extraction-filter').should('be.visible');

  // ✅ Nom du filtre
  cy.get('input[formControlName="name"]').type('TestFilter');

  // ✅ Localisation : saisie et ouverture de la liste
  cy.get('input[formControlName="monitoringLocation"]').type('048-', { delay: 50 });

  // 🕒 Attendre que la liste d’options apparaisse dans le container Material
  cy.get('.cdk-overlay-container mat-option', { timeout: 8000 })
    .should('exist')
    .and('contain.text', 'Maurice')
    .first()
    .scrollIntoView()
    .click({ force: true });

  // 🖱️ Valider le filtre
  cy.contains('button', 'Valider').click({ force: true });

  // ✅ Vérifier le message de succès
  cy.get('p.text-center.text-muted', { timeout: 8000 })
    .should('be.visible')
    .and('contain.text', 'filtre de programmes appliqué.');
});

}
);

describe('Data extraction filter - validation and application', () => {
  beforeEach(() => {
    cy.visit('/programmes');
  });

  it('should apply a valid data extraction filter', () => {
    // 🖱️ Ouvrir le filtre d’extraction de données
    cy.contains('button', 'Filtre extraction données').click();

    // 🧩 Le composant doit être visible
    cy.get('app-frontend-filter').should('be.visible');

    // ✅ Saisir un nom valide
    cy.get('input[formControlName="name"]').type('FilterDataTest');

    // ✅ Ajouter un champ d’extraction via l’autocomplete (Angular Material)
    cy.get('input[placeholder="Ajouter un champ"]').type('SURVEY_DATE', { delay: 50 });

    // Le panneau d'autocomplete Angular Material s'affiche dans .cdk-overlay-container
    cy.get('.cdk-overlay-container mat-option', { timeout: 8000 })
      .should('contain.text', 'SURVEY_DATE')
      .first()
      .scrollIntoView()
      .click({ force: true });

    // 🖱️ Cliquer sur "Valider"
    cy.contains('button', 'Valider').click({ force: true });

    // ✅ Vérifier que le message s’affiche dans la page principale
    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'filtre de données appliqué.');
  });
});


