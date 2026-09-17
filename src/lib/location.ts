// Helper to clean prefixes from location names
export function cleanLocationName(name: string, type: "province" | "district" | "subdistrict") {
  if (!name) return "";
  let cleaned = name.trim();
  if (type === "province") {
    cleaned = cleaned.replace(/^จังหวัด/, "");
  } else if (type === "district") {
    cleaned = cleaned.replace(/^อำเภอ/, "");
  } else if (type === "subdistrict") {
    cleaned = cleaned.replace(/^ตำบล/, "");
  }
  return cleaned;
}
