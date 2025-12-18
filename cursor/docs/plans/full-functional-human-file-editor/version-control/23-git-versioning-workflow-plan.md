---
name: Git Versioning Workflow Implementation Plan
overview: Implement leveled file versioning system using git with staging versioning, commit versioning, branch versioning, and navigation through git operations
todos: []
---

# Git Versioning Workflow Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement a leveled file versioning system using git that provides staging versioning (working directory → staging area), commit versioning (staging → commits), branch versioning (commits → branches), and navigation through git operations. This enables users to manage file versions at different levels of abstraction within the application.

---

## Overview

This plan implements a git versioning workflow system that:
- Provides git operations UI (stage, commit, branch)
- Shows file status (modified, staged, committed)
- Enables staging versioning (working → staging)
- Enables commit versioning (staging → commits)
- Enables branch versioning (commits → branches)
- Provides git navigation (view diffs, history, branches)
- Integrates with file tree and editor
- Shows git status indicators

**Target**: Complete git versioning workflow system with leveled abstraction
**Priority**: Medium (version control feature)
**Estimated Time**: 10-12 hours (with 20% buffer: 12-14.4 hours)
**Risk Level**: Medium-High (complex git integration, external dependency)

---

## Current State Analysis

### Existing Implementation
- **No Git Integration**: No git operations in application
- **No Version Control UI**: No git status or operations UI
- **No Git Status**: File tree doesn't show git status
- **No Git Operations**: Cannot stage, commit, or branch from app

### Gaps Identified
- No git client/library
- No git status detection
- No staging UI
- No commit UI
- No branch management
- No git navigation

---

## External Documentation Links

### Git Integration
1. **isomorphic-git**
   - Link: https://isomorphic-git.org/
   - Description: Pure JavaScript git implementation
   - Rating: High - Popular git library for JavaScript

2. **simple-git**
   - Link: https://github.com/steveukx/git-js
   - Description: Simple git wrapper for Node.js
   - Rating: High - Popular git library

3. **nodegit**
   - Link: https://github.com/nodegit/nodegit
   - Description: Native Node.js bindings to libgit2
   - Rating: High - Native git bindings

### Git Operations
4. **Git Documentation**
   - Link: https://git-scm.com/doc
   - Description: Official git documentation
   - Rating: High - Official git docs

5. **Git Status**
   - Link: https://git-scm.com/docs/git-status
   - Description: Git status command reference
   - Rating: High - Git command reference

### Git UI Patterns
6. **VSCode Git Integration**
   - Link: https://code.visualstudio.com/docs/editor/versioncontrol
   - Description: VSCode git integration patterns
   - Rating: High - VSCode git UI reference

7. **GitHub Desktop**
   - Link: https://desktop.github.com/
   - Description: Git GUI patterns (reference)
   - Rating: Medium - Git GUI reference

### Diff & History
8. **Git Diff**
   - Link: https://git-scm.com/docs/git-diff
   - Description: Git diff command reference
   - Rating: High - Git command reference

9. **Git Log**
   - Link: https://git-scm.com/docs/git-log
   - Description: Git log command reference
   - Rating: High - Git command reference

---

## Implementation Phases

### Phase 1: Git Client & Status Detection (2.5-3 hours)

**Goal**: Create git client and implement status detection.

#### 1.1 Git Client Service
- [ ] Create `api/src/services/git/gitService.ts`:
  - [ ] Git operations wrapper
  - [ ] Use `simple-git` or `isomorphic-git`
  - [ ] Handle git repository detection
  - [ ] Error handling
- [ ] Git client structure:
  ```typescript
  class GitService {
    async getStatus(repoPath: string): Promise<GitStatus>
    async stageFile(repoPath: string, filePath: string): Promise<void>
    async unstageFile(repoPath: string, filePath: string): Promise<void>
    async commit(repoPath: string, message: string): Promise<string>
    async getBranches(repoPath: string): Promise<Branch[]>
    async getCommits(repoPath: string, limit?: number): Promise<Commit[]>
    async getDiff(repoPath: string, filePath: string): Promise<string>
  }
  ```

