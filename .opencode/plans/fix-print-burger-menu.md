# Plan: Fix Print Issue + Modal Blur + Burger Menu

## Problem 1 — Modal Blur Issue (FIXED ✓)

The modal content was getting blurred because the blur was applied to the page content div before the modal was rendered.

**Solution applied:** The modal is now rendered outside the Layout using React Portal, at `z-[100]`, ensuring it appears on top.

## Problem 2 — Print Issue (CRITICAL - NEEDS FIX)

**File:** `src/pages/SJIndex.jsx`

**Current behavior:** When clicking Print:
1. Layout gets `print:hidden` class (line 336)
2. Modal backdrop gets `print:hidden` class (line 207)
3. BUT DocumentPrintLayout is ALSO hidden because it's inside the modal
4. **Result: Nothing prints**

**Solution:**
The modal is rendered twice (lines 335 and 448). This is a bug. Need to:
1. Remove the duplicate renderSJDetailModal() call on line 335
2. Keep only the one at line 448 (after the Layout closes)
3. Ensure the print-only DocumentPrintLayout (lines 114-204) has `print:block` which it already does

**Changes needed:**
- Line 335: Remove `{selectedSJ && renderSJDetailModal()}`
- Keep the renderSJDetailModal() at line 448

## Problem 3 — Burger Menu Sidebar (PENDING)

**Files:** `src/components/Layout.jsx`, `src/components/Sidebar.jsx`, `src/context/LayoutContext.jsx`

**Current behavior:**
- Desktop sidebar always visible, never hides
- Mobile has burger button + drawer (only on `<md` screens)
- No toggle mechanism on desktop

**Solution:**

### Step 1: Update `src/context/LayoutContext.jsx`
Rename `mobileNavOpen` → `sidebarOpen` for clarity, as it will control sidebar visibility on all screens.

```jsx
// Before
const [mobileNavOpen, setMobileNavOpen] = useState(false);

// After
const [sidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop
```

### Step 2: Update `src/components/Layout.jsx`
Add a burger button in the top bar that appears on all screen sizes, not just mobile.

```jsx
export default function Layout({ children }) {
  const { sidebarOpen, setSidebarOpen } = useLayout();

  return (
    <div className="flex bg-background text-on-surface font-body">
      {/* Desktop Sidebar - controlled by sidebarOpen state */}
      <div className={`hidden md:block transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen bg-surface">
        {/* Top Bar with burger button for all screen sizes */}
        <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}

function TopBar({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant/20 px-4 py-3 flex items-center gap-3">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
      >
        <span className="material-symbols-outlined text-2xl">{sidebarOpen ? 'menu_open' : 'menu'}</span>
      </button>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
        </div>
        <h1 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">Fleet Ops</h1>
      </div>
    </header>
  );
}
```

### Step 3: No changes needed to `Sidebar.jsx`
The sidebar component itself doesn't need changes — it will just be conditionally rendered based on width.

## Implementation Order

1. **Fix print issue** (line 335 duplicate call removal)
2. **Implement burger menu** (LayoutContext + Layout changes)