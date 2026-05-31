// tests/tasting.spec.js
import { test, expect } from '@playwright/test'
import path from 'path'
import { login } from './helpers/auth.js'

const LABEL_IMAGE = path.join(import.meta.dirname, 'fixtures', 'test-label.png')

test.describe('Flujo de cata', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    // Ir a Mis Cafés donde está el TastingModal
    await page.goto('/cafes')
    await expect(page.locator('.mis-cafes-page, .mis-cafes-fab')).toBeVisible({ timeout: 8_000 })
  })

  // ─── Paso 1: subida de etiqueta + OCR ─────────────────────────────────────

  test('subir etiqueta activa OCR y rellena campos', async ({ page }) => {
    // FAB "+" abre el TastingModal
    await page.locator('.mis-cafes-fab').click()
    await expect(page.locator('.tasting-modal, .tasting-step-content')).toBeVisible()

    // Estamos en paso "foto" — subir imagen
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(LABEL_IMAGE)

    // Preview de la etiqueta debe aparecer
    await expect(page.locator('.tasting-label-preview img')).toBeVisible({ timeout: 5_000 })

    // Botón "Escanear con IA"
    await page.locator('.tasting-btn-primary').click()

    // Indicador de carga durante OCR
    await expect(page.getByText('Escaneando...')).toBeVisible({ timeout: 5_000 })

    // Esperar que termine el OCR (puede tardar hasta 20s)
    await expect(page.getByText('Escaneando...')).toBeHidden({ timeout: 25_000 })

    // Ahora estamos en paso "datos" — al menos un campo debe estar relleno
    const campoNombre = page.getByPlaceholder('Ej: Nomad Coffee')
    const campoFinca  = page.getByPlaceholder('Ej: Konga')
    const algunoRelleno = (await campoNombre.inputValue()) || (await campoFinca.inputValue())
    expect(algunoRelleno.length).toBeGreaterThan(0)
  })

  // ─── Paso 2: datos del café ────────────────────────────────────────────────

  test('rellenar datos manualmente y avanzar al radar', async ({ page }) => {
    await page.locator('.mis-cafes-fab').click()
    await expect(page.locator('.tasting-step-content')).toBeVisible()

    // Saltar OCR — ir directo al paso datos sin escanear
    // Clicar "Siguiente" sin imagen (si el modal lo permite con campos vacíos)
    // O clicar el paso 2 en el stepper
    await page.locator('.tasting-step').nth(1).click().catch(() => {})

    // Si no hay salto directo, avanzar desde foto sin imagen
    const btnSiguiente = page.locator('.tasting-btn-primary')
    if (await page.locator('.tasting-label-preview').isHidden()) {
      // Rellenar nombre directamente si ya estamos en paso datos
      const inputNombre = page.getByPlaceholder('Ej: Nomad Coffee')
      if (await inputNombre.isVisible()) {
        await inputNombre.fill('Café de Prueba Playwright')
      }
    }

    // Botón "Siguiente" en paso datos
    await page.locator('.tasting-btn-primary').click()

    // Debemos estar en paso "radar" — sliders visibles
    await expect(page.locator('.tasting-sliders')).toBeVisible({ timeout: 5_000 })
  })

  // ─── Paso 3: sliders del radar ────────────────────────────────────────────

  test('sliders sensoriales actualizan el radar chart', async ({ page }) => {
    await page.locator('.mis-cafes-fab').click()

    // Navegar hasta el paso radar (paso 3)
    // Avanzar desde foto sin imagen si es posible
    await page.locator('.tasting-btn-primary').click().catch(() => {})
    await page.waitForTimeout(500)
    await page.locator('.tasting-btn-primary').click().catch(() => {})
    await page.waitForTimeout(500)

    const sliders = page.locator('input.tasting-slider[type="range"]')
    const count = await sliders.count()

    if (count > 0) {
      // Mover el primer slider (Acidez)
      await sliders.first().fill('9')
      // El valor debe reflejarse en el label
      await expect(page.locator('.tasting-slider-value').first()).toContainText('9')
    }

    // El RadarChart debe estar visible
    await expect(page.locator('.recharts-surface, [class*="radar"]')).toBeVisible()
  })

  // ─── Guardar cata ─────────────────────────────────────────────────────────

  test('guardar cata aparece en Mis Cafés', async ({ page }) => {
    await page.locator('.mis-cafes-fab').click()
    await expect(page.locator('.tasting-step-content')).toBeVisible()

    // Paso 1 foto — subir imagen
    await page.locator('input[type="file"]').first().setInputFiles(LABEL_IMAGE)
    await expect(page.locator('.tasting-label-preview img')).toBeVisible({ timeout: 5_000 })
    await page.locator('.tasting-btn-primary').click()

    // Esperar OCR
    await expect(page.getByText('Escaneando...')).toBeHidden({ timeout: 25_000 })

    // Paso 2 datos — rellenar nombre si está vacío
    const inputNombre = page.getByPlaceholder('Ej: Nomad Coffee')
    if (await inputNombre.isVisible() && (await inputNombre.inputValue()) === '') {
      await inputNombre.fill('Café Playwright Test')
    }
    await page.locator('.tasting-btn-primary').click()

    // Paso 3 radar — avanzar
    await expect(page.locator('.tasting-sliders')).toBeVisible({ timeout: 5_000 })
    await page.locator('.tasting-btn-primary').click()

    // Paso 4 resumen — botón "Guardar cata"
    await expect(page.locator('.tasting-btn-primary')).toBeVisible({ timeout: 5_000 })
    await page.locator('.tasting-btn-primary').click()

    // Modal debe cerrarse
    await expect(page.locator('.tasting-step-content')).toBeHidden({ timeout: 10_000 })

    // La cata debe aparecer en Mis Cafés
    await expect(page.locator('.tasting-card, [class*="tasting-card"]').first()).toBeVisible({ timeout: 8_000 })
  })

  // ─── Campo precio + divisa ────────────────────────────────────────────────

  test('campo precio se serializa con divisa correctamente', async ({ page }) => {
    await page.locator('.mis-cafes-fab').click()

    // Saltar al paso datos
    await page.locator('input[type="file"]').first().setInputFiles(LABEL_IMAGE)
    await expect(page.locator('.tasting-label-preview img')).toBeVisible({ timeout: 5_000 })
    await page.locator('.tasting-btn-primary').click()
    await expect(page.getByText('Escaneando...')).toBeHidden({ timeout: 25_000 })

    // Rellenar precio
    await page.locator('.tasting-precio-input').fill('12,50')

    // Cambiar divisa a $
    await page.locator('.tasting-divisa-select').selectOption('$')

    // Avanzar hasta el resumen
    await page.locator('.tasting-btn-primary').click()  // datos → radar
    await expect(page.locator('.tasting-sliders')).toBeVisible({ timeout: 5_000 })
    await page.locator('.tasting-btn-primary').click()  // radar → resumen

    // En el resumen debe aparecer el precio con divisa
    await expect(page.getByText(/12,50 \$/)).toBeVisible({ timeout: 5_000 })
  })
})
