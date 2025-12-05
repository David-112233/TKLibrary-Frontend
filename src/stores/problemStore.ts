import axios from 'axios'
import { ref } from 'vue'

export interface PhysicsProblem {
  id: string
  content: string
  answer: string
  tag: string
}

export type CreateProblemPayload = Pick<PhysicsProblem, 'content' | 'answer' | 'tag'>
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

const problems = ref<PhysicsProblem[]>([])
const isFetching = ref(false)
let isInitialized = false

const fetchProblems = async () => {
  isFetching.value = true
  try {
    const { data } = await api.get<PhysicsProblem[]>('/fetchQuestions')
    problems.value = data
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
    return data
  } catch (error) {
    console.error('获取题目详情失败:', error)
    throw error
  }
}

const addProblem = async (payload: CreateProblemPayload) => {
  try {
    const { data } = await api.post<PhysicsProblem>('/addQuestions', payload)
    problems.value = [...problems.value, data]
    return data
  } catch (error) {
    console.error('保存题目失败:', error)
    throw error
  }
}

const updateProblem = async (id: string, updates: Partial<CreateProblemPayload>) => {
  try {
    const current = getProblemById(id)
    const payload: UpdateProblemPayload = {
      id,
      content: updates.content ?? current?.content ?? '',
      answer: updates.answer ?? current?.answer ?? '',
      tag: updates.tag ?? current?.tag ?? ''
    }

    const { data } = await api.post<PhysicsProblem>('/editQuestions', payload)
    problems.value = problems.value.map(problem =>
      problem.id === id ? data : problem
    )
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

const getProblemById = (id: string) => problems.value.find(problem => problem.id === id)

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
    scoreProblem,
    getProblemById
  }
}