#### 1.2 Git Status Detection
- [ ] Implement status detection:
  - [ ] Detect git repository
  - [ ] Get file status (modified, staged, untracked)
  - [ ] Get branch information
  - [ ] Get commit information
- [ ] Status structure:
  ```typescript
  interface GitStatus {
    branch: string
    isClean: boolean
    files: {
      modified: string[]
      staged: string[]
      untracked: string[]
      deleted: string[]
    }
    ahead: number
    behind: number
  }
  ```

#### 1.3 GraphQL Integration
- [ ] Create GraphQL queries/mutations:
  - [ ] `gitStatus(repoPath: String!): GitStatus`
  - [ ] `gitBranches(repoPath: String!): [Branch!]!`
  - [ ] `gitCommits(repoPath: String!, limit: Int): [Commit!]!`
  - [ ] `stageFile(repoPath: String!, filePath: String!): Boolean`
  - [ ] `unstageFile(repoPath: String!, filePath: String!): Boolean`
  - [ ] `commit(repoPath: String!, message: String!): Commit`

**Success Criteria**:
- [ ] Git client created
- [ ] Status detection works
- [ ] GraphQL integration complete
- [ ] Error handling works

---

### Phase 2: Staging Versioning UI (2-2.5 hours)

**Goal**: Create UI for staging operations (working → staging).

#### 2.1 Git Status Indicators
- [ ] Add git status to file tree:
  - [ ] Modified files: Orange indicator
  - [ ] Staged files: Green indicator
  - [ ] Untracked files: Blue indicator
  - [ ] No indicator for clean files
- [ ] Status indicators:
  - [ ] Icon or badge next to file name
  - [ ] Color-coded for quick recognition
  - [ ] Tooltip with status details

#### 2.2 Staging UI
- [ ] Create `GitStagingPanel.tsx`:
  - [ ] List modified files
  - [ ] List staged files
  - [ ] Stage/unstage buttons
  - [ ] Stage all/unstage all buttons
- [ ] Staging features:
  - [ ] Click to stage file
  - [ ] Click to unstage file
  - [ ] Stage all modified
  - [ ] Unstage all staged

#### 2.3 File Diff View
- [ ] Create diff view:
  - [ ] Show file diff (working vs staged)
  - [ ] Side-by-side or unified diff
  - [ ] Syntax highlighting
  - [ ] Line-by-line changes
- [ ] Diff display:
  - [ ] Highlight additions/deletions
  - [ ] Show line numbers
  - [ ] Scrollable for large diffs

**Success Criteria**:
- [ ] Git status shown in file tree
- [ ] Staging UI functional
- [ ] Files can be staged/unstaged
- [ ] Diff view works

---

### Phase 3: Commit Versioning UI (2-2.5 hours)

**Goal**: Create UI for commit operations (staging → commits).

#### 3.1 Commit UI
- [ ] Create `GitCommitPanel.tsx`:
  - [ ] Commit message input
  - [ ] List of staged files
  - [ ] Commit button
  - [ ] Commit history
- [ ] Commit features:
  - [ ] Enter commit message
  - [ ] Preview staged changes
  - [ ] Commit staged files
  - [ ] View commit history

#### 3.2 Commit History
- [ ] Display commit history:
  - [ ] List of commits
  - [ ] Commit message, author, date
  - [ ] Click to view commit details
  - [ ] Navigate to commit
- [ ] History features:
  - [ ] Sort by date (newest first)
  - [ ] Filter by author/branch
  - [ ] View commit diff
  - [ ] Navigate to specific commit

#### 3.3 Commit Navigation
- [ ] Implement commit navigation:
  - [ ] View file at specific commit
  - [ ] Compare commits
  - [ ] Revert to commit
  - [ ] Create branch from commit
- [ ] Navigation features:
  - [ ] Click commit to view
  - [ ] Select commit range for diff
  - [ ] Restore file from commit

