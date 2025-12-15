---
name: User Click Logging Implementation Plan
overview: Implement comprehensive user click logging system that logs every user click with element information and timestamp, groups actions by timespan, and provides togglable logging from settings page
todos: []
---

# User Click Logging Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement a comprehensive user click logging system that logs every user click with element information (what element was clicked, element type, element identifier) and timestamp. Logs should be saved to `.log` files, grouped by timespan (configurable), and logging should be togglable from the settings page.

---

## Overview

This plan implements a user click logging system that:
- Logs every user click with detailed element information
- Records timestamps for each click
- Groups clicks by timespan (e.g., by minute, hour, session)
- Saves logs to `.log` files (e.g., `.glyphnova/logs/click-YYYY-MM-DD.log`)
- Provides toggle in settings page to enable/disable logging
- Includes element identification (tag, id, class, text content)
- Handles privacy concerns (optional data sanitization)

**Target**: Comprehensive click logging system for user behavior analysis
**Priority**: Medium (analytics feature, not blocking)
**Estimated Time**: 6-8 hours (with 20% buffer: 7.2-9.6 hours)
**Risk Level**: Medium (performance considerations, privacy concerns)

---

## Current State Analysis

### Existing Implementation
- **Basic Logging**: Console.log statements for debugging
- **Error Reporting**: Error reporting service (Sentry fallback)
- **No Click Logging**: No user click tracking
- **No Analytics**: No user behavior tracking
- **No Log Files**: No structured log file generation

### Gaps Identified
- No click event tracking
- No element identification system
- No log file generation
- No timespan grouping
- No settings toggle for logging

---

## External Documentation Links

### Click Tracking & Analytics
1. **Google Analytics Event Tracking**
   - Link: https://developers.google.com/analytics/devguides/collection/ga4/events
   - Description: Event tracking patterns (reference for click tracking)
   - Rating: Medium - Analytics reference

2. **Web Analytics Best Practices**
   - Link: https://www.w3.org/TR/tracking-dnt/
   - Description: Privacy considerations for tracking
   - Rating: High - W3C privacy guidelines

### Event Handling
3. **DOM Event API**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/Event
   - Description: DOM event handling
   - Rating: High - MDN documentation

4. **MouseEvent API**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
   - Description: Mouse event details
   - Rating: High - MDN documentation

### File I/O & Logging
5. **Node.js File System API**
   - Link: https://nodejs.org/api/fs.html
   - Description: File system operations for log files
   - Rating: High - Node.js documentation

6. **Winston Logger**
   - Link: https://github.com/winstonjs/winston
   - Description: Node.js logging library (optional reference)
   - Rating: Medium - Logging library reference

### Privacy & Security
7. **GDPR Compliance**
   - Link: https://gdpr.eu/what-is-gdpr/
   - Description: Privacy regulations (consider for user data)
   - Rating: Medium - Privacy reference

8. **Data Sanitization**
   - Link: https://owasp.org/www-community/vulnerabilities/Insufficient_Data_Sanitization
   - Description: Data sanitization best practices
   - Rating: High - Security best practices

### Performance
9. **Event Debouncing**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
   - Description: Performance optimization for events
   - Rating: High - MDN documentation

10. **Batch Processing**
    - Link: https://developer.mozilla.org/en-US/docs/Web/API/Performance
    - Description: Performance optimization patterns
    - Rating: Medium - MDN documentation

---

## Implementation Phases

### Phase 1: Click Event Capture System (2-2.5 hours)

**Goal**: Create system to capture and identify click events.

#### 1.1 Global Click Listener
- [ ] Create `web/src/services/clickLogger.ts`:
  - [ ] Global click event listener
  - [ ] Element identification function
  - [ ] Click data extraction
- [ ] Click listener setup:
  ```typescript
  export function initializeClickLogging(enabled: boolean) {
    if (!enabled) return

    document.addEventListener('click', (e: MouseEvent) => {
      const clickData = extractClickData(e)
      logClick(clickData)
    }, true) // Use capture phase
  }
  ```

#### 1.2 Element Identification
- [ ] Create element identification function:
  - [ ] Extract element tag name
  - [ ] Extract element ID (if present)
  - [ ] Extract element classes
  - [ ] Extract element text content (truncated)
  - [ ] Extract element attributes (data-*, aria-*, etc.)
  - [ ] Extract element path (DOM path)
