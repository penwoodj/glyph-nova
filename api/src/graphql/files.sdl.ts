/**
 * GraphQL Schema for File Operations
 *
 * Defines the GraphQL API for file system operations in the desktop application.
 * Reference: Report 03 (Desktop File System Integration)
 */

import gql from 'graphql-tag'

export const schema = gql`
  type Query {
    directoryContents(path: String!): DirectoryContents @skipAuth
    readFile(path: String!): FileContent @skipAuth
    fileStats(path: String!): FileStats @skipAuth
    pathExists(path: String!): Boolean! @skipAuth
  }

  type Mutation {
    writeFile(path: String!, content: String!): WriteFileResult @skipAuth
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
