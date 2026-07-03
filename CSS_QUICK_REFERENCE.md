# 🎨 SplitMate CSS Variables Quick Reference

## 🌈 COLORS

### Primary Brand
```css
--color-primary: #3366ff         /* Main blue - use for CTAs *)
--color-primary-light: #e6edff   /* Light background *)
--color-primary-dark: #0040cc    /* Hover state darker *)
```

### Semantic Colors
```css
--color-success: #10b981          /* Green - positive action *)
--color-success-light: #d1fae5    /* Light green background *)

--color-danger: #ef4444           /* Red - destructive *)
--color-danger-light: #fee2e2     /* Light red background *)

--color-warning: #f59e0b          /* Amber - caution *)
--color-warning-light: #fef3c7    /* Light amber background *)

--color-info: #3b82f6             /* Blue - information *)
--color-info-light: #dbeafe       /* Light blue background *)
```

### Text Colors
```css
--color-text-primary: #0f172a     /* Main dark text *)
--color-text-secondary: #64748b   /* Muted text (labels, hints) *)
--color-text-tertiary: #94a3b8    /* Even lighter text *)
--color-text-inverse: #ffffff     /* White text on dark bg *)
```

### Background & Surfaces
```css
--color-bg-primary: #ffffff       /* Main white background *)
--color-bg-secondary: #f8fafc     /* Light gray for sections *)
--color-bg-tertiary: #f1f5f9      /* Lighter gray for hover *)
```

### Borders
```css
--color-border: #e2e8f0           /* Standard border *)
--color-border-light: #f1f5f9     /* Light border *)
--color-border-dark: #cbd5e1      /* Darker border *)
```

---

## 📏 SPACING (4px Base Unit)

```css
--space-0: 0                /* 0px *)
--space-1: 0.25rem         /* 4px *)
--space-2: 0.5rem          /* 8px *)
--space-3: 0.75rem         /* 12px *)
--space-4: 1rem            /* 16px - Most common *)
--space-6: 1.5rem          /* 24px - Card padding *)
--space-8: 2rem            /* 32px - Section spacing *)
--space-12: 3rem           /* 48px - Large spacing *)
--space-16: 4rem           /* 64px *)
--space-20: 5rem           /* 80px *)
--space-24: 6rem           /* 96px *)
--space-32: 8rem           /* 128px *)
```

**Usage:**
```css
.card {
  padding: var(--space-6);      /* 24px all sides *)
  margin-bottom: var(--space-8); /* 32px below *)
  gap: var(--space-4);          /* 16px between items *)
}
```

---

## 🔡 TYPOGRAPHY

### Font Family
```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-family-mono: 'Menlo', 'Monaco', 'Courier New', monospace
```

### Font Sizes
```css
--font-size-xs: 0.75rem      /* 12px *)
--font-size-sm: 0.875rem     /* 14px - Common for labels *)
--font-size-base: 1rem       /* 16px - Body text *)
--font-size-lg: 1.125rem     /* 18px - Section titles *)
--font-size-xl: 1.25rem      /* 20px *)
--font-size-2xl: 1.5rem      /* 24px - Page titles *)
--font-size-3xl: 1.875rem    /* 30px *)
--font-size-4xl: 2.25rem     /* 36px - Large headings *)
--font-size-5xl: 3rem        /* 48px - Hero titles *)
```

### Font Weights
```css
--font-weight-regular: 400      /* Normal text *)
--font-weight-medium: 500       /* Slightly bold *)
--font-weight-semibold: 600     /* Bold *)
--font-weight-bold: 700         /* Very bold *)
--font-weight-extrabold: 800    /* Extra bold *)
```

### Line Heights
```css
--line-height-tight: 1.25       /* 125% *)
--line-height-snug: 1.375       /* 137.5% *)
--line-height-normal: 1.5       /* 150% - Default *)
--line-height-relaxed: 1.625    /* 162.5% *)
--line-height-loose: 2          /* 200% *)
```

---

## ⚫ BORDER RADIUS

