import { expect, test } from "@playwright/test";

test.describe("landing page (F1)", () => {
  test("renders every section and the waitlist validates", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Upload your tickets.");
    for (const h of [
      "One trip shouldn't need nine apps.",
      "Three steps. Zero planning stress.",
      "Everything your trip needs, in one place.",
      "Your whole crew, one shared trip.",
      "Real places. Not AI guesses.",
      "Questions, answered.",
    ]) {
      await expect(page.getByRole("heading", { name: h })).toBeAttached();
    }

    const form = page.locator("#waitlist");
    await form.scrollIntoViewIfNeeded();
    await form.getByLabel("Email address").fill("not-an-email");
    await form.getByRole("button", { name: /get early access/i }).click();
    await expect(form.getByRole("alert")).toHaveText("Please enter a valid email address.");

    await expect(form.getByRole("button", { name: "Friends" })).toHaveAttribute("aria-pressed", "true");
    await form.getByRole("button", { name: "Family" }).click();
    await expect(form.getByRole("button", { name: "Family" })).toHaveAttribute("aria-pressed", "true");
  });

  test("respects reduced motion (no splash)", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator(".splash")).toBeHidden();
    await ctx.close();
  });

  test("SEO files exist", async ({ request }) => {
    expect((await request.get("/robots.txt")).ok()).toBeTruthy();
    expect((await request.get("/sitemap.xml")).ok()).toBeTruthy();
    expect((await request.get("/manifest.webmanifest")).ok()).toBeTruthy();
    expect((await request.get("/opengraph-image")).headers()["content-type"]).toContain("image/png");
  });
});
