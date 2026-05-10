# Implementation Plan — Daily Cash Book

## Phase 1: Dashboard Layout Overhaul

**Goal:** Convert dashboard to Ant Design matching the `workscape/layout/` reference images.

### Steps

1. **Backend — `reportController.js`**
   - Add 14-day cash flow aggregation (daily income/expense)
   - Add spending breakdown by category for current month
   - Add last month stats for delta percentage calculation
   - Return `cashFlow`, `spendingBreakdown`, `lastMonthIncome`, `lastMonthExpense`

2. **StatCard — `StatCard.tsx`**
   - Replace Tailwind gradient classes with Ant Design `Card` component
   - Use inline `linear-gradient` styles
   - Use Ant Design `Typography.Text` and `Typography.Title`

3. **Dashboard — `Dashboard.tsx`**
   - Replace Tailwind-based layout with Ant Design `Row`/`Col`/`Card`/`Flex`/`Typography`
   - 3-column stat cards (Income, Expense, Balance) — full width on mobile, 3-col on desktop
   - Cash Flow chart card using Recharts `BarChart` with green (income) and orange (expense) bars
   - Spending Breakdown card with category emojis, amounts, and animated progress bars
   - Recent Transactions card with "View all" link

## Phase 2: Layout Components Conversion

**Goal:** Convert all layout components from Tailwind to Ant Design theme tokens.

4. **Sidebar — `Sidebar.tsx`**
   - Use `theme.useToken()` for all colors
   - Replace Tailwind `bg-card`, `border-border`, `text-muted-foreground` with Ant Design `token.colorBgContainer`, `token.colorBorderSecondary`, `token.colorTextSecondary`
   - Responsive: slide-in on mobile, static on desktop via CSS media queries
   - User profile card with gradient using `token.colorPrimary`

5. **BottomNav — `BottomNav.tsx`**
   - Use `theme.useToken()` for colors
   - Replace Tailwind classes with inline styles
   - Hidden on desktop via CSS `@media (min-width: 768px)`

6. **TransactionItem — `TransactionItem.tsx`**
   - Use Ant Design `Typography` components
   - Use `theme.useToken()` for hover and text colors
   - Replace `cn()` with inline styles

7. **AppShell — `AppShell.tsx`**
   - Add sticky header with proper Ant Design theme-aware background
   - Add proper `Content` padding (`24px`)
   - Set `minHeight: 100vh` on main Layout
   - Move `FloatButton` to show on `< md` screens only

## Phase 3: Documentation

8. **Update `project.md`** — Reflect actual implementation (Ant Design instead of Tailwind, updated folder structure)
9. **Create `plans.md`** — This file
10. **Create `logs.md`** — Record of all changes made
