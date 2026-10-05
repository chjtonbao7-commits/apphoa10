import {
  fetchServerSentEvents,
  useChat,
  createChatClientOptions,
} from '@tanstack/ai-react'
import type { InferChatMessages } from '@tanstack/ai-react'

import type { Student } from './session'

const defaultChatOptions = createChatClientOptions({
  connection: fetchServerSentEvents('/api/chat'),
})

export type ChatMessages = InferChatMessages<typeof defaultChatOptions>

export const useAIChat = (student: Student) => {
  const chatOptions = createChatClientOptions({
    connection: fetchServerSentEvents('/api/chat'),
    body: { studentId: student.id, name: student.name, className: student.className },
  })

  return useChat(chatOptions)
}
