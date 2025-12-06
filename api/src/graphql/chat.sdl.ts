/**
 * GraphQL Schema for Chat Operations
 *
 * Defines the GraphQL API for Ollama chat interactions.
 * Reference: Report 05 (Ollama Integration Patterns)
 */

import gql from 'graphql-tag'

export const schema = gql`
  type Query {
    ollamaModels: [OllamaModel!]! @skipAuth
    ollamaHealth: Boolean! @skipAuth
  }

  type Mutation {
    sendChatMessage(input: SendMessageInput!): ChatResponse! @skipAuth
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

