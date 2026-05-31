// tests/helpers/auth.js
// Helper reutilizable: hace login y guarda el estado de sesión
// para no repetir el flujo en cada test.

import { expect } from '@playwright/test'

// Credenciales de una cuenta de prueba dedicada — nunca usar la cuenta real
export const TEST_USER = {
  email: process.env.TEST_EMAIL ?? 'beanlog.test@gmail.com',
  password: process.env.TEST_PASSWORD ?? 'BeanLogTest2026!',
  username: 'beanlog_test',
}

/**
 * Hace login y espera a que el feed sea visible.
 * Llamar desde beforeEach o al inicio de cada spec.
 * @param {import('@playwright/test').Page} page
 */
export async function login(page) {
  await page.goto('/login')

  await page.getByRole('textbox', { name: 'tu@email.com' }).fill(TEST_USER.email)
  await page.getByRole('textbox', { name: '••••••••' }).fill(TEST_USER.password)
  await page.getByRole('button', { name: 'Inicia sesión' }).click()

  await expect(page).toHaveURL(/\/$/, { timeout: 10_000 })
}

/**
 * Cierra sesión desde cualquier página.
 * @param {import('@playwright/test').Page} page
 */
export async function logout(page) {
  // Navegar a ajustes y pulsar cerrar sesión
  await page.goto('/settings')
  await page.getByRole('button', { name: /cerrar sesi/i }).click()
  await expect(page).toHaveURL(/\/login/)
}
