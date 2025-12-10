<template>
  <div class="ai-sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
        </svg>
        AI 助手
      </h2>
    </div>
    
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <p>有什么问题都可以问我哦~</p>
      </div>
      
      <div v-for="(message, index) in messages" :key="index" class="message-wrapper" :class="message.role === 'user' ? 'message-user' : 'message-ai'">
        <div class="message-bubble">
          <template v-if="message.role === 'user'">
            {{ message.content }}
          </template>
          <template v-else>
            <div v-html="renderMarkdown(message.content)"></div>
          </template>
        </div>
      </div>
      
      <div v-if="sending" class="message-wrapper message-ai">
        <div class="message-bubble loading-bubble">
          <span class="loading-text">思考中...</span>
        </div>
      </div>
    </div>
    
    <div class="input-area">
      <div class="input-wrapper">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          class="message-input"
          placeholder="输入问题..."
          :disabled="sending"
        >
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || sending"
          class="send-button"
        >
          <svg v-if="!sending" xmlns="http://www.w3.org/2000/svg" class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          <span v-else class="spinner"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useProblemStore } from '../stores/problemStore'
import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const { askAI } = useProblemStore()

const inputMessage = ref('')
const sending = ref(false)
const messages = ref<Array<{ role: 'user' | 'ai'; content: string }>>([])
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || sending.value) return
  
  const userMsg = inputMessage.value.trim()
  messages.value.push({ role: 'user', content: userMsg })
  inputMessage.value = ''
  await scrollToBottom()
  
  sending.value = true
  try {
    const response = await askAI(userMsg)
    console.log('AI Sidebar Response:', response)
    let answerContent = '抱歉，我无法回答这个问题。'
    // 确保response是对象，并且包含answer字段
    if (typeof response === 'object' && response !== null) {
      if ('answer' in response) {
        answerContent = String(response.answer) || answerContent
      } else if ('error' in response) {
        answerContent = '抱歉，我无法回答这个问题。'
      }
    }
    messages.value.push({ role: 'ai', content: answerContent })
  } catch (err) {
    messages.value.push({ role: 'ai', content: '抱歉，回答失败，请稍后重试。' })
    console.error('AI问答失败:', err)
  } finally {
    sending.value = false
    await scrollToBottom()
  }
}

// 渲染Markdown并处理数学公式
const renderMarkdown = (content: string) => {
  if (typeof content !== 'string') {
    console.error('renderMarkdown: content must be a string, got', typeof content)
    return ''
  }
  
  try {
    // 1. 先在原始文本中处理Final Answer行，确保\boxed被正确识别
    let processedContent = content.replace(/Final Answer:\\boxed\{([^}]+)\}/g, (_match, formula) => {
      return `Final Answer: $\\boxed{${formula}}$`
    })
    
    // 2. 同步渲染Markdown
    let html = marked.parse(processedContent) as string
    
    // 3. 替换行内数学公式 $...$ 为KaTeX渲染结果，特别处理\boxed
    html = html.replace(/\$(.*?)\$/g, (match: string, formula: string) => {
      try {
        return katex.renderToString(formula, {
          throwOnError: false,
          displayMode: false
        })
      } catch (e) {
        console.error('行内公式渲染错误:', formula, e)
        return match
      }
    })
    
    // 4. 替换块级数学公式 $$...$$ 为KaTeX渲染结果，特别处理\boxed
    html = html.replace(/\$\$(.*?)\$\$/gs, (match: string, formula: string) => {
      try {
        return katex.renderToString(formula, {
          throwOnError: false,
          displayMode: true
        })
      } catch (e) {
        console.error('块级公式渲染错误:', formula, e)
        return match
      }
    })
    
    return html
  } catch (e) {
    console.error('renderMarkdown error:', e)
    return content
  }
}
</script>

<style scoped>
.ai-sidebar {
  background-color: var(--surface-color);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--border-color);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.icon {
  height: 1.25rem;
  width: 1.25rem;
  color: var(--primary-color);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-user {
  justify-content: flex-end;
}

.message-ai {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 90%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  box-shadow: var(--shadow-xs);
}

.message-user .message-bubble {
  background-color: var(--primary-color);
  color: white;
  border-bottom-right-radius: 0;
}

.message-ai .message-bubble {
  background-color: var(--surface-color);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 0;
}

.loading-bubble {
  background-color: var(--surface-color);
  color: var(--text-secondary);
}

.loading-text {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.input-area {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--surface-color);
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}

.input-wrapper {
  display: flex;
  gap: 0.75rem;
}

.message-input {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  font-size: var(--text-sm);
  color: var(--text-main);
  outline: none;
  transition: all 0.2s;
  background-color: var(--background-color);
}

.message-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-light);
  background-color: var(--surface-color);
}

.send-button {
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 3.5rem;
}

.send-button:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.send-button:disabled {
  background-color: var(--text-light);
  cursor: not-allowed;
  opacity: 0.7;
}

.icon-sm {
  height: 1.25rem;
  width: 1.25rem;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>