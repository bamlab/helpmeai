# Tailwind CSS Patterns

This skill provides guidance for using Tailwind CSS effectively.

## When to Use

Apply these patterns when working with `tailwindcss` version 3.x.

## Key Concepts

### Responsive Design

Use breakpoint prefixes for responsive layouts:

```html
<!-- Mobile-first approach -->
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half on medium, third on large -->
</div>

<!-- Responsive text -->
<h1 class="text-2xl md:text-4xl lg:text-6xl">
  Responsive Heading
</h1>

<!-- Responsive flexbox -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1">Column 1</div>
  <div class="flex-1">Column 2</div>
</div>
```

### State Variants

```html
<!-- Hover, focus, active states -->
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2 active:bg-blue-700">
  Button
</button>

<!-- Group hover -->
<div class="group">
  <h3 class="group-hover:text-blue-500">Title</h3>
  <p class="group-hover:opacity-100 opacity-0">Shows on hover</p>
</div>

<!-- Peer states (sibling-based) -->
<input class="peer" type="checkbox" />
<span class="peer-checked:text-green-500">Checked!</span>
```

## Common Patterns

### Card Component

```html
<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
  <h3 class="text-lg font-semibold text-gray-900">Card Title</h3>
  <p class="mt-2 text-gray-600">Card description goes here.</p>
  <button class="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
    Action
  </button>
</div>
```

### Centering Content

```html
<!-- Flexbox centering -->
<div class="flex min-h-screen items-center justify-center">
  <div>Centered content</div>
</div>

<!-- Grid centering -->
<div class="grid min-h-screen place-items-center">
  <div>Centered content</div>
</div>
```

### Form Inputs

```html
<input
  type="text"
  class="w-full rounded-md border border-gray-300 px-4 py-2
         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
         disabled:cursor-not-allowed disabled:bg-gray-100"
  placeholder="Enter text..."
/>

<!-- With error state -->
<input
  type="text"
  class="w-full rounded-md border px-4 py-2
         border-red-500 focus:border-red-500 focus:ring-red-500/20"
/>
<p class="mt-1 text-sm text-red-500">Error message</p>
```

### Button Variants

```html
<!-- Primary -->
<button class="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Primary
</button>

<!-- Secondary -->
<button class="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Secondary
</button>

<!-- Ghost -->
<button class="rounded-md px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
  Ghost
</button>
```

### Truncation and Line Clamping

```html
<!-- Single line truncate -->
<p class="truncate">Very long text that will be truncated...</p>

<!-- Multi-line clamp -->
<p class="line-clamp-3">
  This text will be clamped to 3 lines maximum...
</p>
```

### Aspect Ratios

```html
<!-- 16:9 video container -->
<div class="aspect-video">
  <iframe class="h-full w-full" src="..."></iframe>
</div>

<!-- Square image -->
<div class="aspect-square">
  <img class="h-full w-full object-cover" src="..." />
</div>
```

### Animations

```html
<!-- Spin -->
<svg class="animate-spin h-5 w-5">...</svg>

<!-- Pulse -->
<div class="animate-pulse bg-gray-200 h-4 rounded"></div>

<!-- Custom animation -->
<div class="animate-bounce">👋</div>
```

### Dark Mode

```html
<div class="bg-white dark:bg-gray-900">
  <h1 class="text-gray-900 dark:text-white">Title</h1>
  <p class="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

## Organizing Classes

### Recommended Order

1. Layout (display, position, grid, flex)
2. Box model (width, height, padding, margin)
3. Typography (font, text)
4. Visual (background, border, shadow)
5. Interactive (hover, focus, transition)

```html
<button class="
  flex items-center justify-center
  h-10 w-full px-4
  text-sm font-medium text-white
  bg-blue-500 rounded-md shadow-sm
  hover:bg-blue-600 focus:ring-2 transition-colors
">
  Button
</button>
```

### Using @apply for Repeated Patterns

```css
/* In your CSS file */
@layer components {
  .btn-primary {
    @apply rounded-md bg-blue-500 px-4 py-2 font-medium text-white
           hover:bg-blue-600 focus:outline-none focus:ring-2
           focus:ring-blue-500 focus:ring-offset-2;
  }
}
```

## Things to Avoid

1. **Don't use `@apply` for everything** - it defeats the purpose of utility-first
2. **Don't forget `min-h-screen`** for full-height layouts
3. **Don't use arbitrary values excessively** - stick to the design system
4. **Don't forget dark mode variants** if your app supports it
5. **Don't skip the `sr-only` class** for accessibility (screen reader only text)
