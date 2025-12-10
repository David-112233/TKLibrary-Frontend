<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 返回按钮 -->
    <button @click="$router.go(-1)" class="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition-colors flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      返回
    </button>
    
    <h1 class="text-2xl font-bold mb-6">AI问答</h1>
    
    <div class="bg-white shadow-lg rounded-lg p-6">
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-4">与AI对话</h2>
        
        <div class="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
          <div v-for="(message, index) in messages" :key="index" class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
            <div :class="message.role === 'user' ? 'bg-blue-500 text-white p-4 rounded-lg rounded-br-none max-w-[80%]' : 'bg-gray-100 text-gray-800 p-4 rounded-lg rounded-bl-none max-w-[80%]'">
              <template v-if="message.role === 'user'">
                {{ message.content }}
              </template>
              <template v-else>
                <div v-html="renderMarkdown(message.content)" class="prose prose-sm max-w-none"></div>
              </template>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <input
            v-model="inputMessage"
            @keyup.enter="sendMessage"
            class="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="请输入你的问题..."
          >
          <button
            @click="sendMessage"
            :disabled="!inputMessage.trim() || sending"
            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg v-if="sending" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ sending ? '发送中...' : '发送' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProblemStore } from './stores/problemStore'
import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const { askAI } = useProblemStore()

const inputMessage = ref('')
const sending = ref(false)
const messages = ref<Array<{ role: 'user' | 'ai'; content: string }>>([])

const sendMessage = async () => {
  if (!inputMessage.value.trim() || sending.value) return
  
  const userMsg = inputMessage.value.trim()
  messages.value.push({ role: 'user', content: userMsg })
  inputMessage.value = ''
  
  sending.value = true
  try {
    const response = await askAI(userMsg)
    console.log('AI Response:', response)
    // 确保response是对象，并且包含answer字段
    if (typeof response === 'object' && response !== null && 'answer' in response) {
      messages.value.push({ role: 'ai', content: String(response.answer) || '抱歉，我无法回答这个问题。' })
    } else {
      messages.value.push({ role: 'ai', content: '抱歉，我无法回答这个问题。' })
      console.error('AI响应格式错误:', response)
    }
  } catch (err) {
    messages.value.push({ role: 'ai', content: '抱歉，回答失败，请稍后重试。' })
    console.error('AI问答失败:', err)
  } finally {
    sending.value = false
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
/* 可以根据需要添加样式 */
.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 0.5em;
}

.prose pre {
  background-color: #f3f4f6;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125em 0.25em;
  border-radius: 0.25em;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
}
</style>