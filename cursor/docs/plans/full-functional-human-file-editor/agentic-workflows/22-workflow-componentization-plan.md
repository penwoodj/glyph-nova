---
name: Workflow Componentization Implementation Plan
overview: Implement workflow componentization system that organizes workflows into reusable components at different abstraction levels, enabling workflow composition, inheritance, and leveled abstraction patterns
todos: []
---

# Workflow Componentization Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement a workflow componentization system that organizes agentic workflows into reusable components at different abstraction levels. This enables workflows to be composed from smaller components, inherit from base workflows, and operate at different levels of abstraction (high-level goals to detailed execution steps).

---

## Overview

This plan implements workflow componentization that:
- Organizes workflows into reusable components
- Supports different abstraction levels (high-level to detailed)
- Enables workflow composition and inheritance
- Provides component registry and discovery
- Supports component versioning and dependencies
- Enables leveled abstraction patterns
- Integrates with workflow framework

**Target**: Complete workflow componentization system with leveled abstraction
**Priority**: Medium (enhances workflow framework)
**Estimated Time**: 10-12 hours (with 20% buffer: 12-14.4 hours)
**Risk Level**: High (complex abstraction system, many integration points)

---

## Current State Analysis

### Existing Implementation
- **No Componentization**: Workflows are monolithic
- **No Abstraction Levels**: No leveled abstraction system
- **No Component Registry**: No component discovery system
- **No Composition**: Workflows cannot be composed
- **No Inheritance**: Workflows cannot inherit from others

### Gaps Identified
- No component organization
- No abstraction level system
- No component registry
- No workflow composition
- No workflow inheritance

---

## External Documentation Links

### Component Patterns
1. **Component-Based Architecture**
   - Link: https://react.dev/learn/thinking-in-react
   - Description: Component composition patterns
   - Rating: Medium - React component patterns

2. **Design Patterns: Composition**
   - Link: https://refactoring.guru/design-patterns/composite
   - Description: Composite design pattern
   - Rating: Medium - Design pattern reference

### Abstraction Patterns
3. **Layered Architecture**
   - Link: https://martinfowler.com/bliki/LayeredArchitecture.html
   - Description: Layered/leveled architecture patterns
   - Rating: High - Architecture patterns

4. **Abstraction Levels**
   - Link: https://en.wikipedia.org/wiki/Abstraction_(computer_science)
   - Description: Abstraction level concepts
   - Rating: Medium - General reference

### Workflow Composition
5. **Workflow Composition Patterns**
   - Link: https://docs.n8n.io/workflows/composing-workflows/
   - Description: n8n workflow composition
   - Rating: High - n8n documentation

6. **Workflow Inheritance**
   - Link: https://docs.n8n.io/workflows/
   - Description: Workflow patterns (reference)
   - Rating: Medium - n8n patterns

### Registry Patterns
7. **Service Registry Pattern**
   - Link: https://microservices.io/patterns/service-registry.html
   - Description: Registry pattern for service discovery
   - Rating: Medium - Architecture pattern

8. **Plugin Architecture**
   - Link: https://martinfowler.com/bliki/PluginArchitecture.html
   - Description: Plugin/component architecture
   - Rating: Medium - Architecture pattern

---

## Implementation Phases

### Phase 1: Component Structure & Abstraction Levels (2.5-3 hours)

**Goal**: Define component structure and abstraction level system.

#### 1.1 Component Structure
- [ ] Define component interface:
  ```typescript
  interface WorkflowComponent {
    id: string
    name: string
    description: string
    abstractionLevel: 'high' | 'medium' | 'low' | 'detailed'
    type: 'markdown' | 'config' | 'hybrid'
    inputs: ComponentInput[]
    outputs: ComponentOutput[]
    dependencies?: string[] // Component IDs
    version: string
    metadata: ComponentMetadata
  }
  ```
- [ ] Component metadata:
  - [ ] Tags/categories
  - [ ] Author
  - [ ] Version
  - [ ] Dependencies
  - [ ] Usage examples

#### 1.2 Abstraction Levels
- [ ] Define abstraction levels:
  - [ ] **High**: Goal-oriented, abstract workflows
  - [ ] **Medium**: Process-oriented, structured workflows
  - [ ] **Low**: Step-oriented, detailed workflows
  - [ ] **Detailed**: Execution-oriented, specific workflows
- [ ] Level mapping:
  - [ ] High → Medium → Low → Detailed
  - [ ] Components can reference lower-level components
  - [ ] Components can be composed at same level