**Success Criteria**:
- [ ] Commit UI functional
- [ ] Commits can be created
- [ ] Commit history displays
- [ ] Commit navigation works

---

### Phase 4: Branch Versioning UI (2-2.5 hours)

**Goal**: Create UI for branch operations (commits → branches).

#### 4.1 Branch Management UI
- [ ] Create `GitBranchPanel.tsx`:
  - [ ] List of branches
  - [ ] Current branch indicator
  - [ ] Create branch button
  - [ ] Switch branch button
  - [ ] Delete branch button
- [ ] Branch features:
  - [ ] List all branches
  - [ ] Show current branch
  - [ ] Create new branch
  - [ ] Switch branches
  - [ ] Delete branches

#### 4.2 Branch Navigation
- [ ] Implement branch navigation:
  - [ ] View files on different branch
  - [ ] Compare branches
  - [ ] Merge branches (optional)
  - [ ] Branch history
- [ ] Navigation features:
  - [ ] Switch branch to view files
  - [ ] Compare branch diffs
  - [ ] View branch commits
  - [ ] Navigate branch history

#### 4.3 Branch Status
- [ ] Show branch status:
  - [ ] Current branch name
  - [ ] Branch ahead/behind status
  - [ ] Branch commit count
  - [ ] Last commit on branch
- [ ] Status display:
  - [ ] In git panel header
  - [ ] In file tree header
  - [ ] Clear and visible

**Success Criteria**:
- [ ] Branch management UI works
- [ ] Branches can be created/switched
- [ ] Branch navigation works
- [ ] Branch status displays

---

### Phase 5: Integration & Navigation (1.5-2 hours)

**Goal**: Complete integration and add navigation features.

#### 5.1 File Tree Integration
- [ ] Integrate git status with file tree:
  - [ ] Show status indicators
  - [ ] Context menu git operations
  - [ ] Click to view diff
  - [ ] Right-click git actions
- [ ] Integration points:
  - [ ] Update FileTreeItem with git status
  - [ ] Add git context menu items
  - [ ] Show git status in tooltip

#### 5.2 Editor Integration
- [ ] Integrate with editor:
  - [ ] Show file git status
  - [ ] View file diff
  - [ ] Restore from git
  - [ ] Compare with previous version
- [ ] Editor features:
  - [ ] Git status indicator
  - [ ] Diff view toggle
  - [ ] Version history
  - [ ] Restore functionality

#### 5.3 Git Panel Integration
- [ ] Create git panel:
  - [ ] Git status summary
  - [ ] Staging area
  - [ ] Commit area
  - [ ] Branch area
  - [ ] History area
- [ ] Panel layout:
  - [ ] Tabbed interface
  - [ ] Or accordion sections
  - [ ] Clear organization
  - [ ] VSCode-style design

**Success Criteria**:
- [ ] File tree integration works
- [ ] Editor integration works
- [ ] Git panel functional
- [ ] Integration complete

---

## Dependencies

### Internal Dependencies
- **File Tree**: File tree component for status indicators
- **Editor**: Editor component for diff view
- **GraphQL API**: For git operations

### External Dependencies
- **Git Library**: `simple-git` or `isomorphic-git` or `nodegit`
- **Git Repository**: User's project must be a git repository

---

## Risk Assessment

### High Risk
- **Git Library Integration**: Complex git library integration
  - **Mitigation**: Use well-maintained library, test thoroughly, handle errors
- **Git Operations**: Git operations might fail or have side effects
  - **Mitigation**: Validate operations, confirm destructive actions, handle errors gracefully

### Medium Risk
- **Performance**: Git operations might be slow on large repos
  - **Mitigation**: Cache git status, optimize operations, show loading states
- **Git Repository Detection**: Detecting git repos might be complex
  - **Mitigation**: Check for .git directory, handle nested repos, provide clear errors

### Low Risk
- **UI Components**: Standard React components
- **Status Display**: Simple status indicators

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable git integration, remove UI
- **Component removal**: Remove git components, keep structure

