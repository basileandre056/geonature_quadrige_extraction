import { ExtractedLink } from './extractedLinks';

export interface ProgramExtractionResponse {
  status: string; // "ok" ou "warning"
  filtre_recu: any; // objet libre (nom du filtre appliqué, monitoringLocation, etc.)
  fichiers_csv: ExtractedLink[]; // liste de CSV disponibles
  message?: string; // message optionnel du backend
}
