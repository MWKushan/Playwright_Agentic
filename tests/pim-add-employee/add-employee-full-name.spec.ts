// spec: specs/pim-add-and-search-employee.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { AddEmployeePage } from '../pages/add-employee.page';
import { LoginPage } from '../pages/login.page';

test.describe('Add Employee - Happy Paths', () => {
  test('Add employee with first, middle and last name', async ({ page }) => {
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const lastName = faker.person.lastName();
    // The pre-filled default Employee Id often collides on the shared demo site ("Employee Id already exists"),
    // so use a unique numeric Id (max 10 chars) instead.
    const employeeId = Date.now().toString().slice(-8);
    const loginPage = new LoginPage(page);
    const addEmployeePage = new AddEmployeePage(page);

    await loginPage.open();
    await loginPage.login('Admin', 'admin123');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 20000 });

    // 1. Click PIM in the side menu, then click the Add Employee tab.
    await addEmployeePage.open();
    await expect(page).toHaveURL(/\/pim\/addEmployee/);
    await expect(addEmployeePage.heading).toBeVisible();
    await expect(addEmployeePage.firstNameInput).toBeVisible();
    await expect(addEmployeePage.middleNameInput).toBeVisible();
    await expect(addEmployeePage.lastNameInput).toBeVisible();
    await expect(page.getByRole('checkbox')).not.toBeChecked();
    await expect(addEmployeePage.saveButton).toBeVisible();
    await expect(addEmployeePage.cancelButton).toBeVisible();

    // 2. Enter the generated first, middle, and last names. Click Save.
    await addEmployeePage.fillName(firstName, middleName, lastName);
    // Employee Id input has no accessible name; it is the only unnamed textbox on the Add Employee form
    await addEmployeePage.employeeIdInput.fill(employeeId);
    await addEmployeePage.save();

    await expect(page).toHaveURL(/\/pim\/viewPersonalDetails/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
    await expect(addEmployeePage.firstNameInput).toHaveValue(firstName);
    await expect(addEmployeePage.middleNameInput).toHaveValue(middleName);
    await expect(addEmployeePage.lastNameInput).toHaveValue(lastName);
  });
});