#### 1.3 Component Organization
- [ ] Organize components:
  - [ ] By abstraction level
  - [ ] By category/type
  - [ ] By functionality
  - [ ] In `.glyphnova/workflows/components/`
- [ ] Organization structure:
  - [ ] `components/high/` - High-level components
  - [ ] `components/medium/` - Medium-level components
  - [ ] `components/low/` - Low-level components
  - [ ] `components/detailed/` - Detailed components

**Success Criteria**:
- [ ] Component structure defined
- [ ] Abstraction levels defined
- [ ] Organization structure created
- [ ] Component interface clear

---

### Phase 2: Component Registry (2-2.5 hours)

**Goal**: Create component registry for discovery and management.

#### 2.1 Component Registry Service
- [ ] Create `web/src/services/componentRegistry.ts`:
  - [ ] `registerComponent(component: WorkflowComponent): void`
  - [ ] `getComponent(id: string): WorkflowComponent | undefined`
  - [ ] `getComponentsByLevel(level: string): WorkflowComponent[]`
  - [ ] `getComponentsByCategory(category: string): WorkflowComponent[]`
  - [ ] `searchComponents(query: string): WorkflowComponent[]`
- [ ] Registry structure:
  - [ ] In-memory registry
  - [ ] Indexed by ID, level, category
  - [ ] Searchable by name, description, tags

#### 2.2 Component Discovery
- [ ] Implement discovery:
  - [ ] Scan components directory
  - [ ] Parse component metadata
  - [ ] Index components
  - [ ] Build dependency graph
- [ ] Discovery features:
  - [ ] Auto-discover components
  - [ ] Validate component structure
  - [ ] Check dependencies
  - [ ] Report missing dependencies

#### 2.3 Component Indexing
- [ ] Create component index:
  - [ ] Index by abstraction level
  - [ ] Index by category
  - [ ] Index by tags
  - [ ] Index by dependencies
- [ ] Index structure:
  - [ ] Fast lookup by ID
  - [ ] Filter by level/category
  - [ ] Search by text
  - [ ] Dependency resolution

**Success Criteria**:
- [ ] Component registry created
- [ ] Components can be registered
- [ ] Components can be discovered
- [ ] Indexing works correctly

---

### Phase 3: Workflow Composition (3-4 hours)

**Goal**: Implement workflow composition from components.

#### 3.1 Component Composition
- [ ] Implement composition:
  - [ ] `composeWorkflow(components: WorkflowComponent[]): Workflow`
  - [ ] Merge component instructions
  - [ ] Combine context sources
  - [ ] Resolve dependencies
- [ ] Composition logic:
  - [ ] Combine markdown sections
  - [ ] Merge config nodes
  - [ ] Resolve conflicts
  - [ ] Validate composed workflow

#### 3.2 Workflow Inheritance
- [ ] Implement inheritance:
  - [ ] `extendWorkflow(base: Workflow, extension: WorkflowComponent): Workflow`
  - [ ] Override base workflow sections
  - [ ] Add new sections
  - [ ] Merge context sources
- [ ] Inheritance features:
  - [ ] Base workflow + extensions
  - [ ] Override specific sections
  - [ ] Add new capabilities
  - [ ] Preserve base structure

#### 3.3 Leveled Abstraction Composition
- [ ] Implement leveled composition:
  - [ ] High-level workflow references medium-level components
  - [ ] Medium-level references low-level components
  - [ ] Low-level references detailed components
  - [ ] Resolve all levels during execution
- [ ] Level resolution:
  - [ ] Start with high-level
  - [ ] Resolve to lower levels
  - [ ] Combine all levels
  - [ ] Execute at appropriate level

**Success Criteria**:
- [ ] Components can be composed
- [ ] Workflows can inherit
- [ ] Leveled composition works
- [ ] Composition validated

---

### Phase 4: Component Library & Templates (2-2.5 hours)

**Goal**: Create component library with reusable components.

#### 4.1 Base Components
- [ ] Create base components:
  - [ ] Context gathering components
  - [ ] Instruction execution components
  - [ ] Output formatting components
  - [ ] Error handling components
- [ ] Component examples:
  - [ ] `gather-file-context.md` - File context gathering
  - [ ] `gather-mcp-context.md` - MCP context gathering
  - [ ] `format-markdown-output.md` - Markdown output formatting
  - [ ] `handle-errors.md` - Error handling

#### 4.2 Workflow Templates
- [ ] Create workflow templates:
  - [ ] Code review template
  - [ ] Research template
  - [ ] Refactor template
  - [ ] Documentation template