- [ ] Element data structure:
  ```typescript
  interface ClickData {
    timestamp: number
    element: {
      tag: string
      id?: string
      classes?: string[]
      text?: string
      attributes?: Record<string, string>
      path: string // DOM path
    }
    position: {
      x: number
      y: number
    }
    context: {
      page: string
      component?: string
    }
  }
  ```

#### 1.3 Click Data Extraction
- [ ] Implement click data extraction:
  - [ ] Get target element from event
  - [ ] Extract element information
  - [ ] Get mouse position
  - [ ] Get page/route context
  - [ ] Sanitize sensitive data (optional)

**Success Criteria**:
- [ ] Click events captured globally
- [ ] Element information extracted correctly
- [ ] Click data structured properly
- [ ] No performance impact

---

### Phase 2: Log File Generation (1.5-2 hours)

**Goal**: Create system to write click logs to files.

#### 2.1 Log File Service
- [ ] Create `api/src/services/clickLogging.ts`:
  - [ ] Log file path generation
  - [ ] Log file writing
  - [ ] Log file rotation (daily)
- [ ] Log file structure:
  - [ ] Path: `.glyphnova/logs/click-YYYY-MM-DD.log`
  - [ ] Format: JSON lines (one click per line)
  - [ ] Rotation: New file per day

#### 2.2 GraphQL Mutation
- [ ] Create GraphQL mutation:
  - [ ] `logClick(clickData: ClickData!): Boolean`
  - [ ] Write to log file
  - [ ] Handle file creation if needed
- [ ] Or use existing file write:
  - [ ] Batch clicks and write periodically
  - [ ] Use GraphQL `writeFile` mutation
  - [ ] Append to log file

#### 2.3 Log Format
- [ ] Define log format:
  - [ ] JSON format for each click
  - [ ] Timestamp in ISO format
  - [ ] Structured element data
  - [ ] Readable format for analysis
- [ ] Log entry example:
  ```json
  {
    "timestamp": "2025-01-15T10:30:45.123Z",
    "element": {
      "tag": "button",
      "id": "save-button",
      "classes": ["btn", "btn-primary"],
      "text": "Save",
      "path": "body > div > button#save-button"
    },
    "position": { "x": 150, "y": 200 },
    "context": { "page": "/", "component": "EditorPanel" }
  }
  ```

**Success Criteria**:
- [ ] Log files created correctly
- [ ] Clicks written to log files
- [ ] Log format consistent
- [ ] File rotation works

---

### Phase 3: Timespan Grouping (1.5-2 hours)

**Goal**: Group clicks by timespan for analysis.

#### 3.1 Timespan Configuration
- [ ] Add timespan settings:
  - [ ] Grouping interval (minute, hour, session, day)
  - [ ] Configurable in settings
  - [ ] Default: by minute
- [ ] Timespan options:
  - [ ] `minute` - Group by minute
  - [ ] `hour` - Group by hour
  - [ ] `session` - Group by session
  - [ ] `day` - Group by day

#### 3.2 Click Grouping
- [ ] Implement grouping logic:
  - [ ] Group clicks by timespan
  - [ ] Create group summaries
  - [ ] Store group metadata
- [ ] Group structure:
  ```typescript
  interface ClickGroup {
    timespan: string // e.g., "2025-01-15T10:30"
    startTime: number
    endTime: number
    clickCount: number
    clicks: ClickData[]
    summary: {
      mostClickedElement: string
      clickRate: number // clicks per second
    }
  }
  ```

#### 3.3 Group Analysis
- [ ] Create group analysis:
  - [ ] Most clicked elements
  - [ ] Click patterns
  - [ ] Time-based analysis
  - [ ] Component usage patterns

**Success Criteria**:
- [ ] Clicks grouped by timespan
- [ ] Group summaries generated
- [ ] Analysis data available
- [ ] Configurable grouping interval

---

### Phase 4: Settings Integration (1 hour)

**Goal**: Add click logging toggle to settings page.

#### 4.1 Settings Store
- [ ] Add to settings:
  - [ ] `logging.clickLogging: boolean` (default: false)
  - [ ] `logging.timespanGrouping: string` (default: 'minute')
  - [ ] `logging.logPath: string` (default: '.glyphnova/logs')
