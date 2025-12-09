<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">AI问答</h1>
    
    <div class="bg-white shadow-md rounded-lg p-6">
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-4">与AI对话</h2>
        
        <div class="space-y-4 mb-6 max-h-96 overflow-y-auto">
          <div v-for="(message, index) in messages" :key="index" class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
            <div :class="message.role === 'user' ? 'bg-blue-500 text-white p-4 rounded-lg rounded-br-none max-w-[80%]' : 'bg-gray-100 text-gray-800 p-4 rounded-lg rounded-bl-none max-w-[80%]'">
              <template v-if="message.role === 'user'">
                {{ message.content }}
              </template>
              <template v-else>
                <div v-html="renderMarkdown(message.content)"></div>
              </template>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <input
            v-model="inputMessage"
            @keyup.enter="sendMessage"
            class="flex-1 border border-gray-300 rounded-md p-3"
            placeholder="请输入你的问题..."
          >
          <button
            @click="sendMessage"
            :disabled="!inputMessage.trim() || sending"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {{ sending ? '发送中...' : '发送' }}
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

const renderMarkdown = (content: string) => {
  return marked(content)
}
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>