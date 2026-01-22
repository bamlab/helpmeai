---
description: MUST USE WHENEVER WRITING OR EDITING TESTS
alwaysApply: false
---

# Testing Strategy

## Why Write Tests?

- Verify that the app works as intended
- Gives confidence about regressions
- Helps better understand and document the code we write
- Encourages good architecture

---

## 1. Choose What to Test

### [ ] Tests cover the user story and its acceptance criteria / business rules

✅ **Good:** A test that goes from API calls to data display

### [ ] They test logic (= they don't "duplicate" the code)

❌ **Bad:** Tests on all cases of a basic mapping when they weren't important enough to be detailed in the acceptance criteria

---

## 2. Choose the Unit to Test

### The trade-off in the unit we test

**If they are too micro:**

- They are easy to write
- And are fast
- But they don't cover much
- We'll spend our time rewriting them

**If they are too macro:**

- Non-reproducible
- Heavy to write, to create all the context, etc.
- Slow to run

### [ ] The tested unit includes the entire "flow" / all the code corresponding to the tested rule

✅ **Good:** A component that directly makes the queries it needs

✅ **Good:** A number formatting function

❌ **Bad:** An error modal without the query that triggers the error

❌ **Bad:** A component that unconditionally displays things based on its props

❌ **Bad:** A hook that isn't intended to be reused

### [ ] The test should not need to be rewritten following a future refactor

> **In Practice**
>
> - **By default** → Test on a **screen / large component**
> - **On a reusable component** → tests on the component that cover **edge cases**, and the component runs in screen tests / other component tests
> - **If many diverging cases to test** → Unit tests on an **isolated pure function** in addition to the main cases tested on the large component

---

## 3. Choose the Setup and Assertions

### [ ] Our own code is not mocked

### [ ] Assertions are at the boundaries of the unit we're testing and never "inside"

**What to assert on:**

✅ Render result

✅ Network calls _(on a test where the server is not in the `unit`)_

✅ Navigation actions related to logic _(on a test where navigation is not in the `unit`)_

✅ Native calls

⚠️ Check react-query cache content (unless the "expected" for the tested unit is that it fills the cache for another unit)

⚠️ Check a value in a store (unless we have to do too much work to get around it otherwise)

**Examples:**

✅ **Good:** Test that the user has the authenticated status after login: we cannot test the RootNavigator that manages what we display when we switch to authenticated status.

❌ **Bad:** Test that we receive a certain instance of an error: we can easily put the error modal in the test to observe something visual.

❌ **Bad:** Check a prop of a sub-component of the tested component

## 4. The test is pleasant to read and maintain

You should always be able to read the test and understand what it is doing in one glance.

❌ **Bad:** The test shouldn't contain redundant or unnecessary logic for the reader to understand.

```tsx
it("displays the user profile", () => {
  const navigateToAddTicketsMock = jest.fn();
  const navigateToSelectTicketsMock = jest.fn();
  mockServer.get<TransactionSearchResponseDto>("/api/transactions", {
    deductibleVatAmount: 0,
    netAmountTtcEligibleToDeductibleVat: 0,
    netAmountTtcNotEligibleToDeductibleVat: 0,
    eligibleTransactions: [],
    notEligibleTransactions: [],
  });

  await renderWithProviders(
    <MyTicketsPage
      navigateToAddTickets={navigateToAddTicketsMock}
      navigateToSelectTickets={navigateToSelectTicketsMock}
      navigateToTicketDetails={() => {}}
    />,
  );

  const addTicketButton = await screen.findByTestId("fallback.button");
  await userEvent.press(addTicketButton);

  expect(navigateToAddTicketsMock).toHaveBeenCalledTimes(1);
  expect(screen.getByText(t`myTicketsPage.noTickets.title`)).toBeOnTheScreen();
});
```

✅ **Good:** The test is easy to read and understand.

```tsx
it("displays the user profile", () => {
  givenUserHasNoTransactions();

  const { navigateToAddTickets, navigateToSelectTickets } =
    renderMyTicketsPage();
  await userEvent.press(screen.getByTestId("fallback.button"));

  expectNavigationToAddTickets();
});

// ... logic is now in helpers, put helpers at the bottom of the test file
const givenUserHasNoTransactions = () => {
  // ...
};

const renderMyTicketsPage = () => {
  // ...
};

const expectNavigationToAddTickets = () => {
  // ...
};
```

Its even better if you share the logic through tests, passing in the helpers the parameters that are important for the test.

Another example:

❌ **Bad:** The test is checking that all the texts are displayed on the screen.

```tsx
it("displays the user profile", () => {
  givenUserHasNoTransactions();

  const { navigateToAddTickets, navigateToSelectTickets } =
    renderMyTicketsPage();
  await userEvent.press(screen.getByTestId("fallback.button"));
  expect(screen.getByText(t`myTicketsPage.noTickets.title`)).toBeOnTheScreen();
  expect(
    screen.getByText(t`myTicketsPage.noTickets.description`),
  ).toBeOnTheScreen();
  expect(screen.getByText(t`myTicketsPage.noTickets.button`)).toBeOnTheScreen();
  expect(screen.getByText(t`myTicketsPage.noTickets.label`)).toBeOnTheScreen();
});
```

✅ **Good:** The test is using a snapshot to check the design.

```tsx
it("displays the user profile", () => {
  givenUserHasNoTransactions();

  const { navigateToAddTickets, navigateToSelectTickets } =
    renderMyTicketsPage();
  await userEvent.press(screen.getByTestId("fallback.button"));
  expect(screen).toMatchSnapshot();
});
```

Only use a snapshot once per screen. Its heavy so use it wisely. We don't need to re-check the texts / design in every test.

## Good to know

<!-- [TO-EDIT with your testing utilities paths and setup] -->

- To mock API calls, you can use the `mockServer` from src/shared/testing/mockServer.ts
- To render components with providers, you can use the `renderWithProviders` from src/shared/testing/render.tsx or the `renderAsyncWithProviders` for async tests with suspense.

<!-- [TO-EDIT with your test runner and testing library] -->

- The tests are written with Bun and React Native Testing Library.

<!-- [TO-EDIT with your external libraries to mock] -->

- External libraries that are not directly tested should be mocked (expo-router, mmkv, ...). If the mock is complex and reusable, put it in the **mocks** folder.

<!-- /TO-EDIT -->

- The namings MUST be explicit so NEVER add comments in the tests
- Don't use should in your test names, directly start with a verb

## Running tests

<!-- [TO-EDIT with your test runner command] -->

Use `bunx jest` to run the tests.

<!-- /TO-EDIT -->

With our setup, jest is clearing mocks and queryClient between each tests, so NEVER reimplement this logic.
