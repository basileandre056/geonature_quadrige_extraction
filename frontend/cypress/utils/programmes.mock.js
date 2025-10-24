// frontend/cypress/utils/programmes.mock.js

export class ProgrammesMock {
  constructor() {
    // 🧩 État simulé du composant
    this.monitoringLocation = '';
    this.monitoringLabel = '';
    this.programmes = [];
    this.allSelected = false;
    this.showDataFilter = false;
    this.showProgramFilter = false;
    this.message = '';
    this.dataFilter = null;
    this.programFilter = null;
    this.searchText = '';

    // ✅ Lieux disponibles
    this.locationLabels = [
      { code: '126-', label: 'Réunion' },
      { code: '145-', label: 'Mayotte' },
      { code: '048-', label: 'Maurice' },
      { code: '153-', label: 'Île Tromelin' },
    ];
  }

  // 🔹 Met à jour le libellé du lieu
  updateMonitoringLabel() {
    const found = this.locationLabels.find(l =>
      this.monitoringLocation.startsWith(l.code)
    );
    this.monitoringLabel = found ? found.label : '';
  }

  // 🔹 Transforme les objets bruts en liens exploitables
  mapToExtractedLinks(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(item => {
        const file_name =
          item?.file_name ??
          item?.programme ??
          item?.name ??
          'fichier';
        const url = item?.url ?? '';
        return { file_name, url };
      })
      .filter(f => !!f.url);
  }

  // 🔹 Filtrage selon le texte saisi
  get filteredProgrammes() {
    if (!this.searchText) return this.programmes;
    return this.programmes.filter(p =>
      p.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // 🔹 Détection d’une recherche active
  isSearchActive() {
    return this.searchText?.trim().length > 0;
  }

  // 🔹 Sélection / déselection de tous les programmes
  toggleAll() {
    this.programmes.forEach(p => (p.checked = this.allSelected));
  }

  // 🔹 Ouverture du filtre de données
  openDataFilter() {
    this.showProgramFilter = false;
    this.showDataFilter = true;
  }

  // 🔹 Ouverture du filtre de programmes
  openProgramFilter() {
    this.showDataFilter = false;
    this.showProgramFilter = true;
  }

  // 🔹 Application du filtre de données
  onDataFilterApplied(filterData) {
    this.message = 'filtre de données appliqué.';
    this.showDataFilter = false;
    const { monitoringLocation, ...rest } = filterData;
    this.dataFilter = rest;
  }

  // 🔹 Application du filtre de programmes
  onProgramFilterApplied(filterData) {
    this.message = 'filtre de programmes appliqué.';
    this.showProgramFilter = false;
    this.programFilter = filterData;
  }
}