- [ ] Settings structure:
  ```typescript
  interface LoggingSettings {
    clickLogging: boolean
    timespanGrouping: 'minute' | 'hour' | 'session' | 'day'
    logPath: string
  }
  ```

#### 4.2 Settings Page UI
- [ ] Add to settings page:
  - [ ] "Logging & Analytics" section
  - [ ] Toggle for "Enable Click Logging"
  - [ ] Dropdown for timespan grouping
  - [ ] Description of logging feature
- [ ] Settings UI:
  - [ ] Clear toggle with description
  - [ ] Privacy notice (optional)
  - [ ] Log file location display

#### 4.3 Settings Application
- [ ] Apply settings:
  - [ ] Initialize logging on app start if enabled
  - [ ] Start/stop logging when toggle changes
  - [ ] Update grouping when setting changes
- [ ] Settings handler:
  ```typescript
  const handleToggleClickLogging = (enabled: boolean) => {
    updateUserSetting('logging', 'clickLogging', enabled)
    if (enabled) {
      initializeClickLogging(true)
    } else {
      stopClickLogging()
    }
  }
  ```

**Success Criteria**:
- [ ] Settings toggle works
- [ ] Logging starts/stops correctly
- [ ] Settings persist correctly
- [ ] UI clear and accessible

---

### Phase 5: Log Viewing & Analysis (1-1.5 hours)

**Goal**: Create UI for viewing and analyzing click logs.

#### 5.1 Log Viewer Component
- [ ] Create `ClickLogViewer.tsx`:
  - [ ] Display click logs
  - [ ] Filter by timespan
  - [ ] Search/filter functionality
  - [ ] Group display
- [ ] Log viewer features:
  - [ ] List of click groups
  - [ ] Expandable groups
  - [ ] Click details view
  - [ ] Export functionality (optional)

#### 5.2 Log Analysis
- [ ] Create analysis views:
  - [ ] Click heatmap (optional)
  - [ ] Most clicked elements
  - [ ] Time-based patterns
  - [ ] Component usage stats
- [ ] Analysis data:
  - [ ] Aggregate click data
  - [ ] Calculate statistics
  - [ ] Visualize patterns

#### 5.3 Log Access
- [ ] Add log access:
  - [ ] View logs from settings page
  - [ ] Or separate logs page
  - [ ] File explorer integration (view .log files)
- [ ] Log file handling:
  - [ ] Read log files via GraphQL
  - [ ] Parse JSON lines
  - [ ] Display in readable format

**Success Criteria**:
- [ ] Log viewer displays logs
- [ ] Logs can be filtered
- [ ] Analysis views work
- [ ] Log access intuitive

---

## Dependencies

### Internal Dependencies
- **Settings System**: Settings page and settings store (from settings plans)
- **GraphQL API**: File read/write operations
- **File System**: Access to .glyphnova folder

### External Dependencies
- **None**: Pure React/TypeScript implementation, no new dependencies

---

## Risk Assessment

### High Risk
- **Performance Impact**: Logging every click might impact performance
  - **Mitigation**: Debounce/batch clicks, use requestAnimationFrame, optimize element identification

### Medium Risk
- **Privacy Concerns**: Logging user clicks raises privacy concerns
  - **Mitigation**: Make logging opt-in, sanitize sensitive data, provide clear privacy notice
- **Log File Size**: Log files might grow large
  - **Mitigation**: Log rotation, compression, size limits, cleanup old logs

### Low Risk
- **Event Handling**: Standard DOM event handling
- **File I/O**: Standard file operations

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable click logging, remove listeners
- **Settings removal**: Remove logging settings, keep code for future

### Phase-Specific Rollback
- **Phase 1**: Remove click listeners, keep service structure
- **Phase 2**: Remove log file writing, keep click capture
- **Phase 3**: Remove grouping, keep basic logging
- **Phase 4**: Remove settings integration, keep logging functional
- **Phase 5**: Remove log viewer, keep log files

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous state
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Click Capture)
- [ ] Click events captured
- [ ] Element information extracted
- [ ] Click data structured correctly
- [ ] No performance issues

### After Phase 2 (Log Files)
- [ ] Log files created
- [ ] Clicks written to files
- [ ] Log format correct
- [ ] File rotation works

