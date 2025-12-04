/**
 * File Utilities
 *
 * Language detection and file type utilities for editor components.
 *
 * Reference: Report 06 (File type detection section)
 */

/**
 * Detect file type category (markdown, code, or text)
 *
 * @param filePath - Path to the file
 * @returns File type category
 */
export const detectFileType = (
  filePath: string
): 'markdown' | 'code' | 'text' => {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''

  const markdownExtensions = ['md', 'markdown', 'mdown', 'mkd']
  const codeExtensions = [
    'js',
    'ts',
    'jsx',
    'tsx',
    'py',
    'java',
    'cpp',
    'c',
    'h',
    'hpp',
    'go',
    'rs',
    'php',
    'rb',
    'swift',
    'kt',
    'scala',
    'html',
    'htm',
    'css',
    'scss',
    'sass',
    'less',
    'json',
    'yaml',
    'yml',
    'xml',
    'sql',
    'sh',
    'bash',
    'zsh',
    'fish',
    'ps1',
    'bat',
    'cmd',
    'dockerfile',
    'r',
    'R',
    'm',
    'mm',
    'vue',
    'svelte',
    'elm',
    'clj',
    'cljs',
    'hs',
    'lua',
    'pl',
    'pm',
    'ex',
    'exs',
    'erl',
    'hrl',
    'fs',
    'fsx',
    'fsi',
    'ml',
    'mli',
    'v',
    'sv',
    'vhd',
    'vhdl',
    'cmake',
    'make',
    'mk',
    'toml',
    'ini',
    'cfg',
    'conf',
    'log',
    'txt',
    'gitignore',
    'editorconfig',
    'prettierrc',
    'eslintrc',
  ]

  if (markdownExtensions.includes(ext)) {
    return 'markdown'
  }

  if (codeExtensions.includes(ext)) {
    return 'code'
  }

  return 'text'
}

/**
 * Detect programming language from file path for syntax highlighting
 *
 * Maps file extensions to language identifiers supported by react-syntax-highlighter
 *
 * @param filePath - Path to the file
 * @returns Language identifier for syntax highlighting
 *
 * Reference: Report 06 (File type detection section)
 */
export const detectLanguage = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''

  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    // Python
    py: 'python',
    pyw: 'python',
    pyi: 'python',
    // Java
    java: 'java',
    // C/C++
    c: 'c',
    h: 'c',
    cpp: 'cpp',
    cxx: 'cpp',
    cc: 'cpp',
    hpp: 'cpp',
    hxx: 'cpp',
    hh: 'cpp',
    // Go
    go: 'go',
    // Rust
    rs: 'rust',
    // PHP
    php: 'php',
    phtml: 'php',
    // Ruby
    rb: 'ruby',
    // Swift
    swift: 'swift',
    // Kotlin
    kt: 'kotlin',
    kts: 'kotlin',
    // Scala
    scala: 'scala',
    sc: 'scala',
    // Web
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    // Data formats
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    toml: 'toml',
    // SQL
    sql: 'sql',
    // Shell scripts
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    fish: 'bash',
    // PowerShell
    ps1: 'powershell',
    psd1: 'powershell',
    psm1: 'powershell',
    // Batch
    bat: 'batch',
    cmd: 'batch',
    // Docker
    dockerfile: 'dockerfile',
    dockerignore: 'dockerfile',
    // R
    r: 'r',
    R: 'r',
    // Objective-C/C++
    m: 'objectivec',
    mm: 'objectivec',
    // Vue
    vue: 'vue',
    // Svelte
    svelte: 'svelte',
    // Markdown
    md: 'markdown',
    markdown: 'markdown',
    mdown: 'markdown',
    mkd: 'markdown',
    // Clojure
    clj: 'clojure',
    cljs: 'clojure',
    cljc: 'clojure',
    // Haskell
    hs: 'haskell',
    lhs: 'haskell',
    // Lua
    lua: 'lua',
    // Perl
    pl: 'perl',
    pm: 'perl',
    // Elixir
    ex: 'elixir',
    exs: 'elixir',
    // Erlang
    erl: 'erlang',
    hrl: 'erlang',
    // F#
    fs: 'fsharp',
    fsx: 'fsharp',
    fsi: 'fsharp',
    // OCaml
    ml: 'ocaml',
    mli: 'ocaml',
    // Verilog/SystemVerilog
    v: 'verilog',
    sv: 'systemverilog',
    vhd: 'vhdl',
    vhdl: 'vhdl',
    // CMake
    cmake: 'cmake',
    // Makefile
    make: 'makefile',
    mk: 'makefile',
    // Config files
    ini: 'ini',
    cfg: 'ini',
    conf: 'ini',
    // Plain text
    txt: 'text',
    log: 'text',
    gitignore: 'text',
    editorconfig: 'text',
    prettierrc: 'json',
    eslintrc: 'json',
  }

  return languageMap[ext] || 'text'
}


