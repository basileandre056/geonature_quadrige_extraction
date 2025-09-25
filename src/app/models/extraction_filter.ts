export interface ExtractionFilter {
  name:string,
  fields: string[],
  periods: { startDate: string, endDate: string }[],
  mainFilter: {
    program: { ids: string[] },
    monitoringLocation: { text: string }
  }
}
