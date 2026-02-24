# Enweb Design System Guide

This guide explains how to customize the design system for the Enweb platform.

## Overview

The design system is configured in [src/index.css](src/index.css) using Tailwind CSS v4's `@theme` directive. This allows you to customize colors, border radius, and other design tokens in a centralized location.

## Customizing Colors

### Primary Color

The primary color is used throughout the application for:
- Buttons and CTAs
- Links and navigation highlights
- Brand identity elements
- Focus states

To change the primary color:

1. Open [src/index.css](src/index.css)
2. Find the `--color-primary-*` variables in the `@theme` section
3. Replace the values with your desired color palette

**Current Color: Blue (#4c82b8)**
```css
@theme {
  --color-primary-50: #f0f5fa;
  --color-primary-100: #e0ebf5;
  --color-primary-200: #c1d7eb;
  --color-primary-300: #a0c1df;
  --color-primary-400: #7aa9d1;
  --color-primary-500: #5c91c3;
  --color-primary-600: #4c82b8;
  --color-primary-700: #3d6894;
  --color-primary-800: #345575;
  --color-primary-900: #2d4860;
  --color-primary-950: #1e2f40;
}
```

**Color Palette Generators:**
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors) - Use any built-in Tailwind color
- [UIColors](https://uicolors.app/create) - Generate full palettes from a single color
- [Coolors](https://coolors.co/) - Color palette generator

### Secondary Color

The secondary color is available for:
- Secondary actions
- Accent elements
- Success states
- Supporting UI elements

To change the secondary color, update the `--color-secondary-*` variables in the same way.

**Current Color: Blue (#4c82b8) - Same as Primary**
```css
@theme {
  --color-secondary-50: #f0f5fa;
  --color-secondary-100: #e0ebf5;
  --color-secondary-200: #c1d7eb;
  --color-secondary-300: #a0c1df;
  --color-secondary-400: #7aa9d1;
  --color-secondary-500: #5c91c3;
  --color-secondary-600: #4c82b8;
  --color-secondary-700: #3d6894;
  --color-secondary-800: #345575;
  --color-secondary-900: #2d4860;
  --color-secondary-950: #1e2f40;
}
```

### Text Colors

The design system includes specific text colors for consistency:

- **Primary Text**: `#222529` - Used for main content and headings
- **Secondary Text**: `#87888a` - Used for supporting text and labels
- **Disabled Text**: `#87888a` - Used for disabled states

```css
@theme {
  --color-text-primary: #222529;
  --color-text-secondary: #87888a;
  --color-text-disabled: #87888a;
}
```

## Customizing Border Radius

Border radius affects the roundness of buttons, cards, inputs, and other UI elements.

Current values:
- `--radius-sm`: 0.25rem (4px) - Small elements
- `--radius-DEFAULT`: 0.5rem (8px) - Default roundness
- `--radius-md`: 0.5rem (8px) - Medium elements
- `--radius-lg`: 0.75rem (12px) - Large elements
- `--radius-xl`: 1rem (16px) - Extra large elements
- `--radius-2xl`: 1.5rem (24px) - Very large elements
- `--radius-3xl`: 2rem (32px) - Extremely large elements
- `--radius-full`: 9999px - Fully rounded (pills, circles)

**Example: More Rounded UI**
```css
@theme {
  --radius-sm: 0.5rem;
  --radius-DEFAULT: 0.75rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --radius-3xl: 3rem;
  --radius-full: 9999px;
}
```

**Example: Sharp/Minimal UI**
```css
@theme {
  --radius-sm: 0.125rem;
  --radius-DEFAULT: 0.25rem;
  --radius-md: 0.25rem;
  --radius-lg: 0.375rem;
  --radius-xl: 0.5rem;
  --radius-2xl: 0.75rem;
  --radius-3xl: 1rem;
  --radius-full: 9999px;
}
```

## Using Colors in Components

### Available Classes

Once you've configured your primary and secondary colors, use these classes:

**Text Colors:**
```tsx
<p className="text-primary-600">Primary text</p>
<p className="text-secondary-500">Secondary text</p>
```

**Background Colors:**
```tsx
<div className="bg-primary-100">Light primary background</div>
<div className="bg-primary-600">Primary background</div>
<div className="bg-secondary-500">Secondary background</div>
```

**Border Colors:**
```tsx
<div className="border border-primary-500">Primary border</div>
<div className="border-2 border-secondary-600">Secondary border</div>
```

**Hover States:**
```tsx
<button className="bg-primary-600 hover:bg-primary-700">
  Hover me
</button>
```

**Focus States:**
```tsx
<input className="focus:ring-primary-500 focus:border-primary-500" />
```

## Quick Color Schemes

### Professional Blue (#4c82b8) (Current)
Currently configured in [src/index.css](src/index.css)
```css
--color-primary-500: #5c91c3;
--color-primary-600: #4c82b8;
```

### Corporate Navy
```css
--color-primary-500: #1e3a8a;
--color-primary-600: #1e40af;
```

### Fresh Green
```css
--color-primary-500: #10b981;
--color-primary-600: #059669;
```

### Vibrant Orange
```css
--color-primary-500: #f97316;
--color-primary-600: #ea580c;
```

### Elegant Rose
```css
--color-primary-500: #f43f5e;
--color-primary-600: #e11d48;
```

## Testing Your Changes

After modifying the design system:

1. Save [src/index.css](src/index.css)
2. The dev server will automatically reload
3. Check these pages to see your changes:
   - Landing page (logo, buttons, icons)
   - Dashboard (navigation, cards)
   - Forms (focus states, buttons)
   - Tables (hover states)

## Advanced Customization

### Adding Custom Spacing

Uncomment the spacing variables in `@theme` to customize spacing:

```css
@theme {
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

### Adding Additional Colors

You can add more color scales if needed:

```css
@theme {
  --color-accent-500: #f59e0b;
  --color-accent-600: #d97706;
  
  --color-success-500: #10b981;
  --color-success-600: #059669;
  
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  
  --color-danger-500: #ef4444;
  --color-danger-600: #dc2626;
}
```

Then use them like:
```tsx
<div className="bg-accent-500">Accent background</div>
<p className="text-success-600">Success text</p>
```

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind Color Palette Reference](https://tailwindcss.com/docs/customizing-colors)
- [UI Colors Palette Generator](https://uicolors.app/)
- [Flowbite React Components](https://flowbite-react.com/)

## Support

If you encounter any issues or need help customizing the design system, refer to the Tailwind CSS v4 documentation or check the component files in [src/components](src/components) for usage examples.
