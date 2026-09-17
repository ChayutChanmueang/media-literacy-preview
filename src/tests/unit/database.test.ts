import { describe, expect, it } from "vitest";
import { validateDatabaseConnectionString } from "@/lib/database";

describe("database connection string validation", () => {
  it("accepts a Supabase transaction pooler URL", () => {
    const connectionString =
      "postgresql://postgres.project-ref:password@aws-0-region.pooler.supabase.com:6543/postgres";

    expect(validateDatabaseConnectionString(connectionString)).toBe(connectionString);
  });

  it("rejects a direct Supabase host combined with the pooler port", () => {
    expect(() =>
      validateDatabaseConnectionString(
        "postgresql://postgres:password@db.project-ref.supabase.co:6543/postgres",
      ),
    ).toThrow("Invalid Supabase host/port combination");
  });

  it("rejects non-PostgreSQL URLs", () => {
    expect(() => validateDatabaseConnectionString("https://project-ref.supabase.co")).toThrow(
      "postgres:// or postgresql://",
    );
  });
});
