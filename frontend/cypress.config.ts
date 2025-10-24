import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // 🌐 URL de base pour ton frontend Angular
    baseUrl: "http://localhost:4200",

    // 📁 Où trouver les fichiers de test (specs)
    specPattern: "cypress/e2e/**/*-spec.{js,jsx,ts,tsx}",

    // 🧠 Timeout plus long pour Angular (chargement initial)
    defaultCommandTimeout: 10000,

    // ⚙️ Configuration des événements Node (optionnel)
    setupNodeEvents(on, config) {
      // Tu peux brancher ici des hooks (ex: avant chaque run, logs, etc.)
      return config;
    },
  },
});
