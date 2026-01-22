# Zustand State Management

This skill provides guidance for managing state with Zustand.

## When to Use

Apply these patterns when working with `zustand` version 4.x for lightweight state management.

## Key Concepts

### Basic Store

```typescript
import { create } from 'zustand';

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// Usage in component
const { count, increment } = useCounterStore();
```

### Selecting State (Performance)

```typescript
// Bad - re-renders on any state change
const store = useStore();

// Good - only re-renders when count changes
const count = useStore((state) => state.count);

// Multiple selectors
const { count, increment } = useStore((state) => ({
  count: state.count,
  increment: state.increment,
}));

// With shallow comparison for object selections
import { shallow } from 'zustand/shallow';

const { count, name } = useStore(
  (state) => ({ count: state.count, name: state.name }),
  shallow
);
```

## Common Patterns

### Async Actions

```typescript
interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.getUser(id);
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

### Persist Middleware

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist<SettingsStore>(
    (set) => ({
      theme: 'light',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'settings-storage', // localStorage key
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
);
```

### Immer Middleware (for complex updates)

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface TodoStore {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
}

export const useTodoStore = create(
  immer<TodoStore>((set) => ({
    todos: [],
    addTodo: (text) =>
      set((state) => {
        state.todos.push({ id: crypto.randomUUID(), text, done: false });
      }),
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) todo.done = !todo.done;
      }),
  }))
);
```

### Devtools Middleware

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools<Store>(
    (set) => ({
      // ... store definition
    }),
    { name: 'MyStore' } // Shows in Redux DevTools
  )
);
```

### Combining Middlewares

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create(
  devtools(
    persist(
      immer<Store>((set) => ({
        // ... store definition
      })),
      { name: 'storage-key' }
    ),
    { name: 'StoreName' }
  )
);
```

### Slices Pattern (for large stores)

```typescript
// userSlice.ts
export interface UserSlice {
  user: User | null;
  setUser: (user: User) => void;
}

export const createUserSlice = (set): UserSlice => ({
  user: null,
  setUser: (user) => set({ user }),
});

// settingsSlice.ts
export interface SettingsSlice {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const createSettingsSlice = (set): SettingsSlice => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
});

// store.ts
import { create } from 'zustand';

type Store = UserSlice & SettingsSlice;

export const useStore = create<Store>()((...args) => ({
  ...createUserSlice(...args),
  ...createSettingsSlice(...args),
}));
```

### Access Store Outside React

```typescript
// Get current state
const count = useCounterStore.getState().count;

// Subscribe to changes
const unsubscribe = useCounterStore.subscribe((state) => {
  console.log('State changed:', state);
});

// Update state outside React
useCounterStore.getState().increment();
```

## Things to Avoid

1. **Don't select entire store** - always use selectors to pick specific state
2. **Don't forget shallow comparison** when selecting multiple values as an object
3. **Don't put derived state in store** - compute it in selectors or components
4. **Don't overuse Immer** - simple updates are fine with spread operator
5. **Don't create stores inside components** - define them at module level
