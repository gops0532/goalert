import { test, expect } from '@playwright/test'
import { userSessionFile } from './lib'
import Chance from 'chance'
const c = new Chance()
const baseURL = 'http://localhost:6130'

test.describe.configure({ mode: 'parallel' })
test.use({ storageState: userSessionFile })

let scheduleID: string

test.beforeEach(async ({ page }) => {
  // create schedule
  const name = 'sched-spec ' + c.string({ length: 10, alpha: true })

  await page.goto(`${baseURL}/schedules`)
  await page.getByRole('button', { name: 'Create Schedule' }).click()
  await page.fill('input[name=name]', name)
  await page.locator('button[type=submit]').click()
  await page.waitForURL(/\/schedules\/.{36}/)
  scheduleID = page.url().split('/schedules/')[1]
})

test.afterEach(async ({ page }) => {
  // delete schedule
  await page.goto(`${baseURL}/schedules/${scheduleID}`)
  await page.click('[data-testid="DeleteIcon"]')
  await page.click('button:has-text("Confirm")')
})

test('local time hover', async ({ page }) => {
  // change schedule tz to Europe/Amsterdam
  await page.click('[aria-label="Edit"]')
  await page.fill('input[name=time-zone]', 'Europe/Amsterdam')
  await page.click('li:has-text("Europe/Amsterdam")')
  await page.getByRole('button', { name: 'Submit' }).click()

  await page.goto(`${baseURL}/schedules/${scheduleID}/shifts`)

  // should display schedule tz on hover
  await page.hover(`[data-testid="shift-details"]`)
  await expect(page.locator('[data-testid="shift-tooltip"]')).toContainText(
    'GMT',
  )
})
