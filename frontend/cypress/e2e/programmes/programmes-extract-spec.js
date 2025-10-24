describe('Programmes module - extraction des programmes', () => {


//| Cas | Description                          | Attendu                                   |
//| --- | ------------------------------------ | ----------------------------------------- |
//| 1️⃣ | Pas de filtre défini                 | Message d’erreur affiché                  |
//| 2️⃣ | Réponse backend OK                   | Programmes mis à jour + message de succès |
//| 3️⃣ | Réponse backend avec `status !== ok` | Message d’erreur du serveur               |
//| 4️⃣ | Erreur HTTP 500                      | Message d’erreur technique affiché        |


  //
  // 🧩 Cas 1 — Pas de filtre défini
  //
  it('should show an error message if extractPrograms() is called without a filter', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', { statusCode: 200, body: { status: 'ok', programmes: [] } });

    cy.visit('/programmes');

    // 🖱️ Cliquer sur "Extraire les programmes"
    cy.contains('button', 'Extraire les programmes').click();

    // ✅ Vérifier le message d’erreur
    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Veuillez définir un filtre d’extraction de programmes.');
  });


  //
  // 🧩 Cas 2 — Réponse OK du backend
  //
  it('should correctly handle a successful extraction', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', { statusCode: 200, body: { status: 'ok', programmes: [] } });
    cy.visit('/programmes');

    // ✅ Simule un filtre déjà défini
    cy.get('app-programmes', { timeout: 10000 }).should('exist'); // attendre que le composant soit monté

    cy.window().then((win) => {
      const element = win.document.querySelector('app-programmes');
      expect(element).to.exist; // vérifie bien qu’il est là
      const app = win.ng.getComponent(element);
      app.programFilter = { monitoringLocation: '126-001', name: 'TestFilter' };
    });


    cy.intercept('POST', 'http://localhost:5000/program-extraction', {
      statusCode: 200,
      body: {
        status: 'ok',
        fichiers_csv: [
          { file_name: 'extraction_programmes.csv', url: '/files/extraction_programmes.csv' }
        ],
        programmes: [
          {
            name: 'DECHETS_FLOTTANTS_REUNION',
            libelle: 'Programme de surveillance Macrodéchets Flottants à la Réunion',
            startDate: '2023-09-19',
            etat: 'Actif',
            responsable: 'DUVAL Magali, MAUREL Laurence'
          }
        ]
      }
    }).as('postExtract');

    // 🖱️ Cliquer sur "Extraire les programmes"
    cy.contains('button', 'Extraire les programmes').click();
    cy.wait('@postExtract');

    // ✅ Vérifier le message de succès
    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', '✅ Extraction terminée (1 programmes, 1 fichiers CSV)');

    // ✅ Vérifier que le programme apparaît dans le tableau
    cy.contains('td', 'DECHETS_FLOTTANTS_REUNION').should('be.visible');
  });


  //
  // 🧩 Cas 3 — Réponse backend avec status !== ok
  //
  it('should handle backend response with non-ok status', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', { statusCode: 200, body: { status: 'ok', programmes: [] } });
    cy.visit('/programmes');

     cy.get('app-programmes', { timeout: 10000 }).should('exist'); // attendre que le composant soit monté

    cy.window().then((win) => {
      const element = win.document.querySelector('app-programmes');
      expect(element).to.exist; // vérifie bien qu’il est là
      const app = win.ng.getComponent(element);
      app.programFilter = { monitoringLocation: '126-001', name: 'TestFilter' };
    });

    cy.intercept('POST', 'http://localhost:5000/program-extraction', {
      statusCode: 200,
      body: { status: 'ko', message: 'Aucun programme trouvé pour ce filtre.' }
    }).as('postExtractKo');

    cy.contains('button', 'Extraire les programmes').click();
    cy.wait('@postExtractKo');

    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Aucun programme trouvé pour ce filtre.');
  });


  //
  // 🧩 Cas 4 — Erreur HTTP 500
  //
  it('should display a proper error message when backend fails', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', { statusCode: 200, body: { status: 'ok', programmes: [] } });
    cy.visit('/programmes');

    cy.get('app-programmes', { timeout: 10000 }).should('exist'); // attendre que le composant soit monté

    cy.window().then((win) => {
      const element = win.document.querySelector('app-programmes');
      expect(element).to.exist; // vérifie bien qu’il est là
      const app = win.ng.getComponent(element);
      app.programFilter = { monitoringLocation: '126-001', name: 'TestFilter' };
    });

    cy.intercept('POST', 'http://localhost:5000/program-extraction', {
      statusCode: 500,
      body: { message: 'Erreur interne serveur' }
    }).as('postExtractError');

    cy.contains('button', 'Extraire les programmes').click();
    cy.wait('@postExtractError');

    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Erreur interne serveur');
  });

});
