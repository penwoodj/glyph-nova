/**
 * GraphQL Schema for Chat Operations
 *
 * Defines the GraphQL API for Ollama chat interactions.
 * Includes both HTTP API and CLI execution modes.
 * Reference: Report 05 (Ollama Integration Patterns)
 */

import gql from 'graphql-tag'

export const schema = gql`
  type Query {
    # HTTP API queries
    ollamaModels: [OllamaModel!]! @skipAuth
    ollamaHealth: Boolean! @skipAuth

    # CLI-based queries
    ollamaModelsCLI: [OllamaModel!]! @skipAuth
    ollamaHealthCLI: Boolean! @skipAuth
  }

  type Mutation {
    # HTTP API mutation
    sendChatMessage(input: SendMessageInput!): ChatResponse! @skipAuth

    # CLI-based mutation
    sendChatMessageCLI(input: SendMessageInput!): ChatResponse! @skipAuth
  }

  type OllamaModel {
    name: String!
    modifiedAt: String!
    size: Float!
    digest: String!
  }

  input SendMessageInput {
    model: String!
    messages: [ChatMessageInput!]!
    fileContext: [FileContextInput!]
  }

  input ChatMessageInput {
    role: ChatRole!
    content: String!
  }

  input FileContextInput {
    path: String!
    content: String!
  }

  enum ChatRole {
    system
    user
    assistant
  }

  type ChatResponse {
    content: String!
    model: String!
    done: Boolean!
  }
`

