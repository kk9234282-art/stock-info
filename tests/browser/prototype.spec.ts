import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("homepage, search and responsive directory", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Understand every/ }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search companies" }).fill("532921");
  await expect(
    page.locator(".suggestions").getByText("ADANIPORTS"),
  ).toBeVisible();
  await page.locator(".suggestions a").click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Adani Ports",
  );
  await page.goto("/companies?q=does-not-exist");
  await expect(
    page.getByRole("heading", { name: "No matching companies" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: ".local/home-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: ".local/home-desktop.png", fullPage: true });
});
test("company learning flow, missing data, dark theme and mobile", async ({
  page,
}) => {
  await page.goto("/companies/adani-ports");
  await expect(page.locator(".research-section")).toHaveCount(10);
  await expect(page.locator("html")).toHaveClass("dark");
  await expect(page.locator(".port-mosaic img")).toHaveCount(3);
  await expect(page.locator(".pillar-row")).toHaveCount(4);
  await page
    .getByRole("button", { name: /Step 3: Cargo moves inland/ })
    .click();
  await expect(
    page.getByRole("region", { name: "Inland transport revenue detail" }),
  ).toContainText("rail, road");
  await expect(page.locator(".financial-summary-card")).toHaveCount(4);
  await expect(
    page.locator(".financial-summary-card strong").first(),
  ).toHaveText("Not yet verified");
  await page
    .getByText("Explore historical financial data", { exact: true })
    .click();
  await expect(
    page.getByText("Verified financial data is not available yet."),
  ).toBeVisible();
  await page
    .getByText("Explore historical financial data", { exact: true })
    .click();
  await page.screenshot({ path: ".local/company-dark.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/companies/adani-ports");
  await page.screenshot({ path: ".local/company-reference-preview.png" });
  await page
    .locator("#business-model")
    .screenshot({ path: ".local/business-model-preview.png" });
  await page
    .locator("#operations")
    .screenshot({ path: ".local/cargo-journey-preview.png" });
  await page
    .locator("#financials")
    .screenshot({ path: ".local/financial-cards-preview.png" });
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).not.toHaveClass("dark");
  await page.screenshot({ path: ".local/company-light.png", fullPage: true });
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveClass("dark");
  await page.screenshot({ path: ".local/company-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: ".local/company-mobile.png", fullPage: true });
});
test("admin rejects anonymous writes and cross-origin login", async ({
  request,
  page,
}) => {
  const r = await request.post("/api/admin", { data: {} });
  expect(r.status()).toBe(401);
  const cross = await request.post("/api/session", {
    headers: { origin: "https://untrusted.example" },
    form: { password: "x" },
  });
  expect(cross.status()).toBe(403);
  await page.goto("/admin");
  await expect(page.getByLabel("Administrator password")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Publish research" }),
  ).toHaveCount(0);
});
test("editor saves private draft, previews, publishes and restores", async ({
  page,
  request,
}) => {
  const env = await readFile(".env.local", "utf8");
  const password = env
    .split("\n")
    .find((l) => l.startsWith("ADMIN_PASSWORD="))!
    .slice("ADMIN_PASSWORD=".length);
  await page.goto("/admin");
  await page.getByLabel("Administrator password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: false }).click();
  await expect(
    page.getByRole("heading", { name: "Research, carefully managed." }),
  ).toBeVisible();
  const textarea = page.getByRole("textbox", {
    name: "Business description",
    exact: true,
  });
  const original = await textarea.inputValue();
  const sentinel = original + " Editorial workflow validation.";
  await textarea.fill(sentinel);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  let publicPage = await request.get("/companies/adani-ports");
  expect(await publicPage.text()).not.toContain(
    "Editorial workflow validation.",
  );
  await page.getByRole("button", { name: "Preview draft" }).click();
  await expect(page.locator(".draft-preview")).toContainText(sentinel);
  await page.getByRole("button", { name: "Edit content" }).click();
  await page
    .getByRole("button", { name: "Publish research", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Published");
  publicPage = await request.get("/companies/adani-ports");
  expect(await publicPage.text()).toContain("Editorial workflow validation.");
  await page
    .getByRole("textbox", { name: "Business description", exact: true })
    .fill(original);
  await page
    .getByRole("button", { name: "Publish research", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Published");
  publicPage = await request.get("/companies/adani-ports");
  expect(await publicPage.text()).not.toContain(
    "Editorial workflow validation.",
  );
  await page.reload();
  await expect(page.locator(".revision")).not.toHaveCount(0);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByLabel("Administrator password")).toBeVisible();
});
