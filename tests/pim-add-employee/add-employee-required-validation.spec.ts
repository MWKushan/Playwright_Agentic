// spec: specs/pim-add-and-search-employee.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { AddEmployeePage } from '../pages/add-employee.page';
import { LoginPage } from '../pages/login.page';

test.describe('Add Employee - Validation and Edge Cases', () => {
  test('Required first and last name validation', async ({ page }) => {
    const ts = Date.now().toString();
    const firstName = `Auto${ts}`;
    const lastName = `Tester${ts}`;
    const loginPage = new LoginPage(page);
    const addEmployeePage = new AddEmployeePage(page);

    await loginPage.open();
    await loginPage.login('Admin', 'admin123');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 20000 });

    // 1. Open Add Employee and click Save with all name fields empty.
    await addEmployeePage.open();
    await expect(addEmployeePage.heading).toBeVisible();
    await addEmployeePage.save();
    // Two errors: First Name and Last Name (Middle Name has none)
    await expect(addEmployeePage.requiredErrors).toHaveCount(2);
    await expect(page).toHaveURL(/\/pim\/addEmployee/);

    // 2. Enter only First Name and click Save.
    await addEmployeePage.firstNameInput.fill(firstName);
    await addEmployeePage.save();
    // Only Last Name remains Required
    await expect(addEmployeePage.requiredErrors).toHaveCount(1);
    await expect(page).toHaveURL(/\/pim\/addEmployee/);

    // 3. Clear First Name, enter only Last Name and click Save.
    await addEmployeePage.firstNameInput.fill('');
    await addEmployeePage.lastNameInput.fill(lastName);
    await addEmployeePage.save();
    // Only First Name is Required
    await expect(addEmployeePage.requiredErrors).toHaveCount(1);
    await expect(page).toHaveURL(/\/pim\/addEmployee/);
    await expect(addEmployeePage.heading).toBeVisible();
  });
});
