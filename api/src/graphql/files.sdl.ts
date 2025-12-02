/**
 * GraphQL Schema for File Operations
 *
 * Defines the GraphQL API for file system operations in the desktop application.
 * Reference: Report 03 (Desktop File System Integration)
 */

export const schema = `
  type Query {
    directoryContents(path: String!): DirectoryContents
    readFile(path: String!): FileContent
    fileStats(path: String!): FileStats
    pathExists(path: String!): Boolean!
  }

  type Mutation {
    writeFile(path: String!, content: String!): WriteFileResult
  }

  type DirectoryContents {
    files: [FileEntry!]!
    folders: [FileEntry!]!
  }

  type FileEntry {
    name: String!
    path: String!
    type: FileType!
    extension: String
    size: Int!
    modified: DateTime!
  }

  enum FileType {
    file
    directory
  }

  type FileContent {
    path: String!
    content: String!
    encoding: String
  }

  type FileStats {
    path: String!
    size: Int!
    isFile: Boolean!
    isDirectory: Boolean!
    modified: DateTime!
    created: DateTime
  }

  type WriteFileResult {
    success: Boolean!
    path: String!
    message: String
  }

  scalar DateTime
`