### After Phase 3 (Grouping)
- [ ] Clicks grouped correctly
- [ ] Group summaries generated
- [ ] Analysis data available
- [ ] Configurable grouping

### After Phase 4 (Settings)
- [ ] Settings toggle works
- [ ] Logging starts/stops correctly
- [ ] Settings persist
- [ ] UI complete

### After Phase 5 (Viewing)
- [ ] Log viewer works
- [ ] Logs can be filtered
- [ ] Analysis views work
- [ ] Log access intuitive

---

## Success Criteria

1. **Click Capture**: Every click captured with element information
2. **Element Identification**: Element details extracted correctly
3. **Log Files**: Clicks saved to .log files
4. **Timespan Grouping**: Clicks grouped by configurable timespan
5. **Settings Toggle**: Logging can be enabled/disabled from settings
6. **Settings Persistence**: Logging settings persist correctly
7. **Log Viewer**: Logs can be viewed and analyzed
8. **Performance**: No noticeable performance impact
9. **Privacy**: Sensitive data sanitized (optional)
10. **Log Rotation**: Log files rotate daily
11. **Error Handling**: Logging errors don't break app
12. **Documentation**: Logging feature documented
13. **User Experience**: Settings UI clear and accessible
14. **Analysis**: Basic click analysis available
15. **Integration**: Works seamlessly with existing features

---

## Code Examples

### Example: Click Logger Service
```typescript
// web/src/services/clickLogger.ts
interface ClickData {
  timestamp: number
  element: {
    tag: string
    id?: string
    classes?: string[]
    text?: string
    attributes?: Record<string, string>
    path: string
  }
  position: {
    x: number
    y: number
  }
  context: {
    page: string
    component?: string
  }
}

let clickLoggingEnabled = false
let clickBuffer: ClickData[] = []
const BUFFER_SIZE = 50
const FLUSH_INTERVAL = 5000 // 5 seconds

export function initializeClickLogging(enabled: boolean): void {
  clickLoggingEnabled = enabled

  if (!enabled) {
    document.removeEventListener('click', handleClick, true)
    return
  }

  document.addEventListener('click', handleClick, true)

  // Flush buffer periodically
  setInterval(flushClickBuffer, FLUSH_INTERVAL)
}

function handleClick(e: MouseEvent): void {
  if (!clickLoggingEnabled) return

  const target = e.target as HTMLElement
  if (!target) return

  const clickData: ClickData = {
    timestamp: Date.now(),
    element: extractElementData(target),
    position: {
      x: e.clientX,
      y: e.clientY,
    },
    context: {
      page: window.location.pathname,
      component: getComponentName(target),
    },
  }

  clickBuffer.push(clickData)

  // Flush if buffer is full
  if (clickBuffer.length >= BUFFER_SIZE) {
    flushClickBuffer()
  }
}

function extractElementData(element: HTMLElement): ClickData['element'] {
  const tag = element.tagName.toLowerCase()
  const id = element.id || undefined
  const classes = element.className
    ? element.className.split(' ').filter(Boolean)
    : undefined
  const text = element.textContent?.trim().substring(0, 100) || undefined

  // Extract data-* and aria-* attributes
  const attributes: Record<string, string> = {}
  Array.from(element.attributes).forEach(attr => {
    if (attr.name.startsWith('data-') || attr.name.startsWith('aria-')) {
      attributes[attr.name] = attr.value
    }
  })

  // Generate DOM path
  const path = generateElementPath(element)

  return {
    tag,
    id,
    classes,
    text,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    path,
  }
}

function generateElementPath(element: HTMLElement): string {
  const path: string[] = []
  let current: HTMLElement | null = element

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()
    if (current.id) {
      selector += `#${current.id}`
    } else if (current.className) {
      const classes = current.className.split(' ').filter(Boolean).join('.')
      if (classes) {
        selector += `.${classes}`
      }
    }
    path.unshift(selector)
    current = current.parentElement
  }

  return path.join(' > ')
}

function getComponentName(element: HTMLElement): string | undefined {
  // Try to find React component name from data attributes or class names
  let current: HTMLElement | null = element

  while (current) {
    // Check for data-component attribute
    if (current.dataset.component) {
      return current.dataset.component
    }

    // Check class names for component patterns
    const classNames = current.className?.split(' ') || []
    for (const className of classNames) {
      if (className.match(/^[A-Z][a-zA-Z]*$/)) {
        return className
      }
    }

    current = current.parentElement
  }

  return undefined
}

