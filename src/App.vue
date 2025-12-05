<template>
  <div class="app">
    <Navbar />
    <component :is="currentPageComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import './App.css'

// 高中物理题类型定义
export interface PhysicsProblem {
  id: string          // 题目ID
  title: string       // 题目标题
  content: string     // 题目内容
  chapter: string     // 所属章节
  difficulty: 'easy' | 'medium' | 'hard' // 难度等级
  source: string      // 题目来源
  tags: string[]      // 标签数组
  answer: string      // 答案
  analysis: string    // 解析
  createdAt?: Date    // 创建时间（可选）
  updatedAt?: Date    // 更新时间（可选）
}

// Mock 数据
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

// localStorage 键名
const STORAGE_KEY = 'physics-problems'

// 从 localStorage 加载数据的函数
const loadProblemsFromStorage = (): PhysicsProblem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // 将字符串类型的日期转换回 Date 对象
      return parsed.map((problem: any) => ({
        ...problem,
        createdAt: problem.createdAt ? new Date(problem.createdAt) : undefined,
        updatedAt: problem.updatedAt ? new Date(problem.updatedAt) : undefined
      }))
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
  return []
}

// 保存数据到 localStorage 的函数
const saveProblemsToStorage = (problems: PhysicsProblem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems))
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}

// 页面类型定义
type Page = 'list' | 'detail' | 'edit' | 'add'

// 状态管理
const currentPage = ref<Page>('list')
const selectedProblemId = ref<string>('')
const problems = ref<PhysicsProblem[]>([])

// 初始化数据
onMounted(() => {
  const storedProblems = loadProblemsFromStorage()
  problems.value = storedProblems.length > 0 ? storedProblems : mockProblems
})

// 导航函数
const navigateToList = () => {
  currentPage.value = 'list'
  selectedProblemId.value = ''
}

const navigateToDetail = (id: string) => {
  selectedProblemId.value = id
  currentPage.value = 'detail'
}

const navigateToEdit = (id: string) => {
  selectedProblemId.value = id
  currentPage.value = 'edit'
}

const navigateToAdd = () => {
  selectedProblemId.value = ''
  currentPage.value = 'add'
}

