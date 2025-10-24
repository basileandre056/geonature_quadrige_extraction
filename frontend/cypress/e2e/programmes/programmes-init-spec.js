describe('Programmes module - initialisation de la liste de programmes', () => {

  //
  // 🧩 Cas 1 — Réponse OK avec des programmes
  //
  it('should initialize programmes correctly when backend returns valid data', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', {
      statusCode: 200,
      body: {
        status: 'ok',
        monitoringLocation: '126-001',
        programmes: [
          {
            name: 'DECHETS_FLOTTANTS_MICROPLASTIQUE_REUNION',
            libelle: 'Programme de surveillance Microplastiques Flottants à la Réunion',
            startDate: '2022-01-07',
            etat: 'Actif',
            responsable: 'DUVAL Magali, MAUREL Laurence, TURQUET Jean'
          },
          {
            name: 'DECHETS_FLOTTANTS_REUNION',
            libelle: 'Programme de surveillance Macrodéchets Flottants à la Réunion',
            startDate: '2023-09-19',
            etat: 'Actif',
            responsable: 'DUVAL Magali, MAUREL Laurence'
          }
        ],
        fichiers_csv: [
          { file_name: 'programmes_reunion.csv', url: '/files/programmes_reunion.csv' }
        ]
      }
    }).as('getLastProgrammes');

    // 🖥️ Charger la page
    cy.visit('/programmes');
    cy.wait('@getLastProgrammes');

    // ✅ Vérifier le message de succès
    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', '✅ 2 programmes chargés (126-001)');

    // ✅ Vérifier la table Angular Material
    cy.get('table tr.mat-mdc-row').should('have.length', 2);

    // ✅ Vérifier que les deux programmes apparaissent bien
    cy.contains('td', 'DECHETS_FLOTTANTS_MICROPLASTIQUE_REUNION').should('be.visible');
    cy.contains('td', 'DECHETS_FLOTTANTS_REUNION').should('be.visible');

    // ✅ Vérifier les libellés correspondants
    cy.contains('td', 'Programme de surveillance Microplastiques Flottants à la Réunion').should('be.visible');
    cy.contains('td', 'Programme de surveillance Macrodéchets Flottants à la Réunion').should('be.visible');

    // ✅ Vérifier que le responsable est affiché
    cy.contains('td', 'DUVAL Magali').should('be.visible');
  });


  //
  // 🧩 Cas 2 — Réponse OK mais sans programmes
  //
  it('should show "Aucun programme sauvegardé." when backend returns empty list', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', {
      statusCode: 200,
      body: {
        status: 'ok',
        monitoringLocation: '126-001',
        programmes: [],
        fichiers_csv: []
      }
    }).as('getEmptyProgrammes');

    cy.visit('/programmes');
    cy.wait('@getEmptyProgrammes');

    // ✅ Vérifier le message affiché
    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Aucun programme sauvegardé.');
  });


  //
  // 🧩 Cas 3 — Erreur du backend (500)
  //
  it('should show an error message when backend returns an error', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', {
      statusCode: 500,
      body: { message: 'Erreur interne serveur' }
    }).as('getError');

    cy.visit('/programmes');
    cy.wait('@getError');

    // ✅ Vérifier le message d’erreur affiché
    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Erreur lors du chargement des derniers programmes.');
  });

});