```css
--radius-sm: 0.375rem          /* 6px *)
--radius-md: 0.5rem            /* 8px *)
--radius-lg: 0.75rem           /* 12px - Most common *)
--radius-xl: 1rem              /* 16px - Cards *)
--radius-2xl: 1.5rem           /* 24px - Large cards *)
--radius-3xl: 2rem             /* 32px *)
--radius-full: 9999px          /* Fully rounded (circles) *)
```

**Usage:**
```css
.card { border-radius: var(--radius-xl); }      /* 16px *)
.button { border-radius: var(--radius-lg); }    /* 12px *)
.avatar { border-radius: var(--radius-full); }  /* Circle *)
```

---

## 🎇 SHADOWS

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)

--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
             0 1px 2px 0 rgba(0, 0, 0, 0.06)

--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
             0 2px 4px -1px rgba(0, 0, 0, 0.06)

--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
             0 4px 6px -2px rgba(0, 0, 0, 0.05)

--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
             0 10px 10px -5px rgba(0, 0, 0, 0.04)

--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

**Usage:**
```css
.card { box-shadow: var(--shadow-md); }         /* Subtle shadow *)
.card:hover { box-shadow: var(--shadow-lg); }   /* More shadow on hover *)
.modal { box-shadow: var(--shadow-xl); }        /* Heavy shadow *)
```

---

## ⏱️ TRANSITIONS

```css
--transition-fast: 150ms ease-in-out    /* Quick (buttons, icons) *)
--transition-base: 200ms ease-in-out    /* Standard (default) *)
--transition-slow: 300ms ease-in-out    /* Slow (modals, overlays) *)
```

**Usage:**
```css
.button {
  transition: all var(--transition-base);  /* 200ms *)
}

.button:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
}
```

---

## 🏗️ Z-INDEX SCALE

```css
--z-dropdown: 1000         /* Dropdown menus *)
--z-sticky: 1020           /* Sticky headers *)
--z-fixed: 1030            /* Fixed elements *)
--z-modal-backdrop: 1040    /* Modal overlay *)
--z-modal: 1050            /* Modal itself *)
--z-popover: 1060          /* Popovers *)
--z-tooltip: 1070          /* Tooltips *)
```

---

## 📦 COMMON CSS PATTERNS

### Flex Center
```css
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Flex Between
```css
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### Responsive Grid
```css
.grid-auto {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

@media (max-width: 768px) {
  .grid-auto {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
  .grid-auto {
    grid-template-columns: 1fr;
  }
}
```

### Card Component
```css
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}
```

### Input Field
```css
input {
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  transition: all var(--transition-base);
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
```

### Button
```css
.btn {
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

---

## 🎯 COMMON USE CASES

### Page Container
```css
.page {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-8);
}
```

### Section Spacing
```css
.section {
  margin-bottom: var(--space-12);
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-6);
}
```

### List Item
```css
.list-item {
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

### Badge
```css
.badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Default: Desktop (1200px+) */

/* Tablet: 768px and below */
@media (max-width: 768px) {
  /* Adjust layout, reduce padding */
}

/* Mobile: 480px and below */
@media (max-width: 480px) {
  /* Single column, touch-friendly sizes */
}
```

---

## ✅ BEST PRACTICES

1. **Always use variables** - Never hardcode colors or spacing
2. **Use consistent spacing** - Multiple of 4px (space-2, space-4, etc.)
3. **Responsive first** - Design for mobile, enhance for desktop
4. **Hover states** - Always add on interactive elements
5. **Transitions** - Default to `var(--transition-base)`
6. **Colors** - Use semantic colors (success, danger, etc.)
7. **Shadows** - Use shadow system for depth (not custom)

---

## 🚀 QUICK COPY-PASTE

### Complete Card
```css
.component {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.component:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .component {
    padding: var(--space-4);
  }
}
```

### Complete Button
```css
.btn-custom {
  padding: var(--space-3) var(--space-4);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-custom:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.btn-custom:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
```

---

**Keep this file bookmarked! It's your go-to reference while implementing pages. 📌**