### Phase-Specific Rollback
- **Phase 1**: Remove git client, keep structure
- **Phase 2**: Remove staging UI, keep status detection
- **Phase 3**: Remove commit UI, keep staging
- **Phase 4**: Remove branch UI, keep commit
- **Phase 5**: Remove integration, keep basic operations

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous state
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Git Client)
- [ ] Git client created
- [ ] Status detection works
- [ ] GraphQL integration complete
- [ ] Error handling works

### After Phase 2 (Staging)
- [ ] Status indicators show
- [ ] Staging UI works
- [ ] Files can be staged
- [ ] Diff view works

### After Phase 3 (Commit)
- [ ] Commit UI works
- [ ] Commits can be created
- [ ] History displays
- [ ] Navigation works

### After Phase 4 (Branch)
- [ ] Branch UI works
- [ ] Branches can be managed
- [ ] Navigation works
- [ ] Status displays

### After Phase 5 (Integration)
- [ ] File tree integration works
- [ ] Editor integration works
- [ ] Git panel functional
- [ ] Integration complete

---

## Success Criteria

1. **Git Status Detection**: File git status detected and displayed
2. **Staging Versioning**: Files can be staged/unstaged (working → staging)
3. **Commit Versioning**: Staged files can be committed (staging → commits)
4. **Branch Versioning**: Commits organized in branches (commits → branches)
5. **Git Navigation**: Can navigate through git history and branches
6. **Status Indicators**: Git status shown in file tree
7. **Diff View**: File diffs can be viewed
8. **Commit History**: Commit history can be viewed and navigated
9. **Branch Management**: Branches can be created, switched, deleted
10. **Integration**: Git features integrated with file tree and editor
11. **Error Handling**: Git errors handled gracefully
12. **Performance**: Git operations performant
13. **User Experience**: Git UI intuitive and responsive
14. **Documentation**: Git features documented
15. **No Regressions**: Existing functionality unchanged

---

## Code Examples

### Example: Git Service
```typescript
// api/src/services/git/gitService.ts
import simpleGit, { SimpleGit } from 'simple-git'
import * as path from 'path'

interface GitStatus {
  branch: string
  isClean: boolean
  files: {
    modified: string[]
    staged: string[]
    untracked: string[]
    deleted: string[]
  }
  ahead: number
  behind: number
}

interface Branch {
  name: string
  current: boolean
  commit: string
  message: string
}

interface Commit {
  hash: string
  message: string
  author: string
  date: Date
  files: string[]
}

export class GitService {
  private git: SimpleGit

  constructor(repoPath: string) {
    this.git = simpleGit(repoPath)
  }

  async getStatus(): Promise<GitStatus> {
    const status = await this.git.status()
    const branch = await this.git.revparse(['--abbrev-ref', 'HEAD'])

    return {
      branch: branch.trim(),
      isClean: status.isClean(),
      files: {
        modified: status.modified,
        staged: status.staged,
        untracked: status.not_added,
        deleted: status.deleted,
      },
      ahead: status.ahead,
      behind: status.behind,
    }
  }

  async stageFile(filePath: string): Promise<void> {
    await this.git.add(filePath)
  }

  async unstageFile(filePath: string): Promise<void> {
    await this.git.reset(['HEAD', filePath])
  }

  async stageAll(): Promise<void> {
    await this.git.add('.')
  }

  async unstageAll(): Promise<void> {
    await this.git.reset(['HEAD'])
  }

  async commit(message: string): Promise<string> {
    const result = await this.git.commit(message)
    return result.commit
  }

  async getBranches(): Promise<Branch[]> {
    const branches = await this.git.branchLocal()
    const current = branches.current

    return branches.all.map(name => ({
      name,
      current: name === current,
      commit: '', // Would need to get commit hash
      message: '', // Would need to get commit message
    }))
  }

  async getCommits(limit: number = 20): Promise<Commit[]> {
    const log = await this.git.log({ maxCount: limit })

    return log.all.map(commit => ({
      hash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      date: new Date(commit.date),
      files: [], // Would need to get changed files
    }))
  }

  async getDiff(filePath: string): Promise<string> {
    return this.git.diff([filePath])
  }

  async createBranch(branchName: string): Promise<void> {
    await this.git.checkoutLocalBranch(branchName)
  }

  async switchBranch(branchName: string): Promise<void> {
    await this.git.checkout(branchName)
  }

  async deleteBranch(branchName: string): Promise<void> {
    await this.git.deleteLocalBranch(branchName)
  }
}
```

