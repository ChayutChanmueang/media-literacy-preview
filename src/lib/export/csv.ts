/**
 * CSV for the staff data export (docs/software/12 §10): UTF-8 with BOM (Excel shows Thai), CRLF,
 * RFC 4180 quoting, empty cell for null, JSON for objects, and a guard against spreadsheet formulas.
 */

export type CsvRow = Record<string, unknown>;

const NUMBER_TEXT = /^-?\d+(\.\d+)?$/;
// A cell starting with one of these is run as a formula by Excel/Sheets ("CSV injection").
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text: string;
  if (typeof value === "string") {
    text = FORMULA_START.test(value) && !NUMBER_TEXT.test(value) ? `'${value}` : value;
  } else if (value instanceof Date) {
    text = value.toISOString();
  } else if (typeof value === "object") {
    text = JSON.stringify(value);
    if (FORMULA_START.test(text)) text = `'${text}`;
  } else {
    text = String(value);
  }
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(columns: readonly string[], rows: readonly CsvRow[]): string {
  const lines = [columns.map(csvCell).join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvCell(row[column])).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
