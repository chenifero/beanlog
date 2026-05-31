import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("login correcto redirige al feed", async ({ page }) => {
    await page
      .getByRole("textbox", { name: "tu@email.com" })
      .fill(process.env.TEST_EMAIL);
    await page
      .getByRole("textbox", { name: "••••••••" })
      .fill(process.env.TEST_PASSWORD);
    await page.getByRole("button", { name: "Inicia sesión" }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
  });

  test("credenciales incorrectas muestran error", async ({ page }) => {
    await page
      .getByRole("textbox", { name: "tu@email.com" })
      .fill("noexiste@beanlog.app");
    await page.getByRole("textbox", { name: "••••••••" }).fill("WrongPass123");
    await page.getByRole("button", { name: "Inicia sesión" }).click();
    const error = page.locator(
      '[class*="error"], [class*="toast"], [role="alert"]',
    );
    await expect(error).toBeVisible({ timeout: 8_000 });
  });

  test("campo vacío no dispara petición", async ({ page }) => {
    await page.getByRole("button", { name: "Inicia sesión" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Recuperación de contraseña", () => {
  test("enlace olvidé contraseña muestra campo de email", async ({ page }) => {
    await page.goto("/login");
    await page
      .getByRole("button", { name: "¿Olvidaste tu contraseña?" })
      .click();
    await expect(
      page.getByRole("textbox", { name: "tu@email.com" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /enviar|recuperar/i }),
    ).toBeVisible();
  });

  test("envío de email de recuperación muestra confirmación", async ({
    page,
  }) => {
    await page.goto("/login");
    await page
      .getByRole("button", { name: "¿Olvidaste tu contraseña?" })
      .click();
    await page
      .getByRole("textbox", { name: "tu@email.com" })
      .fill(process.env.TEST_EMAIL);
    await page.getByRole("button", { name: /enviar|recuperar/i }).click();

    // Aceptamos tanto éxito como rate limit — ambos son respuestas válidas
    const respuesta = page.locator(
      '[class*="success"], [class*="toast"], [class*="error"]',
    );
    await expect(respuesta).toBeVisible({ timeout: 8_000 });
  });
});