### Example: Git Status in File Tree
```tsx
// web/src/components/FileTree/FileTreeItem.tsx (with git status)
import { useGitStatus } from 'src/hooks/useGitStatus'

export const FileTreeItem = ({ ... }: FileTreeItemProps) => {
  const gitStatus = useGitStatus()
  const fileStatus = gitStatus?.files[node.path]

  return (
    <div className="flex items-center ...">
      {/* File icon */}
      <FileIcon ... />

      {/* Git status indicator */}
      {fileStatus && (
        <span
          className={cn(
            'ml-1 h-2 w-2 rounded-full',
            fileStatus === 'modified' && 'bg-orange-400',
            fileStatus === 'staged' && 'bg-green-400',
            fileStatus === 'untracked' && 'bg-blue-400'
          )}
          title={`Git status: ${fileStatus}`}
        />
      )}

      <span className="truncate ...">{node.name}</span>
    </div>
  )
}
```

### Example: Git Staging Panel
```tsx
// web/src/components/Git/GitStagingPanel.tsx
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@redwoodjs/web'
import { gql } from '@apollo/client'
import { useAppStore } from 'src/state/store'

const GIT_STATUS_QUERY = gql`
  query GitStatus($repoPath: String!) {
    gitStatus(repoPath: $repoPath) {
      branch
      isClean
      files {
        modified
        staged
        untracked
        deleted
      }
    }
  }
`

const STAGE_FILE_MUTATION = gql`
  mutation StageFile($repoPath: String!, $filePath: String!) {
    stageFile(repoPath: $repoPath, filePath: $filePath)
  }
`

export const GitStagingPanel = () => {
  const openFolderPath = useAppStore((state) => state.openFolderPath)
  const { data, refetch } = useQuery(GIT_STATUS_QUERY, {
    variables: { repoPath: openFolderPath || '' },
    skip: !openFolderPath,
  })

  const [stageFile] = useMutation(STAGE_FILE_MUTATION)

  const handleStageFile = async (filePath: string) => {
    await stageFile({
      variables: { repoPath: openFolderPath, filePath },
    })
    refetch()
  }

  const status = data?.gitStatus

  return (
    <div className="git-staging-panel">
      <h3 className="px-4 py-2 text-sm font-semibold text-vscode-fg">
        Staging Area
      </h3>

      {/* Modified Files */}
      <div className="px-4 py-2">
        <h4 className="text-xs font-medium text-vscode-fg-secondary mb-2">
          Modified ({status?.files.modified.length || 0})
        </h4>
        {status?.files.modified.map(file => (
          <div key={file} className="flex items-center justify-between py-1">
            <span className="text-sm text-vscode-fg">{file}</span>
            <button
              onClick={() => handleStageFile(file)}
              className="px-2 py-1 text-xs rounded bg-vscode-button-bg text-vscode-button-fg"
            >
              Stage
            </button>
          </div>
        ))}
      </div>

      {/* Staged Files */}
      <div className="px-4 py-2 border-t border-vscode-border">
        <h4 className="text-xs font-medium text-vscode-fg-secondary mb-2">
          Staged ({status?.files.staged.length || 0})
        </h4>
        {status?.files.staged.map(file => (
          <div key={file} className="flex items-center justify-between py-1">
            <span className="text-sm text-vscode-fg">{file}</span>
            <button
              onClick={() => handleUnstageFile(file)}
              className="px-2 py-1 text-xs rounded bg-vscode-button-bg text-vscode-button-fg"
            >
              Unstage
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Example: Git Commit Panel
```tsx
// web/src/components/Git/GitCommitPanel.tsx
import { useState } from 'react'
import { useMutation } from '@redwoodjs/web'
import { gql } from '@apollo/client'