- [ ] Template structure:
  - [ ] Base workflow structure
  - [ ] Placeholder sections
  - [ ] Example components
  - [ ] Usage instructions

#### 4.3 Component Documentation
- [ ] Document components:
  - [ ] Component purpose
  - [ ] Input/output specifications
  - [ ] Usage examples
  - [ ] Dependencies
- [ ] Documentation format:
  - [ ] In component metadata
  - [ ] Or separate README files
  - [ ] Searchable and accessible

**Success Criteria**:
- [ ] Base components created
- [ ] Templates available
- [ ] Components documented
- [ ] Library usable

---

### Phase 5: Integration & Execution (2-3 hours)

**Goal**: Integrate componentization with workflow execution.

#### 5.1 Execution Integration
- [ ] Integrate with workflow engine:
  - [ ] Resolve components during execution
  - [ ] Execute composed workflows
  - [ ] Handle component dependencies
  - [ ] Track component usage
- [ ] Execution flow:
  - [ ] Load workflow
  - [ ] Resolve components
  - [ ] Compose final workflow
  - [ ] Execute composed workflow

#### 5.2 Component Caching
- [ ] Implement caching:
  - [ ] Cache parsed components
  - [ ] Cache composed workflows
  - [ ] Invalidate on component change
  - [ ] Performance optimization
- [ ] Caching strategy:
  - [ ] Parse components once
  - [ ] Cache composition results
  - [ ] Watch for changes
  - [ ] Update cache

#### 5.3 Component Versioning
- [ ] Implement versioning:
  - [ ] Component version tracking
  - [ ] Dependency version resolution
  - [ ] Version compatibility checking
  - [ ] Version migration (optional)
- [ ] Version management:
  - [ ] Semantic versioning
  - [ ] Version constraints
  - [ ] Dependency resolution
  - [ ] Conflict resolution

**Success Criteria**:
- [ ] Execution integration works
- [ ] Component caching works
- [ ] Versioning works
- [ ] Integration complete

---

## Dependencies

### Internal Dependencies
- **Workflow Framework**: Workflow parsing and execution (from workflow framework plan)
- **File System**: GraphQL file operations
- **n8n Integration**: n8n client (from n8n integration plan)

### External Dependencies
- **None**: Pure TypeScript/React implementation

---

## Risk Assessment

### High Risk
- **Abstraction Complexity**: Complex abstraction system might be hard to understand
  - **Mitigation**: Clear documentation, examples, gradual introduction
- **Composition Complexity**: Complex composition logic might have edge cases
  - **Mitigation**: Thorough testing, clear composition rules, validation

### Medium Risk
- **Dependency Resolution**: Complex dependency resolution
  - **Mitigation**: Clear dependency rules, validation, error messages
- **Performance**: Component resolution might be slow
  - **Mitigation**: Caching, optimization, lazy loading

### Low Risk
- **Component Storage**: Standard file storage
- **Registry**: Standard registry pattern

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable componentization, use monolithic workflows
- **Component removal**: Remove component system, keep basic workflows

### Phase-Specific Rollback
- **Phase 1**: Remove abstraction levels, keep basic components
- **Phase 2**: Remove registry, keep basic component loading
- **Phase 3**: Remove composition, keep individual components
- **Phase 4**: Remove library, keep basic components
- **Phase 5**: Remove integration, keep basic execution

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore monolithic workflows
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Structure)
- [ ] Component structure defined
- [ ] Abstraction levels defined
- [ ] Organization created
- [ ] Interface clear

### After Phase 2 (Registry)
- [ ] Registry created
- [ ] Components registered
- [ ] Discovery works
- [ ] Indexing works

### After Phase 3 (Composition)
- [ ] Composition works
- [ ] Inheritance works
- [ ] Leveled composition works
- [ ] Validation works

### After Phase 4 (Library)
- [ ] Base components created
- [ ] Templates available
- [ ] Documentation complete
- [ ] Library usable

### After Phase 5 (Integration)
- [ ] Execution integration works
- [ ] Caching works
- [ ] Versioning works
- [ ] Integration complete

---

## Success Criteria

