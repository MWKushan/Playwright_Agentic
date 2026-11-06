# Playwright Test Agents Practice Project

This practice project uses Playwright Test Agents with the public OrangeHRM demo site. The tests cover adding employees and searching for employees in the PIM module. The demo site is shared and may be slow or reset its data periodically, so use unique test data and avoid relying on records created by another test.

## What are Playwright Test Agents?

Playwright Test (version 1.56 and later) provides three AI agents that support the test automation workflow:

| Agent | What it does |
| --- | --- |
| **Planner** | Explores an app in a real browser and writes a Markdown test plan. |
| **Generator** | Turns selected plan scenarios into Playwright tests, using locators observed on the live page. |
| **Healer** | Re-runs failing tests and attempts to repair issues such as broken locators. |

The agents run through an AI coding tool and use the Playwright MCP server to control a browser.

## What this project uses

- Playwright 1.64.1 with TypeScript
- The public OrangeHRM demo site: `https://opensource-demo.orangehrmlive.com/`
- OrangeHRM's PIM module: add employee and search employee
- Playwright Test Agents configured for Claude Code

## Step-by-step walkthrough

### 1. Create a practice project

Start a fresh practice project and initialize Playwright:

```powershell
npm init playwright@latest
```

Choose TypeScript, keep the `tests` folder, and install the browsers. Git can be initialized to track the setup and subsequent changes:

```powershell
git init
git add .
git commit -m "Initial Playwright setup"
```

### 2. Check the Playwright version

```powershell
npx playwright --version
```

Playwright Test Agents require version 1.56 or later. This project uses 1.64.1.

### 3. Add the agents

```powershell
npx playwright init-agents --loop=claude
```

This setup creates:

- `.claude/agents/` with planner, generator, and healer agent definitions
- `.mcp.json`, which configures the Playwright MCP connection
- `specs/README.md` and the `specs/` folder for test plans
- `tests/seed.spec.ts`, a seed test for establishing a known starting state

Review the agent definition files to understand their instructions and available tools.

### 4. Write a seed test

The seed test logs in and verifies that the application reaches the Dashboard:

```ts
import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/');
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
```

These are public demo credentials, not credentials for a private account. Never put real credentials in a seed test or commit them to source control.

### 5. Start the AI coding tool and approve the setup

Start Claude Code from the project root:

```powershell
claude
```

Review folder trust and MCP server prompts carefully. Approve only the project and tools you intend to use; avoid automatically approving all future servers or actions.

### 6. Ask the planner to explore

For example:

```text
Use the playwright-test-planner agent. Use tests/seed.spec.ts as the seed test. Explore the PIM module of the OrangeHRM demo site and create a test plan for adding a new employee and searching for that employee by name. Save the plan in the specs folder.
```

Review the generated plan before implementing it. Make expected results specific, split scenarios that cover too many behaviors, remove overlap where appropriate, and identify any fixtures that need to be created.

### 7. Generate selected tests

The project test plan is in [specs/pim-add-and-search-employee.md](specs/pim-add-and-search-employee.md). Select only the scenarios you are ready to automate. A generator request can specify constraints such as:

```text
Use the playwright-test-generator agent.

Read specs/pim-add-and-search-employee.md and generate tests only for the selected scenarios. Use tests/seed.spec.ts as the seed for login.

Rules:
- Each test creates its own unique data and does not depend on another test.
- Use role-, label-, or placeholder-based locators. Do not use CSS class selectors or waitForTimeout.
- Use the Page Object Model: put locators and actions in page classes and keep assertions in the spec files.

When you finish, list the files you created and anything you were unsure about.
```

This project keeps page objects in `tests/pages/` and test specs in the relevant `tests/` subfolders.

### 8. Run and review tests

Run the PIM tests in Chromium:

```powershell
npx playwright test tests/pim-add-employee/ tests/pim-search-employee/ --project=chromium
```

To run tests sequentially, add `--workers=1`. The OrangeHRM demo site is shared and can be slow, so test duration and behavior may vary.

Review failures and diffs rather than weakening assertions or skipping tests to make a run pass.

### 9. Diagnose a broken locator

When the Add Employee page object's Save locator was changed to look for a `Submit` button, both add-employee tests failed: the page actually labels the button **Save**. The test report and trace showed the failing locator and the page's accessible snapshot.

The healer did not run automatically after the failure. An attempt to start it in this session failed because its configured model was unavailable. After inspecting the failure artifacts, the locator was corrected to:

```ts
page.getByRole('button', { name: 'Save' });
```

Both focused add-employee tests passed after that correction. The page object is in [tests/pages/add-employee.page.ts](tests/pages/add-employee.page.ts).

### 10. Review any healer changes

If you invoke the healer, check its changes before accepting them:

- Run `git diff` and confirm the changes address the failure.
- Make sure assertions were not weakened and tests were not skipped.
- Re-run the affected tests yourself; an agent's report is not a substitute for verification.
- Review what the agent left unchanged. A passing but fragile locator may still need separate improvement.

For example, the Employee Id field locator may be more brittle than a properly associated label locator. Improve it deliberately and verify it against the live page rather than changing it as an unrelated part of a healer fix.
