// spec: specs/pim-add-and-search-employee.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Employee List - Search', () => {
  test('Search for newly added employee by full name via autocomplete', async ({ page }) => {
    const ts = Date.now().toString();
    const firstName = `Auto${ts}`;
    const lastName = `Tester${ts}`;
    // Employee Id max 10 chars; the pre-filled default can collide on the shared demo site
    const employeeId = ts.slice(-8);

    // Seed: log in as Admin and land on the Dashboard
    await page.goto('https://opensource-demo.orangehrmlive.com/');
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 20000 });

    // 1. Precondition within test: add an employee with unique first/last name (Auto<ts> Tester<ts>).
    await page.getByRole('link', { name: 'PIM' }).click();
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await expect(page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();
    await page.getByRole('textbox', { name: 'First Name' }).fill(firstName);
    await page.getByRole('textbox', { name: 'Last Name' }).fill(lastName);
    // Employee Id input has no accessible name; it is the only unnamed textbox on the Add Employee form
    await page.getByRole('textbox', { name: /^$/ }).fill(employeeId);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/\/pim\/viewPersonalDetails/, { timeout: 30000 });
    await expect(page.getByRole('textbox', { name: 'First Name' })).toHaveValue(firstName);
    await expect(page.getByRole('textbox', { name: 'Last Name' })).toHaveValue(lastName);

    // 2. Go to PIM > Employee List. Type the first name in Employee Name.
    await page.getByRole('link', { name: 'Employee List' }).click();
    await expect(page).toHaveURL(/\/pim\/viewEmployeeList/);
    // Employee Name is the first "Type for hints..." field (the second is Supervisor Name)
    await page.getByPlaceholder('Type for hints...').first().pressSequentially(firstName);
    const suggestion = page.getByRole('option', { name: `${firstName} ${lastName}` });
    await expect(suggestion).toBeVisible({ timeout: 15000 });

    // 3. Select the suggestion and click Search.
    await suggestion.click();
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('(1) Record Found')).toBeVisible({ timeout: 15000 });
    const resultRow = page.getByRole('row').filter({ hasText: firstName });
    await expect(resultRow).toHaveCount(1);
    await expect(resultRow).toContainText(lastName);
    await expect(resultRow).toContainText(employeeId);
  });
});