// 保存题目（添加或编辑）
const saveProblem = (problem: Partial<PhysicsProblem>) => {
  let updatedProblems: PhysicsProblem[]
  
  if (currentPage.value === 'add') {
    // 添加新题目
    const newProblem: PhysicsProblem = {
      ...problem as PhysicsProblem,
      id: Date.now().toString(),
      tags: problem.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    updatedProblems = [...problems.value, newProblem]
  } else if (currentPage.value === 'edit' && selectedProblemId.value) {
    // 编辑现有题目
    updatedProblems = problems.value.map(p => 
      p.id === selectedProblemId.value 
        ? { ...p, ...problem, updatedAt: new Date() }
        : p
    )
  } else {
    // 其他情况，不做处理
    navigateToList()
    return
  }
  
  // 更新状态并保存到 localStorage
  problems.value = updatedProblems
  saveProblemsToStorage(updatedProblems)
  navigateToList()
}

// 导航组件
const Navbar = {
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <h1 class="nav-title" @click="navigateToList" style="cursor: pointer">physics-bank   高中物理题典</h1>
        <div class="nav-links">
          <button class="nav-link" @click="navigateToList">题目列表</button>
          <button class="nav-link" @click="navigateToAdd">添加题目</button>
        </div>
      </div>
    </nav>
  `,
  setup() {
    return {
      navigateToList,
      navigateToAdd
    }
  }
}

// 题目列表组件
const ProblemList = {
  template: `
    <div class="container">
      <div class="filters">
        <h2>筛选条件</h2>
        <div class="filter-group">
          <label>难度：</label>
          <select v-model="selectedDifficulty">
            <option value="all">全部</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div class="filter-group">
          <label>章节：</label>
          <select v-model="selectedChapter">
            <option value="all">全部</option>
            <option v-for="chapter in chapters" :key="chapter" :value="chapter">{{ chapter }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>搜索：</label>
          <input 
            type="text" 
            placeholder="输入关键词搜索" 
            v-model="searchKeyword"
          />
        </div>
        <button class="add-button" @click="navigateToAdd">添加题目</button>
      </div>
      
      <div class="problem-list">
        <h2>题目列表</h2>
        <template v-if="filteredProblems.length > 0">
          <ul>
            <li v-for="problem in filteredProblems" :key="problem.id" class="problem-item">
              <div class="problem-header">
                <h3>{{ problem.title }}</h3>
                <span :class="['difficulty', problem.difficulty]">
                  {{ getDifficultyText(problem.difficulty) }}
                </span>
              </div>
              <p class="problem-chapter">章节：{{ problem.chapter }}</p>
              <p class="problem-content">{{ problem.content.substring(0, 100) }}...</p>
              <div class="problem-tags">
                <span v-for="tag in problem.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <div class="problem-actions">
                <button @click="navigateToDetail(problem.id)">查看详情</button>
                <button @click="navigateToEdit(problem.id)">编辑</button>
              </div>
            </li>
          </ul>
        </template>
        <p v-else class="no-results">暂无符合条件的题目</p>
      </div>
    </div>
  `,
  setup() {
    const selectedDifficulty = ref<string>('all')
    const selectedChapter = ref<string>('all')
    const searchKeyword = ref<string>('')

    // 过滤题目
    const filteredProblems = computed(() => {
      return problems.value.filter(problem => {
        const matchesDifficulty = selectedDifficulty.value === 'all' || problem.difficulty === selectedDifficulty.value
        const matchesChapter = selectedChapter.value === 'all' || problem.chapter === selectedChapter.value
        const matchesKeyword = !searchKeyword.value || 
          problem.title.includes(searchKeyword.value) || 
          problem.content.includes(searchKeyword.value) ||
          problem.tags.some(tag => tag.includes(searchKeyword.value))
        
        return matchesDifficulty && matchesChapter && matchesKeyword
      })
    })

    // 获取所有章节
    const chapters = computed(() => {
      return Array.from(new Set(problems.value.map(p => p.chapter)))
    })

    // 获取难度文本
    const getDifficultyText = (difficulty: string) => {
      switch (difficulty) {
        case 'easy': return '简单'
        case 'medium': return '中等'
        case 'hard': return '困难'
        default: return difficulty
      }
    }

    return {
      selectedDifficulty,
      selectedChapter,
      searchKeyword,
      filteredProblems,
      chapters,
      getDifficultyText,
      navigateToDetail,
      navigateToEdit,
      navigateToAdd
    }
  }
}

// 题目详情组件
const ProblemDetail = {
  template: `
    <div class="container">
      <div class="problem-detail">
        <template v-if="problem">
          <div class="problem-header">
            <h1>{{ problem.title }}</h1>
            <span :class="['difficulty', problem.difficulty]">
              {{ getDifficultyText(problem.difficulty) }}
            </span>
          </div>
          
          <div class="problem-meta">
            <p>章节：{{ problem.chapter }}</p>
            <p>来源：{{ problem.source }}</p>
            <div class="problem-tags">
              <span v-for="tag in problem.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
          
          <div class="problem-content">
            <h3>题目内容</h3>
            <p>{{ problem.content }}</p>
          </div>
          
          <div class="problem-answer">
            <h3>答案</h3>
            <p>{{ problem.answer }}</p>
          </div>
          
          <div class="problem-analysis">
            <h3>解析</h3>
            <p>{{ problem.analysis }}</p>
          </div>
          
          <div class="problem-actions">
            <button @click="navigateToList">返回列表</button>
            <button @click="navigateToEdit(problem.id)">编辑题目</button>
          </div>
        </template>
        <template v-else>
          <p>题目不存在</p>
          <button @click="navigateToList">返回列表</button>
        </template>
      </div>
    </div>
  `,
  setup() {
    const problem = computed(() => {
      return problems.value.find(p => p.id === selectedProblemId.value)
    })

    // 获取难度文本
    const getDifficultyText = (difficulty: string) => {
      switch (difficulty) {
        case 'easy': return '简单'
        case 'medium': return '中等'
        case 'hard': return '困难'
        default: return difficulty
      }
    }

    return {
      problem,
      getDifficultyText,
      navigateToList,
      navigateToEdit
    }
  }
}

// 题目编辑组件
const ProblemEdit = {
  template: `
    <div class="container">
      <div class="problem-edit">
        <h1>{{ isEditing ? '编辑题目' : '添加题目' }}</h1>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="title">题目标题</label>
            <input
              type="text"
              id="title"
              name="title"
              v-model="problem.title"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="content">题目内容</label>
            <textarea
              id="content"
              name="content"
              v-model="problem.content"
              rows="6"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="chapter">所属章节</label>
            <input
              type="text"
              id="chapter"
              name="chapter"
              v-model="problem.chapter"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="difficulty">难度</label>
            <select
              id="difficulty"
              name="difficulty"
              v-model="problem.difficulty"
            >
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="source">题目来源</label>
            <input
              type="text"
              id="source"
              name="source"
              v-model="problem.source"
            />
          </div>
          
          <div class="form-group">
            <label>标签</label>
            <div class="tag-input-container">
              <input
                type="text"
                v-model="tagInput"
                @keypress.enter.prevent="handleAddTag"
                placeholder="输入标签后按回车添加"
              />
              <button type="button" @click="handleAddTag">添加</button>
            </div>
            <div class="selected-tags">
              <span v-for="tag in problem.tags" :key="tag" class="tag">
                {{ tag }}
                <button type="button" @click="handleRemoveTag(tag)">×</button>
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="answer">答案</label>
            <input
              type="text"
              id="answer"
              name="answer"
              v-model="problem.answer"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="analysis">解析</label>
            <textarea
              id="analysis"
              name="analysis"
              v-model="problem.analysis"
              rows="6"
              required
            />
          </div>
          
          <div class="form-actions">
            <button type="submit" class="submit-button">保存</button>
            <button type="button" class="cancel-button" @click="navigateToList">取消</button>
          </div>
        </form>
      </div>
    </div>
  `,
  setup() {
    const isEditing = computed(() => currentPage.value === 'edit')
    const existingProblem = computed(() => {
      return isEditing.value && selectedProblemId.value
        ? problems.value.find(p => p.id === selectedProblemId.value)
        : undefined
    })

    const problem = ref<Partial<PhysicsProblem>>(existingProblem.value || {
      title: '',
      content: '',
      chapter: '',
      difficulty: 'medium',
      source: '',
      tags: [],
      answer: '',
      analysis: ''
    })
    
    const tagInput = ref('')

    const handleAddTag = () => {
      if (tagInput.value && !problem.value.tags?.includes(tagInput.value)) {
        problem.value = {
          ...problem.value,
          tags: [...(problem.value.tags || []), tagInput.value]
        }
        tagInput.value = ''
      }
    }

    const handleRemoveTag = (tagToRemove: string) => {
      problem.value = {
        ...problem.value,
        tags: problem.value.tags?.filter(tag => tag !== tagToRemove)
      }
    }

    const handleSubmit = () => {
      saveProblem(problem.value)
    }

    return {
      isEditing,
      problem,
      tagInput,
      handleAddTag,
      handleRemoveTag,
      handleSubmit,
      navigateToList
    }
  }
}

// 计算当前页面组件
const currentPageComponent = computed(() => {
  switch (currentPage.value) {
    case 'list': return ProblemList
    case 'detail': return ProblemDetail
    case 'edit':
    case 'add': return ProblemEdit
    default: return ProblemList
  }
})
</script>

<style>
/* 样式已经在App.css中定义，这里不再重复 */
</style>