1. **Component Structure**: Components organized with clear structure
2. **Abstraction Levels**: Multiple abstraction levels supported
3. **Component Registry**: Components can be registered and discovered
4. **Workflow Composition**: Workflows can be composed from components
5. **Workflow Inheritance**: Workflows can inherit from base workflows
6. **Leveled Abstraction**: Components at different levels can be combined
7. **Component Library**: Reusable component library available
8. **Templates**: Workflow templates provided
9. **Documentation**: Components documented
10. **Execution Integration**: Componentization integrated with execution
11. **Component Caching**: Components cached for performance
12. **Versioning**: Component versioning supported
13. **Dependency Resolution**: Dependencies resolved correctly
14. **User Experience**: Component system intuitive
15. **Extensibility**: Easy to add new components

---

## Code Examples

### Example: Component Structure
```typescript
// web/src/services/workflowComponents.ts
export interface WorkflowComponent {
  id: string
  name: string
  description: string
  abstractionLevel: 'high' | 'medium' | 'low' | 'detailed'
  type: 'markdown' | 'config' | 'hybrid'
  filePath: string
  inputs: ComponentInput[]
  outputs: ComponentOutput[]
  dependencies?: string[]
  version: string
  metadata: {
    tags: string[]
    category: string
    author?: string
    examples?: string[]
  }
}

export interface ComponentInput {
  name: string
  type: string
  description: string
  required: boolean
  default?: any
}

export interface ComponentOutput {
  name: string
  type: string
  description: string
}
```

### Example: Component Registry
```typescript
// web/src/services/componentRegistry.ts
import type { WorkflowComponent } from './workflowComponents'

class ComponentRegistry {
  private components: Map<string, WorkflowComponent> = new Map()
  private byLevel: Map<string, WorkflowComponent[]> = new Map()
  private byCategory: Map<string, WorkflowComponent[]> = new Map()

  register(component: WorkflowComponent): void {
    this.components.set(component.id, component)

    // Index by level
    const levelComponents = this.byLevel.get(component.abstractionLevel) || []
    levelComponents.push(component)
    this.byLevel.set(component.abstractionLevel, levelComponents)

    // Index by category
    const categoryComponents = this.byCategory.get(component.metadata.category) || []
    categoryComponents.push(component)
    this.byCategory.set(component.metadata.category, categoryComponents)
  }

  get(id: string): WorkflowComponent | undefined {
    return this.components.get(id)
  }

  getByLevel(level: string): WorkflowComponent[] {
    return this.byLevel.get(level) || []
  }

  getByCategory(category: string): WorkflowComponent[] {
    return this.byCategory.get(category) || []
  }

  search(query: string): WorkflowComponent[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.components.values()).filter(component =>
      component.name.toLowerCase().includes(lowerQuery) ||
      component.description.toLowerCase().includes(lowerQuery) ||
      component.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  resolveDependencies(componentId: string): WorkflowComponent[] {
    const component = this.get(componentId)
    if (!component) return []

    const resolved = new Set<string>()
    const toResolve = [componentId]

    while (toResolve.length > 0) {
      const currentId = toResolve.pop()!
      if (resolved.has(currentId)) continue

      const current = this.get(currentId)
      if (!current) continue

      resolved.add(currentId)

      if (current.dependencies) {
        toResolve.push(...current.dependencies)
      }
    }

    return Array.from(resolved).map(id => this.get(id)!).filter(Boolean)
  }
}

export const componentRegistry = new ComponentRegistry()
```

