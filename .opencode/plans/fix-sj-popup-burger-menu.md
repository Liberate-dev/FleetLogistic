# Plan: SJ Detail Popup Blur + Burger Menu Sidebar

## Problem 1 — Surat Jalan Detail Popup Blur Issue

**File:** `src/pages/SJIndex.jsx:206-227`

**Issue:** When the SJ detail modal opens, the modal content is also getting blurred along with the page content. This happens because:
1. The backdrop has `backdrop-blur-sm` class (line 210)
2. The backdrop and content don't have proper z-index layer separation
3. The backdrop is behind the content but the blur effect is affecting everything in the same container

**Fix:**
1. Add `z-[101]` to the backdrop div (line 210)
2. Add `z-[102]` to the content container (line 214)
3. Add `blur-none` to the modal content div (line 215) to ensure it's not blurred

**Changes:**
```jsx
// Line 207-215
<div className="fixed inset-0 z-[100] print:hidden">
  {/* Backdrop */}
  <div
    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[101]"
    onClick={() => setSelectedSJ(null)}
  />
  {/* Content */}
  <div className="absolute inset-0 flex items-center justify-center p-4 z-[102]">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden w-full max-w-3xl max-h-[90vh] flex flex-col blur-none">
```

## Problem 2 — Sidebar as Burger Menu

**Files:** `src/components/Layout.jsx`, `src/components/Sidebar.jsx`, `src/context/LayoutContext.jsx`

**Current behavior:** 
- Desktop sidebar (`md:block`) is always visible, never hides
- Mobile has a burger button + drawer (only on `<md` screens)
- No toggle mechanism on desktop

**Fix Strategy:**
1. **LayoutContext.jsx** — Rename `mobileNavOpen` to `sidebarOpen` and add `sidebarOpenOnDesktop` state (desktop sidebar starts open)
2. **Layout.jsx** — Add a unified burger button in the top bar that works on all screen sizes. Make sidebar toggleable on all breakpoints.
3. **Sidebar.jsx** — No major changes needed, but will be controlled by the new state

**Detailed changes:**

### `src/context/LayoutContext.jsx`
- Rename `mobileNavOpen` → `sidebarOpen` (unified state for all screens)
- Add `sidebarOpenOnDesktop` state (boolean, defaults to `true` for desktop)
- Update scroll lock to use `sidebarOpen`

### `src/components/Layout.jsx`
- Import `useLayout` and get `sidebarOpen`, `setSidebarOpen`, `sidebarOpenOnDesktop`, `setSidebarOpenOnDesktop`
- Create a unified `TopBar` component with burger button visible on all screens
- Make sidebar conditional: hide completely when closed, show with animation when open
- Use `sidebarOpen` to control visibility on mobile, `sidebarOpenOnDesktop` for desktop

### `src/components/Sidebar.jsx`
- No changes needed - the existing implementation works fine

**Implementation approach for Layout.jsx:**
```jsx
// New unified approach:
<div className="flex bg-background text-on-surface font-body">
  {/* Sidebar - controlled by state */}
  <div className={`fixed md:sticky top-0 left-0 h-screen bg-slate-50 border-r border-slate-200 dark:bg-[#121619] dark:border-slate-800 flex flex-col p-4 z-50 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} md:${sidebarOpenOnDesktop ? 'w-64' : 'w-0 overflow-hidden'}`}>
    <Sidebar collapsed={!sidebarOpenOnDesktop} />
  </div>

  {/* Main content */}
  <div className="flex-1 flex flex-col min-h-screen bg-surface transition-all duration-300">
    {/* Top bar with burger button */}
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant/20 px-4 py-3 flex items-center gap-3 shrink-0">
      <button onClick={() => { if (md) { setSidebarOpenOnDesktop(!sidebarOpenOnDesktop) } else { setSidebarOpen(true) } }}>
        <span className="material-symbols-outlined">menu</span>
      </button>
      {/* Title, user info, etc */}
    </header>
    
    {/* Page content */}
    <main className="flex-1 flex flex-col">
      {children}
    </main>
  </div>

  {/* Mobile Nav - overlay when open */}
  <MobileNav />
</div>
```

## Execution Order
1. Fix SJ Detail Popup z-index and blur issue (highest priority - blocking UX)
2. Convert sidebar to burger menu with toggle functionality

## Files to modify
- `src/pages/SJIndex.jsx` (lines 207-215)
- `src/context/LayoutContext.jsx` (rename state, add desktop state)
- `src/components/Layout.jsx` (unified burger button, conditional sidebar)
- `src/components/Sidebar.jsx` (optional: collapsed prop)
- `src/components/MobileNav.jsx` (may need adjustment for new state names)