# Data Fetching

## Rules

<rule>Use React Query v5 with queryOptions/mutationOptions</rule>
<rule>Use generated API endpoints with Zod validation</rule>
<rule>Use useSuspenseQuery with QueryBoundaries for loading/error states</rule>

---

## React Query v5 vs v4 - Key Differences

| Feature                  | v4                                  | v5                                                      |
| ------------------------ | ----------------------------------- | ------------------------------------------------------- |
| Query options factory    | Manual object creation              | `queryOptions()` helper                                 |
| Mutation options factory | Manual object creation              | `mutationOptions()` helper                              |
| Suspense queries         | `useQuery` with `suspense: true`    | `useSuspenseQuery`                                      |
| Cache time               | `cacheTime`                         | `gcTime` (garbage collection time)                      |
| Loading state            | `isLoading`                         | `isPending`                                             |
| Initial loading          | `isInitialLoading`                  | `isLoading` (only true on first fetch)                  |
| Error handling           | `onError` callback                  | `throwOnError` option                                   |
| Callbacks in hooks       | `onSuccess`, `onError`, `onSettled` | Removed from useQuery (use effects or mutate callbacks) |

---

## Architecture Overview

<!-- [TO-EDIT: Update paths to match your project structure] -->

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Data Fetching Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. API client generates endpoints (e.g., from OpenAPI spec)    │
│     └── src/shared/api/generated/endpoints/[feature]/           │
│         ├── [feature].ts      (API functions)                   │
│         └── [feature].zod.ts  (Zod schemas)                     │
│                                                                 │
│  2. Create API layer with validation                            │
│     └── src/features/[feature]/[feature].api.ts                 │
│         └── queryOptions/mutationOptions with Zod validation    │
│                                                                 │
│  3. Create React Query hooks                                    │
│     └── src/features/[feature]/[feature].queries.ts             │
│         └── useSuspenseQuery / useMutation                      │
│                                                                 │
│  4. Use in components with QueryBoundaries                      │
│     └── Automatic loading/error handling                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Create API Layer with Validation

### For Queries (GET requests)

<!-- [TO-EDIT: Update import paths to match your API client structure] -->

```typescript
// src/features/invoices/invoices.api.ts
import { getInvoice } from "#shared/api/generated/endpoints/invoice/invoice";
import { apiInvoicesaccountStatusGetResponse } from "#shared/api/generated/endpoints/invoice/invoice.zod";
import { queryOptions } from "@tanstack/react-query";

// Get the generated API client
const invoiceApi = getInvoice();

// Create queryOptions with Zod validation
export const getInvoiceAccountStatus = () =>
  queryOptions({
    queryKey: ["/invoices/account-status"],
    queryFn: async () => {
      // 1. Call the generated API function
      const response = await invoiceApi.apiInvoicesaccountStatusGet();

      // 2. Validate with Zod schema
      const accountStatus = apiInvoicesaccountStatusGetResponse.parse(response);

      // 3. Return validated data (fully typed!)
      return accountStatus;
    },
  });
```

### For Mutations (POST/PUT/DELETE requests)

<!-- [TO-EDIT: Update import paths to match your API client structure] -->

```typescript
// src/features/authentication/auth.api.ts
import { unauthenticatedAxios } from "#shared/api/unauthenticated-client";
import { mutationOptions } from "@tanstack/react-query";
import zod from "zod";

// Define validation schema
const validateLoginSchema = zod.object({
  token: zod.string(),
  refreshToken: zod.string(),
});

type LoginOptions = {
  username: string;
  password: string;
};

// Create mutationOptions with Zod validation
export const loginApi = mutationOptions({
  mutationKey: ["/auth"],
  mutationFn: async ({ username, password }: LoginOptions) => {
    const response = await unauthenticatedAxios.post("/auth", {
      login: username,
      password,
    });

    // Validate response
    return validateLoginSchema.parse(response.data);
  },
});
```

---

## Step 2: Create React Query Hooks

### For Queries with Suspense

```typescript
// src/features/invoices/invoices.queries.ts
import { getInvoiceAccountStatus } from "#features/invoices/invoices.api";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useCanTreatInvoices = () => {
  const { data: accountStatus } = useSuspenseQuery(getInvoiceAccountStatus());

  return !!accountStatus.canTreatInvoices;
};
```

### For Queries with Custom Options

```typescript
// src/shared/brand/brand.queries.ts
import { brandApi } from "#shared/brand/brand.api";
import { Duration } from "#shared/utils/duration";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useBrandHostname = () => {
  return useSuspenseQuery({
    ...brandApi,
    staleTime: Duration.days(1).toMilliseconds(),
    select: (data) => data.hostname, // Transform the data
  });
};
```