const COMMIT_MUTATION = gql`
  mutation Commit($repoPath: String!, $message: String!) {
    commit(repoPath: $repoPath, message: $message) {
      hash
      message
    }
  }
`

export const GitCommitPanel = () => {
  const [commitMessage, setCommitMessage] = useState('')
  const [commit] = useMutation(COMMIT_MUTATION)

  const handleCommit = async () => {
    if (!commitMessage.trim()) return

    await commit({
      variables: {
        repoPath: openFolderPath,
        message: commitMessage,
      },
    })

    setCommitMessage('')
    // Refresh git status
  }

  return (
    <div className="git-commit-panel">
      <h3 className="px-4 py-2 text-sm font-semibold text-vscode-fg">
        Commit
      </h3>

      <div className="px-4 py-2">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit message..."
          className="w-full rounded border border-vscode-border bg-vscode-input-bg px-3 py-2 text-sm text-vscode-fg"
          rows={3}
        />
        <button
          onClick={handleCommit}
          disabled={!commitMessage.trim()}
          className="mt-2 px-4 py-2 rounded bg-vscode-button-bg text-vscode-button-fg"
        >
          Commit
        </button>
      </div>
    </div>
  )
}
```

### Example: Git Branch Panel
```tsx
// web/src/components/Git/GitBranchPanel.tsx
import { useState } from 'react'
import { useQuery, useMutation } from '@redwoodjs/web'
import { gql } from '@apollo/client'

const GIT_BRANCHES_QUERY = gql`
  query GitBranches($repoPath: String!) {
    gitBranches(repoPath: $repoPath) {
      name
      current
      commit
      message
    }
  }
`

const SWITCH_BRANCH_MUTATION = gql`
  mutation SwitchBranch($repoPath: String!, $branchName: String!) {
    switchBranch(repoPath: $repoPath, branchName: $branchName)
  }
`

export const GitBranchPanel = () => {
  const openFolderPath = useAppStore((state) => state.openFolderPath)
  const { data, refetch } = useQuery(GIT_BRANCHES_QUERY, {
    variables: { repoPath: openFolderPath || '' },
    skip: !openFolderPath,
  })

  const [switchBranch] = useMutation(SWITCH_BRANCH_MUTATION)

  const handleSwitchBranch = async (branchName: string) => {
    await switchBranch({
      variables: { repoPath: openFolderPath, branchName },
    })
    refetch()
    // Refresh file tree
  }

  return (
    <div className="git-branch-panel">
      <h3 className="px-4 py-2 text-sm font-semibold text-vscode-fg">
        Branches
      </h3>

      <div className="space-y-1">
        {data?.gitBranches.map(branch => (
          <button
            key={branch.name}
            onClick={() => handleSwitchBranch(branch.name)}
            className={cn(
              'w-full px-4 py-2 text-left text-sm hover:bg-vscode-hover-bg',
              branch.current && 'bg-vscode-selection-bg'
            )}
          >
            <div className="flex items-center gap-2">
              {branch.current && (
                <span className="text-xs text-vscode-active-border">●</span>
              )}
              <span className="font-medium text-vscode-fg">{branch.name}</span>
            </div>
            <div className="text-xs text-vscode-fg-secondary">
              {branch.message}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## Notes

- Git integration requires git repository in project
- Use well-maintained git library (simple-git recommended)
- Git operations should be validated and confirmed
- Handle git errors gracefully
- Show loading states for git operations
- Cache git status for performance
- Support both staging and commit workflows
- Branch management enables workflow organization
- Git navigation enables version exploration
- Consider adding merge/rebase operations (future)
- Git panel should match VSCode git UI patterns

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
