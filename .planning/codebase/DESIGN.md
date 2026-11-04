# Design System & UI Specifications

**Project**: HRMS / CJ DARCL Recruitment & Corporate Suite  
**Last Updated**: 2026-11-04  
**Applies To**: All Frontend Pages, Dialogs, Bento Boxes, Wizards, and Tables

---

## 1. Global Visual Language

### Core Palette
* **Primary Brand Blue**: `#3080e8` (Corporate Action Blue, links, active steps, focus borders, scrollbars)
* **Secondary / Header Navy**: `#2b2e41` / `#2b2b41` (Hover states, table headers, primary text contrast)
* **Canvas Background**:
  * Global Admin: `#f8f9fa`
  * Modern ATS / Bento Pages: `#f6f8fa`
* **Card & Surface Background**: `#ffffff`
* **Slate Border Scale**:
  * Light Divider: `#f1f5f9`
  * Standard Container Border: `#e2e8f0`
  * Input / Control Border: `#cbd5e1`
  * Control Hover Border: `#94a3b8`
  * Subtext / Meta Gray: `#64748b` / `#475569`

### Typography
* **Font Family**: `"Work Sans", sans-serif !important` (Applied across `html`, `body`, headers, inputs, tables, buttons, and Angular Material components)
* **Scale**:
  * Page Title: `13px` - `14px` (Bold)
  * Section / Bento Header: `11.5px` - `12px` (Bold)
  * Form Field Labels: `10.5px` - `12px` (Semi-bold `600`)
  * Input Values / Dropdowns: `11px` - `12px`
  * Metadata / Chips / Badges: `9.5px` - `10px`
  * Table Content: `11px` (Body), `12px` (Header)

---

## 2. Dropdown Component Standard (`ng-select`)

All dropdowns across the application must use `@ng-select/ng-select` with the universal `.custom-ng-select` class:

### SCSS Specification
```scss
::ng-deep .custom-ng-select {
  font-family: "Work Sans", sans-serif !important;
  font-size: 11px !important;

  .ng-select-container {
    min-height: 28px !important;
    height: 28px !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 4px !important;
    background-color: #ffffff !important;
    padding: 0 6px !important;
    font-size: 11px !important;
    color: #1e293b !important;
    box-shadow: none !important;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

    &:hover {
      border-color: #94a3b8 !important;
    }
  }

  &.ng-select-opened > .ng-select-container {
    border-color: #3080e8 !important;
    box-shadow: 0 0 0 2px rgba(48, 128, 232, 0.12) !important;
  }

  &.ng-select-focused:not(.ng-select-opened) > .ng-select-container {
    border-color: #3080e8 !important;
  }

  .ng-value-container {
    padding: 0 !important;
    align-items: center !important;

    .ng-placeholder {
      color: #94a3b8 !important;
      font-size: 11px !important;
      line-height: 26px !important;
      top: 0 !important;
    }

    .ng-value {
      font-size: 11px !important;
      color: #0f172a !important;
      line-height: 26px !important;
    }

    .ng-input {
      top: 0 !important;
      padding: 0 !important;
      > input {
        font-size: 11px !important;
        font-family: "Work Sans", sans-serif !important;
      }
    }
  }

  .ng-arrow-wrapper {
    width: 18px !important;
    padding-right: 2px !important;
    .ng-arrow {
      border-color: #64748b transparent transparent !important;
      border-width: 4px 4px 0 !important;
    }
  }
}
```

---

## 3. Form Inputs & Controls (`input`, `textarea`, `input-group`)

### Textbox & Number Input Specs
* **Class**: `.form-control.form-control-sm`
* **Height**: `28px !important`
* **Background**: `#ffffff !important`
* **Color**: `#0f172a !important`
* **Border**: `1px solid #cbd5e1 !important`
* **Border Radius**: `4px !important`
* **Font**: `11px !important`, `font-weight: 500 !important`
* **Focus State**:
  * `border-color: #0051d5 !important` (or `#3080e8`)
  * `box-shadow: 0 0 0 2px rgba(0, 81, 213, 0.15) !important`
  * `outline: none !important`

### Input Group Affixes (`.input-group-sm`)
* **Height**: `28px !important`
* **Affix Text (`.input-group-text`)**:
  * Background: `#f1f5f9 !important`
  * Text Color: `#475569 !important`
  * Border: `1px solid #cbd5e1 !important`
  * Font Size: `10px !important`
  * Padding: `0 8px !important`

### Labels (`.form-label-mini`)
* **Display**: Block
* **Font Size**: `10.5px`
* **Font Weight**: `600`
* **Color**: `#475569 !important`
* **Mandatory Indicator**: `<span class="text-danger">*</span>`

---

## 4. Button Standards

### Primary Action Button (`.btn-primary-action`, `.btn-primary`)
* **Background**: `#3080e8 !important`
* **Color**: `#ffffff !important`
* **Border**: `1px solid #3080e8 !important`
* **Border Radius**: `4px !important`
* **Padding**: `3px 12px !important`
* **Height**: `28px !important`
* **Font Size**: `11.5px !important`, `font-weight: 600`
* **Box Shadow**: `0 2px 6px #acb5f6 !important`
* **Hover State**:
  * `background-color: #2b2b41 !important`
  * `border-color: #2b2b41 !important`
  * `color: #ffffff !important`

### Secondary / Header Action Button (`.btnheader`)
* **Background**: `#ffffff !important`
* **Color**: `#3080e8 !important`
* **Border Radius**: `10px`
* **Hover State**:
  * `background: #2b2e41 !important`
  * `color: #ffffff !important`

### Segmented Choice Buttons (`.btn-group .btn-outline-primary`)
* **Height**: `28px !important`
* **Inactive**: Background `#ffffff`, border `#cbd5e1`, text `#475569`, font size `11px`.
* **Hover**: Background `#eff6ff`, border `#bfdbfe`, text `#3080e8`.
* **Active**: Background `#3080e8 !important`, border `#3080e8 !important`, text `#ffffff !important`.

---

## 5. Cards & Bento Boxes (`.bento-box`)

* **Container**:
  * Background: `#ffffff`
  * Border: `1px solid #e2e8f0 !important`
  * Border Radius: `6px` to `8px`
  * Box Shadow: `0 1px 2px rgba(0, 0, 0, 0.02)`
* **Header (`.bento-box-header`)**:
  * Background: `#f8fafc !important`
  * Border Bottom: `1px solid #e2e8f0 !important`
  * Padding: `0.5rem 0.75rem`
* **Chips / Badges (`.badge-chip`)**:
  * Font Size: `9.5px`
  * Font Weight: `600`
  * Padding: `1px 6px`
  * Border Radius: `3px`

