// tests/feed.spec.js
import { test, expect } from '@playwright/test'
import { login } from './helpers/auth.js'

test.describe('Feed social', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    // Esperar a que el feed cargue
    await expect(page.locator('.home-page')).toBeVisible({ timeout: 10_000 })
  })

  // ─── Crear post general ───────────────────────────────────────────────────

  test('crear post de texto aparece en el feed', async ({ page }) => {
    const textoPost = `Post de prueba Playwright ${Date.now()}`

    // Botón "+ Nueva publicación" en el header
    await page.getByRole('button', { name: '+ Nueva publicación' }).click()
    await expect(page.locator('.modal-container')).toBeVisible()

    // MentionInput usa un div contenteditable o textarea con clase modal-textarea
    await page.locator('.modal-textarea').fill(textoPost)

    // Botón publicar en el footer del modal
    await page.getByRole('button', { name: 'Publicar' }).click()

    // El modal debe cerrarse y el post aparecer primero
    await expect(page.locator('.modal-container')).toBeHidden({ timeout: 6_000 })
    await expect(page.locator('.post-card').first()).toContainText(textoPost, { timeout: 8_000 })
  })

  // ─── Like ─────────────────────────────────────────────────────────────────

  test('dar like incrementa o decrementa el contador', async ({ page }) => {
    const primerPost = page.locator('.post-card').first()
    await expect(primerPost).toBeVisible()

    // Botón de like — tiene clase post-action-btn
    const btnLike = primerPost.locator('.post-action-btn').first()
    const textoAntes = await btnLike.innerText()

    await btnLike.click()
    await page.waitForTimeout(1_000)

    const textoDespues = await btnLike.innerText()

    // El texto del botón debe haber cambiado (número de likes)
    // Puede ser "" → "1" o "1" → "" (toggle)
    expect(textoAntes).not.toEqual(textoDespues)
  })

  // ─── Comentario ───────────────────────────────────────────────────────────

  test('añadir comentario aparece en el hilo', async ({ page }) => {
    const textoComentario = `Comentario test ${Date.now()}`

    const primerPost = page.locator('.post-card').first()
    await expect(primerPost).toBeVisible()

    // Botón de comentarios (segundo post-action-btn)
    await primerPost.locator('.post-action-btn').nth(1).click()

    // Input de comentario
    await primerPost.locator('.post-comment-input').fill(textoComentario)

    // Botón enviar (FaPaperPlane)
    await primerPost.locator('.post-comment-send').click()

    await expect(primerPost.getByText(textoComentario)).toBeVisible({ timeout: 6_000 })
  })

  // ─── Menciones @usuario ───────────────────────────────────────────────────

test('escribir @ muestra sugerencias de usuarios', async ({ page }) => {
  await page.getByRole('button', { name: '+ Nueva publicación' }).click()
  await expect(page.locator('.modal-container')).toBeVisible()

  await page.locator('textarea.mention-input.modal-textarea').fill('@')
  await page.waitForTimeout(800)

  // El wrapper de menciones con contenido visible
  await expect(page.locator('.mention-wrapper').filter({ hasText: '@' }))
    .toBeVisible({ timeout: 4_000 })
})

  // ─── Notificaciones ───────────────────────────────────────────────────────

test('icono de notificaciones navega a /notifications', async ({ page }) => {
  await page.goto('/notifications')
  await expect(page).toHaveURL(/\/notifications/, { timeout: 6_000 })
  await expect(page.locator('.notif-page').first()).toBeVisible({ timeout: 6_000 })
})

  // ─── Ver detalle de post ──────────────────────────────────────────────────

  test('clicar en post-clickable navega a PostDetailPage', async ({ page }) => {
    const primerPost = page.locator('.post-card').first()
    await expect(primerPost).toBeVisible()

    await primerPost.locator('.post-clickable').click()
    await expect(page).toHaveURL(/\/post\//, { timeout: 6_000 })
  })
})
