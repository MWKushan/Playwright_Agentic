# PIM - Add Employee and Search Employee

## Application Overview

Test plan for the OrangeHRM demo site (https://opensource-demo.orangehrmlive.com) PIM module: PIM > Add Employee (first/middle/last name, auto-generated Employee Id, optional photo, Create Login Details toggle, Save, redirect to Personal Details) and PIM > Employee List search (Employee Name autocomplete, Search, Reset, results table, No Records Found). Assumptions: seed test tests/seed.spec.ts logs in as Admin so each scenario starts on the dashboard. The demo site is shared and public and its data resets periodically, so every scenario must use unique, timestamp-suffixed data (e.g. first name "Auto<yyyyMMddHHmmss>", last name "Tester<ts>"), must create its own employee rather than depend on another scenario, and must not assume the default Employee Id (pre-filled, e.g. "0683") is stable. Letters-only suffixes may be safer in names; Employee Ids max 10 chars so use a numeric suffix such as the last 8 digits of the timestamp. Observed Add Employee form: photo Choose File (jpg/png/gif up to 1MB), First Name, Middle Name, Last Name (Employee Full Name*), Employee Id (pre-filled), Create Login Details checkbox, Cancel and Save buttons. Behaviours listed as expected for validation limits (name max 30 chars, Employee Id max 10 chars, username min 5 chars, password min 7 chars) reflect standard OrangeHRM 5.x and should be confirmed during execution.

## Test Scenarios

### 1. Add Employee - Happy Paths

**Seed:** `tests/seed.spec.ts`

#### 1.1. Add employee with first, middle and last name

**File:** `tests/pim-add-employee/add-employee-full-name.spec.ts`

**Steps:**
  1. Click PIM in the side menu, then click the Add Employee tab.
    - expect: Add Employee page is shown with First/Middle/Last Name fields, Employee Id pre-filled, Create Login Details off, Save and Cancel buttons.
  2. Enter unique First Name (Auto<ts>), Middle Name (Mid), Last Name (Tester<ts>). Leave Employee Id as default. Click Save.
    - expect: A success toast 'Successfully Saved' appears.
    - expect: Browser redirects to /pim/viewPersonalDetails/empNumber/<n>.
    - expect: Personal Details page shows the entered first, middle and last names and the same Employee Id.

#### 1.2. Add employee with only required fields (no middle name)

**File:** `tests/pim-add-employee/add-employee-required-only.spec.ts`

**Steps:**
  1. Open PIM > Add Employee. Enter unique First Name and Last Name only. Click Save.
    - expect: Employee saved successfully and Personal Details page opens.
    - expect: Middle Name field is empty on Personal Details.

#### 1.3. Add employee with custom employee ID

**File:** `tests/pim-add-employee/add-employee-custom-id.spec.ts`

**Steps:**
  1. Open Add Employee. Enter unique names. Clear Employee Id and type a unique numeric ID (e.g. last 8 digits of timestamp). Click Save.
    - expect: Employee saved and Personal Details displays the custom Employee Id.

#### 1.4. Add employee with a valid profile photo

**File:** `tests/pim-add-employee/add-employee-photo.spec.ts`

**Steps:**
  1. Open Add Employee. Upload a small valid PNG (under 1MB) via the photo Choose File input. Enter unique names. Click Save.
    - expect: Photo preview updates before saving.
    - expect: Employee saved and Personal Details shows the uploaded photo instead of the default avatar.

#### 1.5. Add employee with Create Login Details enabled

**File:** `tests/pim-add-employee/add-employee-login-details.spec.ts`

**Steps:**
  1. Open Add Employee and enter unique names. Toggle Create Login Details on.
    - expect: Username, Password, Confirm Password and Status (Enabled/Disabled) fields appear; Status defaults to Enabled.
  2. Enter unique username (min 5 chars), password meeting the policy (e.g. 'Passw0rd!x1'), identical confirm password. Click Save.
    - expect: Employee saved and redirected to Personal Details.
  3. Toggle test variant: enable then disable the toggle before saving.
    - expect: Login fields are hidden again and save succeeds without login details.

#### 1.6. Cancel Add Employee discards data

**File:** `tests/pim-add-employee/add-employee-cancel.spec.ts`

**Steps:**
  1. Open Add Employee, enter unique names, click Cancel.
    - expect: User is returned to the Employee List page.
  2. Search the Employee List for the entered name.
    - expect: No Records Found - the employee was not created.

### 2. Add Employee - Validation and Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 2.1. Required first and last name validation

**File:** `tests/pim-add-employee/add-employee-required-validation.spec.ts`

**Steps:**
  1. Open Add Employee and click Save with all name fields empty.
    - expect: 'Required' error appears under First Name and Last Name (red borders).
    - expect: Middle Name shows no error.
    - expect: Page stays on Add Employee; no employee created.
  2. Enter only First Name and click Save.
    - expect: Only Last Name shows 'Required'.
  3. Clear First Name, enter only Last Name and click Save.
    - expect: Only First Name shows 'Required'.

#### 2.2. Whitespace-only names are rejected

**File:** `tests/pim-add-employee/add-employee-whitespace.spec.ts`

**Steps:**
  1. Enter spaces in First Name and Last Name, click Save.
    - expect: Required validation is shown (or save is blocked); no employee is created.

#### 2.3. Duplicate employee ID is rejected

**File:** `tests/pim-add-employee/add-employee-duplicate-id.spec.ts`

**Steps:**
  1. Create employee A with unique custom Employee Id X (precondition within this test).
    - expect: Employee A saved.
  2. Open Add Employee again, enter different unique names, set Employee Id to X.
    - expect: After leaving the field, 'Employee Id already exists' error is displayed.
  3. Click Save.
    - expect: Save is blocked; user stays on Add Employee; no second employee created.

#### 2.4. Field length limits for names

**File:** `tests/pim-add-employee/add-employee-name-length.spec.ts`

**Steps:**
  1. Enter 30 characters in each of First, Middle, Last Name.
    - expect: No validation errors; Save succeeds.
  2. Open Add Employee and enter 31 characters in First Name, then Middle Name, then Last Name.
    - expect: 'Should not exceed 30 characters' error appears under each offending field; Save does not submit.

#### 2.5. Employee ID length limit

**File:** `tests/pim-add-employee/add-employee-id-length.spec.ts`

**Steps:**
  1. Enter an 11-character Employee Id with valid names.
    - expect: 'Should not exceed 10 characters' error is shown and Save is blocked.
  2. Enter a 10-character unique Employee Id.
    - expect: No error; Save succeeds.
  3. Clear the Employee Id and save with valid names.
    - expect: Observe and record behavior (auto-assigned ID or validation); verify no crash.

#### 2.6. Special characters and unicode in names

**File:** `tests/pim-add-employee/add-employee-special-chars.spec.ts`

**Steps:**
  1. Enter names such as "O'Brien<ts>", "Zoë<ts>" and hyphenated names. Save.
    - expect: Employee saved and names display correctly (no HTML interpretation or escaping artifacts).
  2. Enter '<script>alert(1)</script>' as First Name and save (or note rejection).
    - expect: No script executes; value is shown as plain text or rejected.

#### 2.7. Login details validation

**File:** `tests/pim-add-employee/add-employee-login-validation.spec.ts`

**Steps:**
  1. Enable Create Login Details, enter valid names, leave Username/Password/Confirm empty, click Save.
    - expect: 'Required' errors on Username, Password and Confirm Password; save blocked.
  2. Enter username of 4 characters.
    - expect: 'Should be at least 5 characters' error.
  3. Enter password shorter than 7 characters or lacking required character types.
    - expect: Password strength/length error shown.
  4. Enter mismatched Confirm Password.
    - expect: 'Passwords do not match' error shown.
  5. Enter a username that already exists (e.g. 'Admin').
    - expect: 'Username already exists' error shown.

#### 2.8. Invalid photo uploads

**File:** `tests/pim-add-employee/add-employee-invalid-photo.spec.ts`

**Steps:**
  1. Upload a .txt or .pdf file as the photo.
    - expect: 'File type not allowed' error appears.
  2. Upload an image larger than 1MB.
    - expect: 'Attachment Size Exceeded' error appears; Save does not persist the file.

### 3. Employee List - Search

**Seed:** `tests/seed.spec.ts`

#### 3.1. Search for newly added employee by full name via autocomplete

**File:** `tests/pim-search-employee/search-by-full-name.spec.ts`

**Steps:**
  1. Precondition within test: add an employee with unique first/last name (Auto<ts> Tester<ts>).
    - expect: Employee created.
  2. Go to PIM > Employee List. Type the first name in Employee Name.
    - expect: Autocomplete dropdown lists matching employees including the new one.
  3. Select the suggestion and click Search.
    - expect: Results table shows '(1) Record Found' with the employee's Id, First (& Middle) Name and Last Name.

#### 3.2. Search by typed name without selecting a suggestion

**File:** `tests/pim-search-employee/search-typed-name.spec.ts`

**Steps:**
  1. Create an employee, type the full name in Employee Name but do not select a suggestion, click Search.
    - expect: Either results are filtered by typed text, or an 'Invalid' error appears on the field; record observed behavior and assert consistency.

#### 3.3. Partial name search

**File:** `tests/pim-search-employee/search-partial-name.spec.ts`

**Steps:**
  1. Create employee with unique first name. In Employee List type the first 4-5 characters of the first name.
    - expect: Autocomplete shows employee(s) whose names contain that text, including the new one.
  2. Select the suggestion and Search.
    - expect: The employee appears in the results table.
  3. Repeat with a partial last name and with a case-changed (lowercase/uppercase) name.
    - expect: Matching is case-insensitive and finds the employee.

#### 3.4. Search for non-existent name shows No Records Found

**File:** `tests/pim-search-employee/search-nonexistent.spec.ts`

**Steps:**
  1. In Employee List type 'Zzzz<ts>NoSuchPerson' in Employee Name.
    - expect: Autocomplete shows 'No Records Found'.
  2. Click Search.
    - expect: Field shows 'Invalid' validation or the table displays 'No Records Found' toast and empty list; no rows returned.

#### 3.5. Search by Employee Id

**File:** `tests/pim-search-employee/search-by-id.spec.ts`

**Steps:**
  1. Create employee with unique Employee Id. In Employee List enter that Id in the Employee Id filter and click Search.
    - expect: Exactly one record is found with the matching Id.

#### 3.6. Reset clears filters and restores full list

**File:** `tests/pim-search-employee/search-reset.spec.ts`

**Steps:**
  1. Create an employee, search for it by name (one record shown).
    - expect: Filtered results displayed.
  2. Click Reset.
    - expect: Employee Name and other filters are cleared; table reloads with full list (many records).

#### 3.7. Search with no criteria lists all employees

**File:** `tests/pim-search-employee/search-empty-criteria.spec.ts`

**Steps:**
  1. Open Employee List and click Search without any filters.
    - expect: All employees are listed with pagination and a record count greater than one.

#### 3.8. Results table content and row actions

**File:** `tests/pim-search-employee/search-results-table.spec.ts`

**Steps:**
  1. Search for a newly created employee.
    - expect: Table columns Id, First (& Middle) Name, Last Name, Job Title, Employment Status, Sub Unit, Supervisor, Actions are present; middle name appears with first name.
  2. Click the row.
    - expect: Personal Details page of that employee opens with matching data.

#### 3.9. Search filters combined with name

**File:** `tests/pim-search-employee/search-combined-filters.spec.ts`

**Steps:**
  1. Create employee, search by name together with Include = 'Current Employees Only'.
    - expect: Employee is returned.
  2. Change Include to 'Past Employees Only' and Search.
    - expect: No Records Found for this employee.

#### 3.10. Special characters in search input

**File:** `tests/pim-search-employee/search-special-chars.spec.ts`

**Steps:**
  1. Type %, ', <script> and very long (100+) strings in Employee Name and Search.
    - expect: No errors or script execution; No Records Found or Invalid validation shown; page remains usable.