### Example: Workflow Composition
```typescript
// web/src/services/workflowComposer.ts
import { componentRegistry } from './componentRegistry'
import type { MarkdownWorkflow, ConfigWorkflow } from './workflowParser'

export class WorkflowComposer {
  composeFromComponents(
    componentIds: string[]
  ): MarkdownWorkflow | ConfigWorkflow {
    const components = componentIds
      .map(id => componentRegistry.get(id))
      .filter(Boolean) as WorkflowComponent[]

    // Resolve all dependencies
    const allComponents = new Set<WorkflowComponent>()
    components.forEach(comp => {
      allComponents.add(comp)
      const deps = componentRegistry.resolveDependencies(comp.id)
      deps.forEach(dep => allComponents.add(dep))
    })

    // Compose workflow
    return this.composeWorkflow(Array.from(allComponents))
  }

  private composeWorkflow(
    components: WorkflowComponent[]
  ): MarkdownWorkflow {
    // Sort by abstraction level (high to detailed)
    const sorted = components.sort((a, b) => {
      const levels = { high: 0, medium: 1, low: 2, detailed: 3 }
      return levels[a.abstractionLevel] - levels[b.abstractionLevel]
    })

    // Start with highest level component
    const base = sorted[0]
    let workflow = this.loadComponentWorkflow(base)

    // Merge lower level components
    for (let i = 1; i < sorted.length; i++) {
      const component = sorted[i]
      const componentWorkflow = this.loadComponentWorkflow(component)
      workflow = this.mergeWorkflows(workflow, componentWorkflow)
    }

    return workflow
  }

  private mergeWorkflows(
    base: MarkdownWorkflow,
    extension: MarkdownWorkflow
  ): MarkdownWorkflow {
    return {
      name: base.name,
      contextSources: {
        ...base.contextSources,
        ...extension.contextSources,
        files: [
          ...(base.contextSources?.files || []),
          ...(extension.contextSources?.files || []),
        ],
        mcp: [
          ...(base.contextSources?.mcp || []),
          ...(extension.contextSources?.mcp || []),
        ],
        rag: [
          ...(base.contextSources?.rag || []),
          ...(extension.contextSources?.rag || []),
        ],
      },
      instructions: {
        ...base.instructions,
        ...extension.instructions,
        goals: [
          ...(base.instructions?.goals || []),
          ...(extension.instructions?.goals || []),
        ],
        process: [
          ...(base.instructions?.process || []),
          ...(extension.instructions?.process || []),
        ],
      },
      contextRules: {
        ...base.contextRules,
        ...extension.contextRules,
      },
      outputFormat: extension.outputFormat || base.outputFormat,
      qualityMetrics: [
        ...(base.qualityMetrics || []),
        ...(extension.qualityMetrics || []),
      ],
    }
  }

  private loadComponentWorkflow(
    component: WorkflowComponent
  ): MarkdownWorkflow {
    // Load workflow from component file path
    // Implementation depends on file loading
    return {} as MarkdownWorkflow
  }
}
```

### Example: Leveled Abstraction
```typescript
// Example: High-level component references medium-level components
// workflows/components/high/code-review.md
```markdown
# Code Review Workflow (High Level)

## Context Sources
- Files: Current file + dependencies
- MCP: git, testing
- RAG: code-standards

## Instructions
### Process
1. Use @gather-context component
2. Use @analyze-code component
3. Use @format-feedback component
```

// workflows/components/medium/gather-context.md
```markdown
# Gather Context Component (Medium Level)

## Instructions
### Process
1. Use @gather-files component
2. Use @gather-mcp component
3. Use @gather-rag component
4. Combine results
```

// workflows/components/low/gather-files.md
```markdown
# Gather Files Component (Low Level)

## Instructions
### Process
1. Parse file patterns
2. Read files via GraphQL
3. Apply chunking strategy
4. Return file contexts
```
```

### Example: Component Discovery
```typescript
// web/src/services/componentDiscovery.ts
import { listWorkflows } from './workflowFiles'
import { parseMarkdownWorkflow, parseConfigWorkflow } from './workflowParser'
import { componentRegistry } from './componentRegistry'

export async function discoverComponents(
  folderPath: string
): Promise<void> {
  const componentsDir = `${folderPath}/.glyphnova/workflows/components`
  const workflowFiles = await listWorkflows(componentsDir)

  for (const file of workflowFiles) {
    try {
      const workflow = await loadWorkflow(file.path)
      const component = extractComponentMetadata(workflow, file)
      componentRegistry.register(component)
    } catch (error) {
      console.error(`Failed to load component ${file.path}:`, error)
    }
  }
}

function extractComponentMetadata(
  workflow: MarkdownWorkflow | ConfigWorkflow,
  file: WorkflowFile
): WorkflowComponent {
  // Extract metadata from workflow
  // Determine abstraction level from workflow structure
  // Extract dependencies
  // Create component object
  return {
    id: generateComponentId(file.name),
    name: workflow.name,
    description: extractDescription(workflow),
    abstractionLevel: determineAbstractionLevel(workflow),
    type: file.type,
    filePath: file.path,
    inputs: extractInputs(workflow),
    outputs: extractOutputs(workflow),
    dependencies: extractDependencies(workflow),
    version: '1.0.0',
    metadata: {
      tags: extractTags(workflow),
      category: determineCategory(workflow),
    },
  }
}
```

---

## Notes

- Componentization enables workflow reuse and composition
- Abstraction levels allow workflows at different detail levels
- Component registry enables discovery and management
- Composition allows building complex workflows from simple components
- Inheritance allows extending base workflows
- Leveled abstraction enables hierarchical workflow organization
- Component library provides reusable building blocks
- Versioning ensures component compatibility
- Dependencies must be resolved correctly
- Performance is important - cache components

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
