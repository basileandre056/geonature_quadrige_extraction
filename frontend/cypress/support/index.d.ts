/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    // --- Filtres de données ---
    setFilterName(name: string): Chainable<void>;
    addField(fieldName: string): Chainable<void>;
    setDateRange(start: string, end: string): Chainable<void>;
    submitFilter(): Chainable<void>;
    checkMainMessage(expectedText: string): Chainable<void>;

    // --- Filtres de programmes ---
    setProgramName(name: string): Chainable<void>;
    setProgramLocation(code: string, label: string): Chainable<void>;
  }
}
