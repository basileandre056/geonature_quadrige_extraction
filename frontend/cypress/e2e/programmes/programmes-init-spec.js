describe('Programmes module - initialisation de la liste de programmes', () => {

  //
  // 🧩 Cas 1 — Réponse OK avec des programmes
  //
  it('should initialize programmes correctly when backend returns valid data', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', {
      statusCode: 200,
      body: {
        status: 'ok',
        monitoringLocation: '048-001',
        programmes: [
          { name: 'Reef Monitoring', libelle: 'Surveillance récifale', startDate: '2023-05-01', etat: 'Terminé', responsable: 'Dr. Blue' },
          { name: 'CoralWatch', libelle: 'Observation corallienne', startDate: '2024-01-15', etat: 'En cours', responsable: 'Pr. Marine' }
        ],
        fichiers_csv: [
          { file_name: 'programmes.csv', url: '/files/programmes.csv' }
        ]
      }
    }).as('getLastProgrammes');

    cy.visit('/programmes');
    cy.wait('@getLastProgrammes');

    // ✅ Vérifie que le message est correct
    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', '✅ 2 programmes chargés (048-001)');

    // ✅ Vérifie que la table contient bien 2 lignes
    cy.get('table tr.mat-mdc-row').should('have.length', 2);

    // ✅ Vérifie la présence du premier programme
    cy.contains('td', 'Reef Monitoring').should('be.visible');
  });


  //
  // 🧩 Cas 2 — Réponse OK mais sans programmes
  //
  it('should show "Aucun programme sauvegardé." when backend returns empty list', () => {
    cy.intercept('GET', 'http://localhost:5000/last-programmes', {
      statusCode: 200,
      body: {
        status: 'ok',
        monitoringLocation: '145-001',
        programmes: [],
        fichiers_csv: []
      }
    }).as('getEmptyProgrammes');

    cy.visit('/programmes');
    cy.wait('@getEmptyProgrammes');

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

    cy.get('p.text-center.text-muted', { timeout: 8000 })
      .should('contain.text', 'Erreur lors du chargement des derniers programmes.');
  });

});
