describe('Programmes module - extraction des données', () => {

  const samplePrograms = [
    { name: 'DECHETS_FLOTTANTS_MICROPLASTIQUE_REUNION', checked: true },
    { name: 'DECHETS_FLOTTANTS_REUNION', checked: true },
    { name: 'DECHETS_PLAGES_REUNION', checked: true },
    { name: 'EFFET-RESERVE_LAREUNION_BELT_POISSON', checked: false },
    { name: 'GCRMN_EPARSES_BELT_POISSONS', checked: false },
    { name: 'DECHETS_FOND_PLONGEE_REUNION', checked: false }
  ];

  const noneSelectedPrograms = [
    { name: 'DECHETS_FLOTTANTS_MICROPLASTIQUE_REUNION', checked: false },
    { name: 'DECHETS_FLOTTANTS_REUNION', checked: false },
    { name: 'DECHETS_PLAGES_REUNION', checked: false },
    { name: 'EFFET-RESERVE_LAREUNION_BELT_POISSON', checked: false },
    { name: 'GCRMN_EPARSES_BELT_POISSONS', checked: false },
    { name: 'DECHETS_FOND_PLONGEE_REUNION', checked: false }
  ];

  //
  // 🧩 Cas 1 — Pas de filtre défini, que des programmes soient selectionnés ou non.
  // Pas de programmes selectionnés :

    it('should show an error message if extractData() is called without a dataFilter with or without selected programs', () => {
  cy.intercept('GET', 'http://localhost:5000/last-programmes', {
    statusCode: 200,
    body: {} // 👈 évite le message "Aucun programme sauvegardé."
  });

  cy.visit('/programmes');
  cy.get('app-programmes', { timeout: 10000 }).should('exist');

  cy.window().then((win) => {
    const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
    app.dataFilter = null;
    app.programmes = [...samplePrograms];    app.extractData();
    win.ng.applyChanges(app);
  });

  cy.get('p.text-center.text-muted', { timeout: 8000 })
    .should('not.contain.text', 'Aucun programme sauvegardé')
    .and('contain.text', 'Veuillez définir un filtre avant de lancer une extraction.');
});


  //
  // 🧩 Cas 2 — Aucun programme sélectionné
  //
  it('should show an error message if no programme is selected', () => {
  cy.intercept('GET', 'http://localhost:5000/last-programmes', {
    statusCode: 200,
    body: {} // 👈 idem ici
  });

  cy.visit('/programmes');
  cy.get('app-programmes', { timeout: 10000 }).should('exist');

  cy.window().then((win) => {
    const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
    app.dataFilter = { name: 'FilterWithoutPrograms' };
    app.programmes = [...noneSelectedPrograms];
    app.extractData();
    win.ng.applyChanges(app);
  });

  cy.get('p.text-center.text-muted', { timeout: 8000 })
    .should('not.contain.text', 'Aucun programme sauvegardé')
    .and('contain.text', 'Veuillez sélectionner au moins un programme.');
});

  //
  // 🧩 Cas 3 — Réponse backend OK
  //
  it('should handle successful data extraction', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', {
      statusCode: 200,
      body: { status: 'ok', programmes: [] }
    });
    cy.visit('/programmes');
    cy.get('app-programmes', { timeout: 10000 }).should('exist');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.dataFilter = { name: 'FilterOk' };
      app.programmes = [...samplePrograms];
    });

    cy.intercept('POST', 'http://localhost:5000/data-extractions', {
      statusCode: 200,
      body: {
        status: 'ok',
        fichiers_zip: [
          { file_name: 'extraction_donnees.zip', url: '/files/extraction_donnees.zip' },
          { file_name: 'rapport_donnees.zip', url: '/files/rapport_donnees.zip' }
        ]
      }
    }).as('postDataOk');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.extractData();
    });

    cy.wait('@postDataOk');

    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Fichiers extraits (2)');
  });


  //
  // 🧩 Cas 4 — Réponse backend KO
  //
  it('should handle backend non-ok response', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', {
      statusCode: 200,
      body: { status: 'ok', programmes: [] }
    });
    cy.visit('/programmes');
    cy.get('app-programmes', { timeout: 10000 }).should('exist');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.dataFilter = { name: 'FilterKo' };
      app.programmes = [...samplePrograms];
    });

    cy.intercept('POST', 'http://localhost:5000/data-extractions', {
      statusCode: 200,
      body: {
        status: 'ko',
        message: 'Aucune donnée trouvée pour ce filtre.'
      }
    }).as('postDataKo');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.extractData();
    });

    cy.wait('@postDataKo');

    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Aucune donnée trouvée pour ce filtre.');
  });


  //
  // 🧩 Cas 5 — Erreur HTTP 500
  //
  it('should display proper error message on HTTP 500', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', {
      statusCode: 200,
      body: { status: 'ok', programmes: [] }
    });
    cy.visit('/programmes');
    cy.get('app-programmes', { timeout: 10000 }).should('exist');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.dataFilter = { name: 'Erreur500' };
      app.programmes = [...samplePrograms];
    });

    cy.intercept('POST', 'http://localhost:5000/data-extractions', {
      statusCode: 500,
      body: { message: 'Erreur interne serveur' }
    }).as('postDataError');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.extractData();
    });

    cy.wait('@postDataError');

    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Erreur interne serveur');
  });

});
