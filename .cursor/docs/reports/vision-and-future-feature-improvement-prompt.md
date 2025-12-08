So I've made some minor edits in /home/jon/code/glyph-nova/.cursor/docs/reports/project-vision.md
, but have added some key notes in /home/jon/code/glyph-nova/.cursor/docs/reports/future-features.md
that I've labed with descriptive tags at the beginning of the line then details of what you are to do you are to replace both the tag and prompt with added info or edits e.g.
`<ADD_TO_HERE>I want you to add a section...`
Only remove tags and corresponding prompts after the file edits are made and you've verified the prompt is complete through checking the file for deliverables.
Also, here are your answers so edit the documents accordingly:
1. Multi-Machine Swarm Architecture
Questions:
How soon do you want multi-machine swarm functionality? (Phase 1 vs Phase 4?)
Should the swarm support cloud-hosted nodes (AWS/GCP), or strictly local/self-hosted machines?
What's your target network topology?
Star: One coordinator, multiple workers
Mesh: Peer-to-peer, any node can coordinate
Hierarchical: Regional clusters with local coordinators
Ans:
Notes:
2. Mode System Power & Flexibility
Questions:
Should modes be Turing-complete (able to run arbitrary code/scripts), or purely declarative (configuration only)?
How should mode inheritance work?
Extends: Single parent, child overrides specific sections
Mixins: Multiple parents, merge strategies
Composition: Mix-and-match reusable components
Should there be a "mode marketplace" where users can share and download modes from the community?
Do you want modes to be able to spawn sub-agents or create workflows with multiple steps?
Ans:
Notes:
3. Context Engineering Trade-offs
Questions:
Speed vs Accuracy: What's more important for context gathering?
Fast but potentially incomplete context (< 500ms)
Comprehensive but slower context (2-5s gathering time)
Hybrid: Fast initial, then enrich in background
Should RAG (vector search) be mandatory for every query, or opt-in per mode?
How much control should users have over chunking strategies?
Automatic: AI decides optimal chunking
Configurable: Users set chunk size/strategy per file type
Manual: Users can override per-file if needed
Should the system prefetch context for likely next queries (predictive loading)?
Ans:
Notes:
4. Self-Improvement & Automation Boundaries
Questions:
Should AI be allowed to modify modes without user approval in any scenario?
Never (always require approval)
Low-risk changes only (formatting, minor tweaks)
High-confidence changes (>95% confidence score + 20+ successful sessions)
What's the approval workflow you prefer?
Single approval: One user says yes → change applies
Session-based: Change applies after N successful sessions
A/B testing: Run old vs new mode side-by-side, pick winner
How should conflicting learned patterns be resolved?
User chooses between options
Highest confidence wins automatically
Create mode variants (mode-v1, mode-v2)
Should the system learn from rejected outputs (anti-patterns), or only approved ones?
Ans:
Notes:
5. Editor Philosophy & Primary Use Cases
Questions:
Primary audience priority:
Developers writing code (80%) + researchers (20%)
Equal split: coding + writing/research
Researchers/writers first, code editing secondary
Should Glyph Nova support non-code use cases as first-class citizens?
Scientific writing with citations
Creative writing (novels, essays)
Personal knowledge management (daily notes, journals)
Meeting notes and task management
VSCode compatibility level:
Must run all major VSCode extensions (high priority)
Import configs/themes only, extensions are nice-to-have
Inspiration only, don't need compatibility
Should the editor support collaborative editing (multiple cursors, real-time sync)?
Yes, critical for pair programming
Yes, but low priority (Phase 5+)
No, single-user focus only
Ans:
Notes:
