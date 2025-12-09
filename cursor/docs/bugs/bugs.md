# Bugs Found - Current Tracking

**Last Updated:** 2025-01-15
**Phase:** Phase 1 - Browser Testing
**Status:** Tracking active bugs from localhost verification

## Critical Bugs (Block Progress)

*No critical bugs currently tracked.*

## High Priority Bugs

*No high priority bugs currently tracked.*

## Medium Priority Bugs

*No medium priority bugs currently tracked.*

## Low Priority / Warnings

- [ ] **BUG-004:** Console.warn for failed streaming line parsing
  - **Location:** `web/src/services/chat.ts:112,234`
  - **Warning:** `console.warn('Failed to parse streaming line:', line)`
  - **Impact:** Minor - expected behavior for malformed streaming data, but could be handled more gracefully
  - **Status:** 🟢 OPEN
  - **Found:** 2025-01-15
  - **Note:** This may be expected behavior, but should verify if warnings are excessive

- [ ] **BUG-006:** "Element not found" error caught by global error handler
  - **Location:** Browser console (http://localhost:8912/:412)
  - **Error:** `Uncaught Error: Element not found`
  - **Impact:** Low - Error is caught by global error handler, doesn't affect functionality
  - **Status:** 🟢 OPEN
  - **Found:** 2025-01-15 (during browser automation testing)
  - **Note:** This appears to be a browser automation issue (failed click), not a real app bug. Global error handler successfully catches it. No user impact observed.

## Hard to Solve Bugs (Requires Dedicated Plan)

*No hard to solve bugs currently tracked.*

**When a bug has 2+ failed fix attempts, move it here and:**
- Document all fix attempts with dates and failure reasons
- Mark status as 🔵 HARD_TO_SOLVE
- If bug blocks a feature, update plan.md to mark feature as ⚠️ INCOMPLETE
- Generate fix plan using plan-generation.mdc rule
- Link plan file in this section

**Example format:**
```markdown
- [ ] **BUG-XXX:** [Description]
  - **Location:** [File:Line]
  - **Error:** [Exact error message]
  - **Impact:** [What functionality is broken]
  - **Status:** 🔵 HARD_TO_SOLVE
  - **Found:** [YYYY-MM-DD HH:MM]
  - **Attempt History:**
    - **Attempt #1:** [YYYY-MM-DD] - [What was tried] - [Why it failed]
    - **Attempt #2:** [YYYY-MM-DD] - [What was tried] - [Why it failed]
    - **Attempt #3:** [YYYY-MM-DD] - [What was tried] - [Why it failed]
  - **Plan Required:** Yes - Use plan-generation.mdc rule to create dedicated fix plan
  - **Plan File:** [Link to plan file when created]
  - **Blocks Feature:** [Feature name in plan.md if applicable]
```

## Resolved Bugs

- [x] **BUG-001:** Missing `gql` import in HomePage.tsx - Fixed 2025-01-15
  - **Solution:** Added `import { gql } from '@apollo/client'` to HomePage.tsx

- [x] **BUG-002:** Console.log in render function - Fixed 2025-01-15
  - **Solution:** Commented out console.log (can be re-enabled for debugging if needed)

- [x] **BUG-003:** Multiple console.log statements in production code - Fixed 2025-01-15
  - **Solution:** Commented out console.log statements in:
    - HomePage.tsx:59 (Query completed log)
    - FileTreeView.tsx:216,220 (Copy path logs)
    - EditorPanel.tsx:66 (File saved log)
  - **Verification:** No console.log statements appear in browser console during normal operation

- [x] **BUG-005:** react-window List component TypeError - Fixed 2025-01-15
  - **Root Cause:**
    1. Missing `ariaAttributes` prop in RowComponent function signature (react-window v2 requires it)
    2. Missing `rowProps={{}}` prop on List component
    3. Invalid `width="100%"` prop - removed, using CSS class `w-full` instead
  - **Solution:**
    1. Added `ariaAttributes` to RowComponent props and spread it on the div
    2. Added `rowProps={{}}` to List component
    3. Removed `width` prop, added `w-full` CSS class to List component
  - **Verification:** Page now renders successfully, file tree displays, no console errors

---

## Bug Tracking Guidelines

### When to Add Bugs
- At the end of every major phase completion
- When checking localhost and finding console errors/warnings
- When build fails or produces warnings
- When tests fail
- When functionality doesn't work as expected

### Bug Format
```markdown
- [ ] **BUG-XXX:** [Short description]
  - **Location:** [File:Line]
  - **Error:** [Exact error message from browser console]
  - **Impact:** [What functionality is broken]
  - **Steps to Reproduce:** [How to see the bug]
  - **Status:** 🔴 OPEN / 🟡 OPEN / 🟠 OPEN / 🟢 OPEN / 🔵 HARD_TO_SOLVE
  - **Found:** [YYYY-MM-DD HH:MM]
  - **Fixed:** [YYYY-MM-DD HH:MM] (when resolved)
  - **Fix Attempts:** (only if multiple attempts made)
    - **Attempt #1:** [YYYY-MM-DD] - [What was tried] - [Why it failed]
    - **Attempt #2:** [YYYY-MM-DD] - [What was tried] - [Why it failed]
  - **Plan File:** [Link to plan file if Hard to Solve]
  - **Blocks Feature:** [Feature name in plan.md if applicable]
```

### File Splitting
- Split when file exceeds 50 bugs
- Split when file exceeds 2000 lines
- Create new file: `bugs-YYYY-MM-DD.md`
- Move unfixed bugs to new file
- Keep "Hard to Solve" bugs in current file for plan generation

### Hard to Solve Bug Workflow

**When bug has 2+ failed fix attempts:**
1. Move bug to "Hard to Solve Bugs" section
2. Document all fix attempts with dates and failure reasons
3. Mark status as 🔵 HARD_TO_SOLVE
4. If bug blocks a feature in plan.md:
   - Update plan.md to mark feature as ⚠️ INCOMPLETE
   - Add explanation of why feature is incomplete
   - Link to bug in bugs.md
5. Generate fix plan using plan-generation.mdc rule:
   - Use rule: `/home/jon/code/glyph-nova/cursor/rules/manual/tracking/plan-generation.mdc`
   - Create comprehensive plan to fix the bug
   - Save plan in `cursor/docs/plans/` directory
   - Name plan: `fix-bug-XXX-[description].md`
   - Link plan file in bugs.md under the bug entry
