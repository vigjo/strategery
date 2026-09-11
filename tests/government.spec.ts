import { test, expect } from '@playwright/test';
test('government loop, keyboard drafting, reorder, reload and comparison', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Executive', exact: true }).click();
    const purchase = page.getByRole('button', { name: 'Draft Emergency energy purchase', exact: true });
    await purchase.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Draft Diplomatic outreach', exact: true }).click();
    await page.getByRole('button', { name: 'Move Diplomatic outreach up', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Move Diplomatic outreach up', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Submit turn', exact: true }).click();
    await expect(page.getByText('Revenue +10; baseline expenditure −6.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Executive government · Turn 2 / 12', { exact: true })).toBeVisible();
    for (let i = 2; i <= 12; i++)
        await page.getByRole('button', { name: 'Submit turn', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your administration: assessment' })).toBeVisible();
    await page.getByRole('button', { name: 'Replay in the other mode', exact: true }).click();
    await expect(page.getByText('Political government · Turn 1 / 12', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Previous executive administration' })).toBeVisible();
    await page.getByRole('button', { name: 'Draft Build coalition', exact: true }).click();
    await page.getByRole('button', { name: 'Draft Domestic energy program', exact: true }).click();
    await page.getByRole('button', { name: 'Submit turn', exact: true }).click();
    await expect(page.getByText('Energy program: 3 payments of 3 remaining; +15 energy on completion.', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath('government.png'), fullPage: true });
});