### For Mutations

```typescript
// src/features/authentication/shared/useLogin.ts
import { loginApi } from "#features/authentication/auth.api";
import { useMutation } from "@tanstack/react-query";
import { logger } from "#shared/utils/logger";

export const useManualLogin = () => {
  return useMutation({
    ...loginApi,
    onSuccess: async (response, variables) => {
      // Handle successful login
      await saveTokens({
        token: response.token,
        refreshToken: response.refreshToken,
      });
    },
    onError: (error) => {
      // Handle error
      logger.error("Login failed:", error);
    },
  });
};
```

---

## Step 3: Use with QueryBoundaries

### QueryBoundaries Component

Wrap components using `useSuspenseQuery` with `QueryBoundaries` for automatic loading and error handling:

<!-- [TO-EDIT: Update ErrorView and LoaderView imports to match your components] -->

```tsx
// src/shared/queries/QueryBoundaries.tsx
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

import { ErrorView } from "#shared/components/ErrorView";
import { LoaderView } from "#shared/components/LoaderView";

export const QueryBoundaries = ({ children }) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={ErrorView}>
          <Suspense fallback={<LoaderView />}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export const withQueryBoundaries = <T extends object>(
  Component: React.ComponentType<T>,
) => {
  return (props: T) => {
    return (
      <QueryBoundaries>
        <Component {...props} />
      </QueryBoundaries>
    );
  };
};
```

---

## Complete Example

### 1. API Layer

<!-- [TO-EDIT: Update import paths to match your API client structure] -->

```typescript
// src/features/orders/orders.api.ts
import { getOrder } from "#shared/api/generated/endpoints/order/order";
import { apiOrdersGetCollectionResponse } from "#shared/api/generated/endpoints/order/order.zod";
import { queryOptions } from "@tanstack/react-query";

const orderApi = getOrder();

type GetOrdersParams = {
  page?: number;
  status?: string;
};

export const getOrdersQueryOptions = ({ page = 1, status }: GetOrdersParams) =>
  queryOptions({
    queryKey: ["/orders", { page, status }],
    queryFn: async () => {
      const response = await orderApi.apiOrdersGetCollection({
        page,
        status,
      });

      return apiOrdersGetCollectionResponse.parse(response);
    },
  });
```

### 2. Query Hook

```typescript
// src/features/orders/orders.queries.ts
import { getOrdersQueryOptions } from "#features/orders/orders.api";
import { useSuspenseQuery } from "@tanstack/react-query";

type UseOrdersParams = {
  page?: number;
  status?: string;
};

export const useOrders = ({ page, status }: UseOrdersParams = {}) => {
  const { data: orders } = useSuspenseQuery(
    getOrdersQueryOptions({ page, status }),
  );

  return orders;
};
```

### 3. Route Component (Expo Router)

<!-- [TO-EDIT: If not using expo-router, adapt this to your routing solution] -->

```tsx
// src/app/(authenticated)/orders.tsx
import { QueryBoundaries } from "#shared/queries/QueryBoundaries";
import { useOrders } from "#features/orders/orders.queries";

const OrdersList = () => {
  const orders = useOrders({ status: "pending" });

  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => <OrderItem order={item} />}
      keyExtractor={(item) => item.id}
    />
  );
};

const OrdersPage = () => {
  return (
    <QueryBoundaries>
      <OrdersList />
    </QueryBoundaries>
  );
};

export default OrdersPage;
```

---

## Summary

| Pattern              | Usage                                      |
| -------------------- | ------------------------------------------ |
| `queryOptions()`     | Create reusable query configuration        |
| `mutationOptions()`  | Create reusable mutation configuration     |
| `useSuspenseQuery()` | Fetch data with Suspense support           |
| `useMutation()`      | Perform mutations (POST/PUT/DELETE)        |
| `QueryBoundaries`    | Wrap components for loading/error handling |
| Zod `.parse()`       | Validate API responses at runtime          |

### File Structure Convention

<!-- [TO-EDIT: Adapt this structure to your project organization] -->

```text
src/features/[feature]/
├── [feature].api.ts       # queryOptions/mutationOptions with validation
├── [feature].queries.ts   # React Query hooks (useX)
└── [feature]Page.tsx      # Components using the hooks
```

### Key Benefits

- ✅ **Type Safety**: Zod validation ensures runtime type safety
- ✅ **Automatic Loading/Error States**: QueryBoundaries handles UI states
- ✅ **Reusable Query Configs**: queryOptions can be shared and composed
- ✅ **Separation of Concerns**: Clear boundaries between API, hooks, and UI
