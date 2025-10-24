describe('Programmes module - relancer le filtrage seul', () => {


//| Cas | Description                           | Attendu                                                         |
//| --- | ------------------------------------- | --------------------------------------------------------------- |
//| 1️⃣ | Réponse OK du backend avec programmes | ✅ Message “Filtrage relancé (N programmes)” + table mise à jour |
//| 2️⃣ | Réponse OK sans tableau `programmes`  | ⚠️ Message “Aucun programme trouvé”                             |
//| 3️⃣ | Réponse KO (`status: 'ko'`)           | ⚠️ Message “Erreur backend” ou message du serveur               |
//| 4️⃣ | Erreur HTTP 500                       | ❌ Message “Erreur lors du filtrage seul.”                       |


  //
  // 🧩 Cas 1 — Réponse OK avec programmes
  //
  it('should correctly handle a successful relancerFiltrageSeul() call', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', { statusCode: 200, body: { status: 'ok', programmes: [] } });
    cy.visit('/programmes');

    // ✅ Attendre que le composant soit monté
    cy.get('app-programmes', { timeout: 10000 }).should('exist');

    cy.window().then((win) => {
      const element = win.document.querySelector('app-programmes');
      const app = win.ng.getComponent(element);
      app.programFilter = { monitoringLocation: '126-001', name: 'TestFilter' };
    });

    cy.intercept('POST', 'http://localhost:5000/filtrage_seul', {
      statusCode: 200,
      body: {
        status: 'ok',
        fichiers_csv: [
          { file_name: 'filtrage_result.csv', url: '/files/filtrage_result.csv' }
        ],
        programmes: [
          {
            name: 'DECHETS_FOND_PLONGEE_REUNION',
            libelle: 'Programme de surveillance des macrodéchets sur les récifs coralliens à la Réunion',
            startDate: '2022-01-07',
            etat: 'Actif',
            responsable: 'DUVAL Magali, MAUREL Laurence'
          },
          {
            name: 'DECHETS_FLOTTANTS_REUNION',
            libelle: 'Programme de surveillance Macrodéchets Flottants à la Réunion',
            startDate: '2023-09-19',
            etat: 'Actif',
            responsable: 'DUVAL Magali, MAUREL Laurence'
          }
        ]
      }
    }).as('postFiltrageOk');

    // 🖱️ Déclenche manuellement la fonction depuis le composant Angular
    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.relancerFiltrageSeul();
    });

    cy.wait('@postFiltrageOk');

    // ✅ Message de succès attendu
    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', '✅ Filtrage relancé (2 programmes)');

    // ✅ Vérifie que le programme est affiché dans le tableau
    cy.contains('td', 'DECHETS_FLOTTANTS_REUNION').should('be.visible');
  });


  //
  // 🧩 Cas 2 — Réponse OK sans tableau programmes
  //
  it('should handle case where response has no programmes array', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', { statusCode: 200, body: { status: 'ok', programmes: [] } });
    cy.visit('/programmes');

    cy.get('app-programmes', { timeout: 10000 }).should('exist');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.programFilter = { monitoringLocation: '126-001' };
    });

    cy.intercept('POST', 'http://localhost:5000/filtrage_seul', {
      statusCode: 200,
      body: {
        status: 'ok',
        fichiers_csv: [],
        message: 'Aucun programme trouvé'
      }
    }).as('postFiltrageEmpty');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.relancerFiltrageSeul();
    });

    cy.wait('@postFiltrageEmpty');

    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Aucun programme trouvé');
  });


  //
  // 🧩 Cas 3 — Réponse KO (status: "ko")
  //
  it('should handle backend response with non-ok status', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', { statusCode: 200, body: { status: 'ok', programmes: [] } });
    cy.visit('/programmes');

    cy.get('app-programmes', { timeout: 10000 }).should('exist');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.programFilter = { monitoringLocation: '126-001' };
    });

    cy.intercept('POST', 'http://localhost:5000/filtrage_seul', {
      statusCode: 200,
      body: { status: 'ko', message: 'Erreur backend simulée' }
    }).as('postFiltrageKo');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.relancerFiltrageSeul();
    });

    cy.wait('@postFiltrageKo');

    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Erreur backend simulée');
  });


  //
  // 🧩 Cas 4 — Erreur HTTP 500
  //
  it('should show error message on HTTP failure', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', { statusCode: 200, body: { status: 'ok', programmes: [] } });
    cy.visit('/programmes');

    cy.get('app-programmes', { timeout: 10000 }).should('exist');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.programFilter = { monitoringLocation: '126-001', name: 'ErreurTest' };
    });

    cy.intercept('POST', 'http://localhost:5000/filtrage_seul', {
      statusCode: 500,
      body: { message: 'Erreur interne serveur' }
    }).as('postFiltrageError');

    cy.window().then((win) => {
      const app = win.ng.getComponent(win.document.querySelector('app-programmes'));
      app.relancerFiltrageSeul();
    });

    cy.wait('@postFiltrageError');

    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Erreur lors du filtrage seul.');
  });

});
