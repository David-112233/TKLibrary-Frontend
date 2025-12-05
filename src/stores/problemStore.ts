import { ref } from 'vue'

export interface PhysicsProblem {
  id: string
  title: string
  content: string
  chapter: string
  difficulty: 'easy' | 'medium' | 'hard'
  source: string
  tags: string[]
  answer: string
  analysis: string
  createdAt?: Date
  updatedAt?: Date
}

const STORAGE_KEY = 'physics-problems'

const mockProblems: PhysicsProblem[] = [
  {
    id: '1',
    title: '牛顿第二定律应用',
    content: '一个质量为2kg的物体，受到5N的水平拉力，在光滑水平面上运动，求物体的加速度。',
    chapter: '牛顿运动定律',
    difficulty: 'easy',
    source: '2023年高考物理',
    tags: ['牛顿定律', '力学', '计算题'],
    answer: '2.5m/s²',
    analysis: '根据牛顿第二定律 F=ma，代入数据得 a=F/m=5N/2kg=2.5m/s²。',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: '机械能守恒定律',
    content: '一个质量为1kg的小球从20m高处自由下落，忽略空气阻力，求小球落地时的速度大小。',
    chapter: '机械能守恒',
    difficulty: 'medium',
    source: '2022年模拟题',
    tags: ['机械能', '自由落体', '计算题'],
    answer: '20m/s',
    analysis: '根据机械能守恒定律 mgh=1/2mv²，解得 v=√(2gh)=√(2×10×20)=20m/s。',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const loadProblemsFromStorage = (): PhysicsProblem[] => {
  if (typeof window === 'undefined') {
    return mockProblems
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((problem: PhysicsProblem) => ({
        ...problem,
        createdAt: problem.createdAt ? new Date(problem.createdAt) : undefined,
        updatedAt: problem.updatedAt ? new Date(problem.updatedAt) : undefined
      }))
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }

  return mockProblems
}

const saveProblemsToStorage = (items: PhysicsProblem[]) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}

const problems = ref<PhysicsProblem[]>(loadProblemsFromStorage())

const updateProblems = (next: PhysicsProblem[]) => {
  problems.value = next
  saveProblemsToStorage(next)
}

export const useProblemStore = () => {
  const getProblemById = (id: string) => problems.value.find(problem => problem.id === id)

  const addProblem = (problem: Omit<PhysicsProblem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProblem: PhysicsProblem = {
      ...problem,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    updateProblems([...problems.value, newProblem])
    return newProblem.id
  }

  const updateProblem = (id: string, updates: Partial<PhysicsProblem>) => {
    let hasChanged = false
    const next = problems.value.map(problem => {
      if (problem.id === id) {
        hasChanged = true
        return {
          ...problem,
          ...updates,
          updatedAt: new Date()
        }
      }
      return problem
    })

    if (hasChanged) {
      updateProblems(next)
    }

    return hasChanged
  }

  return {
    problems,
    addProblem,
    updateProblem,
    getProblemById
  }
}