async function flushClickBuffer(): Promise<void> {
  if (clickBuffer.length === 0) return

  const clicks = [...clickBuffer]
  clickBuffer = []

  try {
    // Send to backend via GraphQL
    await logClicksToFile(clicks)
  } catch (error) {
    console.error('Failed to log clicks:', error)
    // Re-add to buffer for retry (optional)
  }
}

async function logClicksToFile(clicks: ClickData[]): Promise<void> {
  // Use GraphQL mutation to write clicks to log file
  // Implementation depends on GraphQL API
}
```

### Example: Backend Log Service
```typescript
// api/src/services/clickLogging.ts
import { logger } from 'src/lib/logger'
import * as fs from 'fs'
import * as path from 'path'

export async function writeClickLog(
  folderPath: string,
  clickData: ClickData
): Promise<void> {
  const logDir = path.join(folderPath, '.glyphnova', 'logs')
  const today = new Date().toISOString().split('T')[0]
  const logFile = path.join(logDir, `click-${today}.log`)

  // Ensure log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  // Append click to log file (JSON lines format)
  const logLine = JSON.stringify(clickData) + '\n'
  fs.appendFileSync(logFile, logLine, 'utf8')
}

export async function readClickLogs(
  folderPath: string,
  date?: string
): Promise<ClickData[]> {
  const logDir = path.join(folderPath, '.glyphnova', 'logs')
  const targetDate = date || new Date().toISOString().split('T')[0]
  const logFile = path.join(logDir, `click-${targetDate}.log`)

  if (!fs.existsSync(logFile)) {
    return []
  }

  const content = fs.readFileSync(logFile, 'utf8')
  const lines = content.split('\n').filter(Boolean)

  return lines.map(line => {
    try {
      return JSON.parse(line) as ClickData
    } catch {
      return null
    }
  }).filter(Boolean) as ClickData[]
}
```

### Example: Settings Integration
```tsx
// web/src/pages/SettingsPage/LoggingSettings.tsx
import { useAppStore } from 'src/state/store'
import { initializeClickLogging } from 'src/services/clickLogger'

export const LoggingSettings = () => {
  const clickLogging = useAppStore((state) => state.userSettings.logging?.clickLogging ?? false)
  const timespanGrouping = useAppStore((state) => state.userSettings.logging?.timespanGrouping ?? 'minute')
  const updateUserSetting = useAppStore((state) => state.updateUserSetting)

  const handleToggleClickLogging = (enabled: boolean) => {
    updateUserSetting('logging', 'clickLogging', enabled)
    initializeClickLogging(enabled)
  }

  return (
    <div className="settings-category">
      <h2 className="mb-4 text-lg font-semibold text-vscode-fg">Logging & Analytics</h2>

      <div className="space-y-4">
        <ToggleSetting
          label="Enable Click Logging"
          description="Log all user clicks to .glyphnova/logs/click-*.log files for analysis"
          value={clickLogging}
          onChange={handleToggleClickLogging}
        />

        {clickLogging && (
          <SelectSetting
            label="Timespan Grouping"
            description="Group clicks by timespan for analysis"
            value={timespanGrouping}
            onChange={(value) => updateUserSetting('logging', 'timespanGrouping', value)}
            options={[
              { value: 'minute', label: 'By Minute' },
              { value: 'hour', label: 'By Hour' },
              { value: 'session', label: 'By Session' },
              { value: 'day', label: 'By Day' },
            ]}
          />
        )}

        {clickLogging && (
          <p className="text-xs text-vscode-fg-secondary">
            Click logs are saved to <code>.glyphnova/logs/click-YYYY-MM-DD.log</code>
          </p>
        )}
      </div>
    </div>
  )
}
```

---

## Notes

- Click logging should be opt-in (disabled by default)
- Consider privacy implications - sanitize sensitive data
- Batch clicks to reduce performance impact
- Log files should rotate daily to prevent large files
- Element identification should be efficient
- Log format should be parseable for analysis
- Settings should clearly explain what is logged
- Consider adding log file size limits
- Consider adding log retention policies
- Performance is critical - optimize click capture

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
