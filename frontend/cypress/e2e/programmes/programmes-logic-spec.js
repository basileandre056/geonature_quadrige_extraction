// frontend/cypress/e2e/programmes/programmes-logic-spec.js

import { ProgrammesMock } from '../../utils/programmes.mock';


//| Méthode                                              | Vérification principale                         |
//| ---------------------------------------------------- | ----------------------------------------------- |
//| `updateMonitoringLabel()`                            | Associe correctement le code au label           |
//| `mapToExtractedLinks()`                              | Filtre et formate les liens                     |
//| `filteredProgrammes`                                 | Retourne les bons résultats de recherche        |
//| `isSearchActive()`                                   | Détecte une recherche non vide                  |
//| `toggleAll()`                                        | Sélectionne / désélectionne tous les programmes |
//| `openDataFilter()` / `openProgramFilter()`           | Bascule correctement les fenêtres               |
//| `onDataFilterApplied()` / `onProgramFilterApplied()` | Met à jour message + états internes             |


describe('🧠 Programmes logic (pure, without Angular)', () => {

  it('should update monitoringLabel correctly', () => {
    const comp = new ProgrammesMock();
    comp.monitoringLocation = '126-XYZ';
    comp.updateMonitoringLabel();
    expect(comp.monitoringLabel).to.equal('Réunion');

    comp.monitoringLocation = '999-UNKNOWN';
    comp.updateMonitoringLabel();
    expect(comp.monitoringLabel).to.equal('');
  });

  it('should map raw items into ExtractedLink array', () => {
    const comp = new ProgrammesMock();
    const raw = [
      { file_name: 'data1.csv', url: '/files/data1.csv' },
      { programme: 'progA', url: '/files/a.csv' },
      { name: 'fallback', url: '/files/b.csv' },
      { name: 'no-url' },
    ];
    const links = comp.mapToExtractedLinks(raw);

    expect(links).to.have.length(3);
    expect(links[0]).to.deep.equal({ file_name: 'data1.csv', url: '/files/data1.csv' });
    expect(links[2].file_name).to.equal('fallback');
  });

  it('should filter programmes by name', () => {
    const comp = new ProgrammesMock();
    comp.programmes = [
      { name: 'DECHETS_PLAGES_EPARSES' },
      { name: 'EI_EPARSES_BLANCHISSEMENT_PCS_BENTHOS' },
      { name: 'GCRMN_EPARSES_BELT_POISSONS' },
    ];
    comp.searchText = 'belt';
    const filtered = comp.filteredProgrammes;

    expect(filtered).to.have.length(1);
    expect(filtered[0].name).to.equal('GCRMN_EPARSES_BELT_POISSONS');
  });

  it('should detect active search', () => {
    const comp = new ProgrammesMock();
    comp.searchText = ' KELONIA ';
    expect(comp.isSearchActive()).to.be.true;

    comp.searchText = '   ';
    expect(comp.isSearchActive()).to.be.false;
  });

  it('should toggle all programme selections', () => {
    const comp = new ProgrammesMock();
    comp.programmes = [
      { name: 'DECHETS_PLAGES_REUNION', checked: false },
      { name: 'EFFET-RESERVE_LAREUNION_BELT_POISSON', checked: false },
    ];
    comp.allSelected = true;
    comp.toggleAll();
    expect(comp.programmes.every(p => p.checked)).to.be.true;

    comp.allSelected = false;
    comp.toggleAll();
    expect(comp.programmes.every(p => !p.checked)).to.be.true;
  });

  it('should open data filter and close program filter', () => {
    const comp = new ProgrammesMock();
    comp.showDataFilter = false;
    comp.showProgramFilter = true;
    comp.openDataFilter();

    expect(comp.showDataFilter).to.be.true;
    expect(comp.showProgramFilter).to.be.false;
  });

  it('should open program filter and close data filter', () => {
    const comp = new ProgrammesMock();
    comp.showDataFilter = true;
    comp.showProgramFilter = false;
    comp.openProgramFilter();

    expect(comp.showProgramFilter).to.be.true;
    expect(comp.showDataFilter).to.be.false;
  });

  it('should apply data filter correctly', () => {
    const comp = new ProgrammesMock();
    const input = { monitoringLocation: '126-', field: 'SURVEY_DATE' };

    comp.onDataFilterApplied(input);

    expect(comp.message).to.equal('filtre de données appliqué.');
    expect(comp.showDataFilter).to.be.false;
    expect(comp.dataFilter).to.deep.equal({ field: 'SURVEY_DATE' });
  });

  it('should apply program filter correctly', () => {
    const comp = new ProgrammesMock();
    const input = { name: 'FilterA', monitoringLocation: '048-' };

    comp.onProgramFilterApplied(input);

    expect(comp.message).to.equal('filtre de programmes appliqué.');
    expect(comp.showProgramFilter).to.be.false;
    expect(comp.programFilter).to.deep.equal(input);
  });
});
