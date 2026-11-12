/** Edge function that reads existing tables and returns the export. No report table. */
export function exportFunctionUrl(supabaseUrl: string): string {
  return `${supabaseUrl.replace(/\/+$/, "")}/functions/v1/ml_functions/read-database/exportDataset`;
}

/** Local/dev escape hatch: query DATABASE_URL in the Next process instead of the edge function. */
export function isDirectExportEnabled(): boolean {
  return process.env.DATA_EXPORT_DIRECT === "true";
}
