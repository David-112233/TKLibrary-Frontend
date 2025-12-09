import axios from 'axios'
import { ref } from 'vue'

export interface PhysicsProblem {
  id: string
  content: string
  answer: string
  tag: string[]
  subject?: string
}

export type CreateProblemPayload = Pick<PhysicsProblem, 'content' | 'answer' | 'tag'> & { subject?: string }
export type UpdateProblemPayload = PhysicsProblem
export interface ScoreRequest extends CreateProblemPayload {
  id: string
}
export type ScoreResponse = Record<string, unknown>

// Axios instance for all problem-related requests
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Debugging: log requests and responses to the dev server terminal
// This helps capture outgoing request payloads and server responses
api.interceptors.request.use((config: any) => {
  try {
    const method = (config.method || '').toUpperCase()
    const url = config.url || ''
    const payload = config.data ?? config.params ?? ''
    console.log('[API Request]', method, url, JSON.stringify(payload))
  } catch (e) {
    // ignore logging errors
  }
  return config
}, (error: any) => {
  console.error('[API Request Error]', error)
  return Promise.reject(error)
})

api.interceptors.response.use((response: any) => {
  try {
    const method = (response.config?.method || '').toUpperCase()
    const url = response.config?.url || ''
    console.log('[API Response]', method, url, JSON.stringify(response.data))
  } catch (e) {
    // ignore logging errors
  }
  return response
}, (error: any) => {
  console.error('[API Response Error]', error)
  return Promise.reject(error)
})

const problems = ref<PhysicsProblem[]>([])
const isFetching = ref(false)
let isInitialized = false

const fetchProblems = async () => {
  isFetching.value = true
  try {
    const { data } = await api.get<PhysicsProblem[]>('/fetchQuestions')
    // ensure the response is an array; if not, fail gracefully
    if (!Array.isArray(data)) {
      console.warn('fetchProblems: expected array but got', data)
      problems.value = []
      isInitialized = true
      return data
    }

    // normalize tag to always be an array and id to always be a string
    const normalized = data.map((item: any) => ({
      ...item,
      id: String(item.id),
      tag: Array.isArray(item.tag) ? item.tag : (typeof item.tag === 'string' ? item.tag.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
    }))
    problems.value = normalized
    isInitialized = true
    return data
  } catch (error) {
    console.error('获取题目列表失败:', error)
    throw error
  } finally {
    isFetching.value = false
  }
}

const fetchProblemDetail = async (id: string) => {
  try {
    const { data } = await api.get<PhysicsProblem>(`/questions/${id}`)
    if (data) {
      // Convert id to string and normalize tag to array
      data.id = String((data as any).id)
      data.tag = Array.isArray((data as any).tag) ? (data as any).tag : (typeof (data as any).tag === 'string' ? (data as any).tag.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
    }
    return data
  } catch (error) {
    console.error('获取题目详情失败:', error)
    throw error
  }
}

const addProblem = async (payload: CreateProblemPayload) => {
  try {
    // Convert tag array to string for backend
    const processedPayload = {
      ...payload,
      tag: Array.isArray(payload.tag) ? payload.tag.join(',') : payload.tag
    }
    const { data } = await api.post<PhysicsProblem>('/addQuestions', processedPayload)
    if (data) {
      // Convert id to string and normalize tag to array
      data.id = String((data as any).id)
      data.tag = Array.isArray((data as any).tag) ? (data as any).tag : (typeof (data as any).tag === 'string' ? (data as any).tag.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
      // Refresh the full list from backend to ensure frontend has the latest, canonical data
      await fetchProblems()
    }
    return data
  } catch (error) {
    console.error('保存题目失败:', error)
    throw error
  }
}

const updateProblem = async (id: string, updates: Partial<CreateProblemPayload>) => {
  try {
    const current = getProblemById(id)
    const tagArray = updates.tag ?? current?.tag ?? []
    const payload: any = {
      id: Number(id),
      content: updates.content ?? current?.content ?? '',
      answer: updates.answer ?? current?.answer ?? '',
      tag: Array.isArray(tagArray) ? tagArray.join(',') : tagArray
    }

    const { data } = await api.post<PhysicsProblem>('/editQuestions', payload)
    if (data) {
      (data as any).tag = Array.isArray((data as any).tag) ? (data as any).tag : (typeof (data as any).tag === 'string' ? (data as any).tag.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
      // Refresh the full list from backend to ensure frontend has the latest, canonical data
      await fetchProblems()
    }
    return data
  } catch (error) {
    console.error('编辑题目失败:', error)
    throw error
  }
}

const scoreProblem = async (payload: ScoreRequest) => {
  try {
    const { data } = await api.post<ScoreResponse>('/questions/score', payload)
    return data
  } catch (error) {
    console.error('AI 打分失败:', error)
    throw error
  }
}

const askAI = async (question: string) => {
  try {
    const { data } = await api.post<ScoreResponse>('/questions/ask', {
      question
    })
    return data
  } catch (error) {
    console.error('AI 问答失败:', error)
    throw error
  }
}

const getProblemById = (id: string) => problems.value.find(problem => problem.id === id)

const deleteProblem = async (id: string) => {
  try {
    await api.post(`/deleteQuestions`, { id })
    // Refresh the full list from backend to ensure frontend has the latest, canonical data
    await fetchProblems()
  } catch (error) {
    console.error('删除题目失败:', error)
    throw error
  }
}

const ensureInitialized = () => {
  if (isInitialized || isFetching.value || typeof window === 'undefined') {
    return
  }
  fetchProblems().catch(error => {
    console.error('初始化题目列表失败:', error)
  })
}

export const useProblemStore = () => {
  ensureInitialized()

  return {
    problems,
    fetchProblems,
    fetchProblemDetail,
    addProblem,
    updateProblem,
    deleteProblem,
    scoreProblem,
    askAI,
    getProblemById
  }
}
