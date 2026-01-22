# Zod Schema Validation

This skill provides guidance for using Zod for schema validation and type inference.

## When to Use

Apply these patterns when working with `zod` version 3.x for runtime validation and TypeScript type inference.

## Key Concepts

### Basic Schema Definition

```typescript
import { z } from 'zod';

// Define a schema
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().positive().optional(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.coerce.date(),
});

// Infer the TypeScript type
type User = z.infer<typeof userSchema>;
```

### Input vs Output Types

```typescript
const schema = z.object({
  createdAt: z.coerce.date(), // Input: string/number, Output: Date
});

type SchemaInput = z.input<typeof schema>;  // { createdAt: string | number | Date }
type SchemaOutput = z.output<typeof schema>; // { createdAt: Date }
```

### Validation

```typescript
// Parse (throws on error)
const user = userSchema.parse(data);

// Safe parse (returns result object)
const result = userSchema.safeParse(data);
if (result.success) {
  console.log(result.data); // typed as User
} else {
  console.error(result.error.issues);
}
```

## Common Patterns

### API Response Validation

```typescript
const apiResponseSchema = z.object({
  data: z.array(userSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  }),
});

async function fetchUsers(): Promise<z.infer<typeof apiResponseSchema>> {
  const response = await fetch('/api/users');
  const json = await response.json();
  return apiResponseSchema.parse(json);
}
```

### Form Validation

```typescript
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

### Transformations

```typescript
const schema = z.object({
  name: z.string().transform((val) => val.trim().toLowerCase()),
  tags: z.string().transform((val) => val.split(',').map((t) => t.trim())),
});
```

### Discriminated Unions

```typescript
const eventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('click'),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal('scroll'),
    direction: z.enum(['up', 'down']),
  }),
  z.object({
    type: z.literal('keypress'),
    key: z.string(),
  }),
]);
```

### Recursive Types

```typescript
interface Category {
  name: string;
  children: Category[];
}

const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    children: z.array(categorySchema),
  })
);
```

### Extending and Merging Schemas

```typescript
const baseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
});

const userSchema = baseSchema.extend({
  email: z.string().email(),
  name: z.string(),
});

// Or merge two schemas
const combined = schema1.merge(schema2);

// Pick/omit fields
const partial = userSchema.pick({ email: true, name: true });
const withoutId = userSchema.omit({ id: true });
```

## Error Handling

```typescript
import { z, ZodError } from 'zod';

try {
  userSchema.parse(invalidData);
} catch (error) {
  if (error instanceof ZodError) {
    // Format errors for display
    const formatted = error.format();
    // Or flatten for simple error messages
    const flattened = error.flatten();
    console.log(flattened.fieldErrors);
  }
}
```

## Things to Avoid

1. **Don't create schemas inside components** - define them outside to avoid recreation on every render
2. **Don't forget `z.infer`** - always derive types from schemas, don't duplicate type definitions
3. **Don't ignore error messages** - customize them for better UX
4. **Don't overuse `.transform()`** - keep parsing and transformation separate when possible
5. **Don't use `.passthrough()` without consideration** - it can let unexpected data through
