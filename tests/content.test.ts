import { test } from "node:test";
import assert from "node:assert/strict";
import { initialContent, researchSchema } from "../lib/content";
import { stageRows, normalizeName, batchDigest } from "../lib/import";
import { passwordValid, token, validToken } from "../lib/auth";
test("prototype contains ten honest sections and no invented numbers", () => {
  const c = researchSchema.parse(initialContent);
  assert.equal(c.sections.length, 10);
  assert.equal(c.metrics.length, 0);
  assert.equal(c.sources.length, 0);
  assert.equal(c.sections.filter((s) => s.kind === "verified").length, 0);
});
test("financial observations require an existing source", () => {
  assert.equal(
    researchSchema.safeParse({
      ...initialContent,
      metrics: [
        {
          key: "revenue",
          label: "Revenue",
          year: "FY2025",
          value: 1,
          unit: "₹ crore",
          basis: "consolidated",
          sourceId: "missing",
          definition: "Test",
        },
      ],
    }).success,
    false,
  );
});
test("verified claims require citations and source URLs reject javascript", () => {
  assert.equal(
    researchSchema.safeParse({
      ...initialContent,
      sections: [
        { id: "x", title: "x", body: "x", kind: "verified", sourceIds: [] },
      ],
    }).success,
    false,
  );
  assert.equal(
    researchSchema.safeParse({
      ...initialContent,
      website: "javascript:alert(1)",
    }).success,
    false,
  );
});
test("image permission and unique source ids are enforced", () => {
  assert.equal(
    researchSchema.safeParse({
      ...initialContent,
      imageUrl: "https://example.com/test.png",
      imageLicense: "",
    }).success,
    false,
  );
});
test("staging deduplicates listings and rejects conflicting identities", () => {
  const row = {
    name: "  Test   Company ",
    isin: "INE000A01010",
    exchange: "NSE",
    symbol: "TEST",
  };
  const s = stageRows([
    row,
    row,
    { ...row, isin: "INE001A01010" },
    { ...row, isin: "bad" },
  ]);
  assert.equal(s.accepted.length, 1);
  assert.equal(s.rejected.length, 2);
  assert.equal(s.accepted[0].name, "Test Company");
  assert.equal(normalizeName(" A  B "), "A B");
  assert.equal(batchDigest("test", [row]), batchDigest("test", [row]));
});
test("signed sessions reject tampering and incorrect passwords", () => {
  process.env.ADMIN_PASSWORD = "unit-test-only-password";
  process.env.SESSION_SECRET = "unit-test-only-secret-32-characters-long";
  assert.ok(passwordValid("unit-test-only-password"));
  assert.equal(passwordValid("wrong"), false);
  const t = token();
  assert.ok(validToken(t));
  assert.equal(validToken(t + "bad"), false);
  assert.equal(
    validToken(t.split(".").slice(0, 2).join(".") + "." + "é".repeat(64)),
    false,
  );
  assert.equal(validToken("0.bad.bad"), false);
  delete process.env.SESSION_SECRET;
  assert.equal(validToken(t), false);
});
