# React Hook Form Patterns

This skill provides guidance for building performant forms with React Hook Form.

## When to Use

Apply these patterns when working with `react-hook-form` version 7.x.

## Key Concepts

### Basic Setup

```typescript
import { useForm } from 'react-hook-form';

interface FormData {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    await loginUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: 'Email is required' })} />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        type="password"
        {...register('password', { required: true, minLength: 8 })}
      />
      {errors.password && <span>Password must be at least 8 characters</span>}

      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
};
```

### With Zod Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

## Common Patterns

### Controlled Components

```typescript
import { useForm, Controller } from 'react-hook-form';

const { control } = useForm();

<Controller
  name="category"
  control={control}
  render={({ field }) => (
    <Select
      {...field}
      options={categories}
    />
  )}
/>
```

### Form Arrays

```typescript
import { useForm, useFieldArray } from 'react-hook-form';

interface FormData {
  users: { name: string; email: string }[];
}

const { control, register } = useForm<FormData>({
  defaultValues: { users: [{ name: '', email: '' }] },
});

const { fields, append, remove } = useFieldArray({
  control,
  name: 'users',
});

return (
  <>
    {fields.map((field, index) => (
      <div key={field.id}>
        <input {...register(`users.${index}.name`)} />
        <input {...register(`users.${index}.email`)} />
        <button type="button" onClick={() => remove(index)}>Remove</button>
      </div>
    ))}
    <button type="button" onClick={() => append({ name: '', email: '' })}>
      Add User
    </button>
  </>
);
```

### Watch Values

```typescript
const { watch, register } = useForm();

// Watch specific field
const email = watch('email');

// Watch multiple fields
const [email, password] = watch(['email', 'password']);

// Watch all fields
const allValues = watch();

// Watch with callback (for side effects)
useEffect(() => {
  const subscription = watch((value, { name, type }) => {
    console.log(value, name, type);
  });
  return () => subscription.unsubscribe();
}, [watch]);
```

### Set Values Programmatically

```typescript
const { setValue, reset, getValues } = useForm();

// Set single value
setValue('email', 'user@example.com');

// Set with validation
setValue('email', 'user@example.com', { shouldValidate: true });

// Reset entire form
reset({ email: '', password: '' });

// Reset to fetched data
useEffect(() => {
  fetchUser().then((user) => reset(user));
}, [reset]);
```

### Error Handling

```typescript
const {
  setError,
  clearErrors,
  formState: { errors },
} = useForm();

// Set error manually (e.g., from API response)
const onSubmit = async (data: FormData) => {
  try {
    await submitForm(data);
  } catch (error) {
    if (error.field === 'email') {
      setError('email', {
        type: 'server',
        message: 'Email already exists',
      });
    } else {
      setError('root', {
        type: 'server',
        message: 'Something went wrong',
      });
    }
  }
};

// Display root error
{errors.root && <div className="error">{errors.root.message}</div>}
```

## Performance Tips

### Use `useFormContext` for Nested Components

```typescript
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

// Parent
const methods = useForm();
<FormProvider {...methods}>
  <NestedInput />
</FormProvider>

// Child - no prop drilling needed
const NestedInput = () => {
  const { register } = useFormContext();
  return <input {...register('nested.field')} />;
};
```

### Isolate Re-renders with `useWatch`

```typescript
import { useWatch } from 'react-hook-form';

// Only this component re-renders when 'email' changes
const EmailPreview = ({ control }) => {
  const email = useWatch({ control, name: 'email' });
  return <span>Preview: {email}</span>;
};
```

## Things to Avoid

1. **Don't use `watch()` in render** without memoization - it triggers re-renders
2. **Don't forget `key={field.id}`** in field arrays - use the id from useFieldArray
3. **Don't mutate field array directly** - always use `append`, `remove`, `update` methods
4. **Don't skip `defaultValues`** - always provide them for controlled behavior
5. **Don't forget to unsubscribe** from watch subscriptions in useEffect
