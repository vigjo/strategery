import { test, expect, type Page } from '@playwright/test';
const mobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 760;
async function openDraft(page: Page) { if (mobile(page))
    await page.getByRole('button', { name: 'Review draft', exact: true }).click(); }
async function submit(page: Page) { await openDraft(page); await page.getByRole('button', { name: 'Submit turn', exact: true }).click(); }
async function nav(page: Page, name: string) { await page.getByRole('navigation').getByRole('button', { name, exact: true }).click(); }
test('government loop, navigation, keyboard draft, reorder, reload and comparison', async ({ page }) => {
    await page.goto('/strategery/');
    await page.getByRole('button', { name: 'Start Executive →', exact: true }).click();
    await nav(page, 'Cabinet');
    const purchase = page.getByRole('button', { name: 'Draft Emergency energy purchase', exact: true });
    await purchase.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Added Emergency energy purchase', exact: true })).toBeDisabled();
    await nav(page, 'Foreign Affairs');
    await page.getByRole('button', { name: 'Draft Diplomatic outreach', exact: true }).click();
    await openDraft(page);
    await page.getByRole('button', { name: 'Move Diplomatic outreach up', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Move Diplomatic outreach up', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Submit turn', exact: true }).click();
    await expect(page.getByText('Revenue +10; baseline expenditure −6.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Executive government · Turn 2 / 12', { exact: true })).toBeVisible();
    await submit(page);
    await expect(page.getByRole('heading', { name: 'Supply disruption', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath('briefing.png'), fullPage: true });
    for (let i = 3; i <= 12; i++)
        await submit(page);
    await expect(page.getByRole('heading', { name: 'Your administration: assessment' })).toBeVisible();
    await page.screenshot({ path: test.info().outputPath('assessment.png'), fullPage: true });
    await page.getByRole('button', { name: 'Replay in the other mode', exact: true }).click();
    await nav(page, 'History');
    await expect(page.getByRole('heading', { name: 'Previous executive administration' })).toBeVisible();
    await nav(page, 'Cabinet');
    await page.getByRole('button', { name: 'Draft Domestic energy program', exact: true }).click();
    await page.getByRole('button', { name: 'Draft Build coalition', exact: true }).click();
    await page.getByRole('button', { name: 'Draft Domestic energy program', exact: true }).click();
    await submit(page);
    await expect(page.getByText('Energy program: 3 payments of 3 remaining; +15 energy on completion.', { exact: true })).toBeVisible();
    await nav(page, 'History');
    await expect(page.getByText(/Blocked attempts: Domestic energy program: Requires 60/)).toBeVisible();
});
test('game menu export, import, reset, invalid recovery and overlay focus', async ({ page }) => {
    await page.goto('/strategery/');
    await page.getByRole('button', { name: 'Start Executive →', exact: true }).click();
    await page.getByRole('button', { name: 'Game menu', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Game menu', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Game menu', exact: true }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export government save', exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('strategery-government.json');
    const raw = await page.evaluate(() => localStorage.getItem('strategery.government.v1')!);
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Choose mode', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Start Executive →', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Game menu', exact: true }).click();
    await page.getByLabel('Import government save').setInputFiles({ name: 'save.json', mimeType: 'application/json', buffer: Buffer.from(raw) });
    await expect(page.getByText('Executive government · Turn 1 / 12', { exact: true })).toBeVisible();
    if (mobile(page)) {
        await openDraft(page);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('button', { name: 'Review draft', exact: true })).toBeFocused();
    }
    await page.evaluate(() => localStorage.setItem('strategery.government.v1', '{broken'));
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Your original save is safe.' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('strategery.government.v1'))).toBe('{broken');
    await page.getByRole('button', { name: 'Game menu', exact: true }).click();
    await page.getByLabel('Import government save').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
    await expect(page.getByRole('dialog').getByText('Invalid government save. Current session unchanged.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Start over', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Start Executive →', exact: true })).toBeVisible();
});
