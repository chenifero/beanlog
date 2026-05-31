// tests/map.spec.js
import { test, expect } from '@playwright/test'
import { login } from './helpers/auth.js'

test.describe('Mapa de cafeterías', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/map')
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 })
  })

  // ─── Añadir cafetería ─────────────────────────────────────────────────────

  test('añadir cafetería nueva crea marcador y post en el feed', async ({ page }) => {
    const nombreCafe = `Cafetería Test ${Date.now()}`

    // Botón flotante "+ Añadir cafetería"
    await page.getByRole('button', { name: '+ Añadir cafetería' }).click()
    await expect(page.locator('.mapa-modal')).toBeVisible()

    // Campo nombre
    await page.getByPlaceholder('Ej: Nomad Coffee').fill(nombreCafe)

    // Campo ubicación con autocompletado Photon
    await page.getByPlaceholder('Busca la dirección...').fill('Madrid')
    await page.waitForTimeout(1_500)
    const primeraSugerencia = page.locator('.mapa-location-suggestion, [class*="suggestion"]').first()
    if (await primeraSugerencia.isVisible()) {
      await primeraSugerencia.click()
    }

    // Campo valoración
    await page.getByPlaceholder('Ej: 8.5').fill('8.5')

    // Campo notas (MentionInput — usa clase específica)
    await page.locator('textarea[placeholder="Ambiente, especialidad, horario..."], .mapa-notas-input').fill('Buenísimo espresso')

    // Guardar
    await page.getByRole('button', { name: 'Guardar' }).click()

    // Modal debe cerrarse
    await expect(page.locator('.mapa-modal')).toBeHidden({ timeout: 8_000 })

    // Verificar que el post de visita aparece en el feed
    await page.goto('/')
    await expect(page.locator('.post-card').first()).toContainText(nombreCafe, { timeout: 8_000 })
  })

  // ─── Estado Quiero ir ─────────────────────────────────────────────────────

  test('marcar "Quiero ir" desde un post de visita en el feed', async ({ page }) => {
    await page.goto('/')

    // Buscar el primer post de tipo visita (tiene botones Quiero ir / Visitada)
    const btnQuieroIr = page.locator('.post-shop-btn.want-to-go').first()
    await expect(btnQuieroIr).toBeVisible({ timeout: 8_000 })

    await btnQuieroIr.click()
    await page.waitForTimeout(1_000)

    // El botón debe tener clase active
    await expect(btnQuieroIr).toHaveClass(/active/, { timeout: 4_000 })
  })

  // ─── Toggle estado ────────────────────────────────────────────────────────

  test('pulsar el mismo estado dos veces lo elimina (toggle)', async ({ page }) => {
    await page.goto('/')

    const btnVisitada = page.locator('.post-shop-btn.visited').first()
    await expect(btnVisitada).toBeVisible({ timeout: 8_000 })

    // Primer click — activa
    await btnVisitada.click()
    await page.waitForTimeout(800)
    await expect(btnVisitada).toHaveClass(/active/)

    // Segundo click — desactiva
    await btnVisitada.click()
    await page.waitForTimeout(800)
    await expect(btnVisitada).not.toHaveClass(/active/)
  })

  // ─── Leyenda interactiva ──────────────────────────────────────────────────

  test('leyenda filtra los marcadores por categoría', async ({ page }) => {
    const leyenda = page.locator('.mapa-leyenda')
    await expect(leyenda).toBeVisible()

    const totalMarcadores = await page.locator('.leaflet-marker-icon').count()

    // Pulsar "Quiero ir" en la leyenda para desactivarlo
    await leyenda.getByText('Quiero ir').click()
    await page.waitForTimeout(800)

    // El item debe tener clase inactive
    const itemQuieroIr = leyenda.locator('.mapa-leyenda-item').nth(1)
    await expect(itemQuieroIr).toHaveClass(/inactive/)

    // Volver a activarlo
    await leyenda.getByText('Quiero ir').click()
    await page.waitForTimeout(800)
    await expect(itemQuieroIr).toHaveClass(/active/)
  })

  // ─── No se puede desactivar la última categoría ───────────────────────────

  test('no se puede desactivar la última categoría activa', async ({ page }) => {
    const leyenda = page.locator('.mapa-leyenda')
    await expect(leyenda).toBeVisible()

    // Desactivar dos categorías
    await leyenda.getByText('Quiero ir').click()
    await page.waitForTimeout(400)
    await leyenda.getByText('Visitada').click()
    await page.waitForTimeout(400)

    // Intentar desactivar "Mis cafeterías" (la última)
    await leyenda.getByText('Mis cafeterías').click()
    await page.waitForTimeout(400)

    // Debe seguir activa — solo 1 activa mínimo
    const itemMis = leyenda.locator('.mapa-leyenda-item').first()
    await expect(itemMis).toHaveClass(/active/)
  })

  // ─── Autocompletado Photon ────────────────────────────────────────────────

  test('autocompletado de ubicación devuelve sugerencias', async ({ page }) => {
    await page.getByRole('button', { name: '+ Añadir cafetería' }).click()

    await page.getByPlaceholder('Busca la dirección...').fill('Barcel')
    await page.waitForTimeout(1_500)

    const sugerencias = page.locator('.mapa-location-suggestion, [class*="suggestion"]')
    await expect(sugerencias.first()).toBeVisible({ timeout: 5_000 })
    const texto = await sugerencias.first().innerText()
    expect(texto.toLowerCase()).toContain('barcel')
  })
})
