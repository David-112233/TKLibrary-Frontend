<template>
  <div class="page-container">
    <!-- 顶部导航 -->
    <div class="header">
      <h1 class="page-title">做题页面</h1>
      <button @click="goBack" class="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        返回列表
      </button>
    </div>
    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span class="loading-text">加载题目中...</span>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p class="error-text">{{ error }}</p>
    </div>
    
    <div v-else-if="question" class="content-wrapper">
      <!-- 左侧：做题区域 -->
      <div class="main-content">
        <div class="problem-card">
          <!-- 题目头部 -->
          <div class="problem-header">
            <div class="problem-info">
              <span v-if="question.subject" class="subject-tag">
                {{ question.subject }}
              </span>
              <h2 class="problem-title">{{ question.content }}</h2>
            </div>
          </div>
          
          <!-- 答题区域 -->
          <div class="problem-body">
            <div class="input-group">
              <label class="input-label">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                你的答案
              </label>
              <textarea
                v-model="userAnswer"
                class="answer-textarea"
                placeholder="在这里输入你的解题过程和最终答案..."
              ></textarea>
            </div>
            
            <div class="action-bar">
              <button
                @click="submitAnswer"
                :disabled="!userAnswer.trim() || submitting"
                class="submit-button"
              >
                <span v-if="submitting" class="spinner-sm"></span>
                {{ submitting ? '正在提交...' : '提交答案' }}
              </button>
            </div>
          </div>
          
          <!-- 评分结果 -->
          <div v-if="scoreResult" class="result-section">
            <div class="result-header">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon-success" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <h3 class="result-title">评分结果</h3>
            </div>
            
            <div class="score-grid">
              <div class="score-card">
                <p class="card-label">得分</p>
                <div class="score-value">
                  <span class="score-number">{{ scoreResult.score }}</span>
                  <span class="score-total">/ 100</span>
                </div>
              </div>
              <div class="score-card">
                <p class="card-label">评价</p>
                <p class="comment-text">{{ scoreResult.evaluation }}</p>
              </div>
            </div>
            
            <div class="suggestion-box">
              <p class="suggestion-title">得分点</p>
              <p class="suggestion-text">{{ scoreResult.pointsEarned }}</p>
            </div>
            
            <div class="suggestion-box">
              <p class="suggestion-title">失分点</p>
              <p class="suggestion-text">{{ scoreResult.pointsLost }}</p>
            </div>

            <!-- 正确答案展示 -->
            <div class="reference-answer-box">
              <p class="reference-title">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                参考答案
              </p>
              <div class="reference-content">{{ question.answer || '暂无参考答案' }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：AI 侧边栏 -->
      <div class="sidebar-wrapper">
        <div class="sticky-sidebar">
          <AiSidebar />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProblemStore } from './stores/problemStore'
import AiSidebar from './components/AiSidebar.vue'

const route = useRoute()
const router = useRouter()
const { fetchProblemDetail, scoreProblem } = useProblemStore()

const questionId = route.params.id as string
const question = ref<any>(null)
const loading = ref(true)
const error = ref('')
const userAnswer = ref('')
const submitting = ref(false)
const scoreResult = ref<any>(null)

onMounted(async () => {
  try {
    const data = await fetchProblemDetail(questionId)
    question.value = data
  } catch (err) {
    error.value = '获取题目失败'
    console.error('获取题目失败:', err)
  } finally {
    loading.value = false
  }
})

const submitAnswer = async () => {
  if (!userAnswer.value.trim()) return
  
  submitting.value = true
  try {
    const result = await scoreProblem({
      id: questionId,
      content: question.value.content,
      answer: userAnswer.value,
      subject: question.value.subject,
      tag: question.value.tag || '' // 补充缺失的 tag 字段
    })
    scoreResult.value = result
  } catch (err) {
    error.value = '评分失败'
    console.error('评分失败:', err)
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.page-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.025em;
}

.back-button {
  background-color: var(--surface-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  box-shadow: var(--shadow-sm);
}

.back-button:hover {
  background-color: var(--background-color);
  box-shadow: var(--shadow-md);
  color: var(--text-main);
}

.icon {
  height: 1.25rem;
  width: 1.25rem;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5rem 0;
}

.spinner {
  border: 2px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-left: 0.75rem;
  color: var(--text-secondary);
}

.error-state {
  text-align: center;
  padding: 3rem;
  background-color: #fef2f2;
  border-radius: var(--radius-lg);
  border: 1px solid #fee2e2;
}

.error-text {
  color: #ef4444;
  font-weight: 500;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .content-wrapper {
    flex-direction: row;
    align-items: flex-start;
  }
}

.main-content {
  flex: 1;
  min-width: 0; /* 防止子元素溢出 */
}

.problem-card {
  background-color: var(--surface-color);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.problem-card:hover {
  box-shadow: var(--shadow-lg);
}

.problem-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-color);
}

.problem-info {
  flex: 1;
}

.subject-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: var(--text-xs);
  font-weight: 600;
  background-color: var(--primary-light);
  color: var(--primary-color);
  margin-bottom: 0.75rem;
}

.problem-title {
  font-size: var(--text-xl);
  color: var(--text-main);
  line-height: var(--leading-tight);
  font-weight: 600;
  margin: 0;
}

.problem-body {
  padding: 2rem;
}

.input-group {
  margin-bottom: 2rem;
}

.input-label {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 1rem;
}

.icon-sm {
  height: 1.25rem;
  width: 1.25rem;
  margin-right: 0.5rem;
  color: var(--primary-color);
}

.answer-textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  height: 16rem;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-main);
  resize: vertical;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
  background-color: var(--background-color);
}

.answer-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
  background-color: var(--surface-color);
}

.action-bar {
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  font-size: var(--text-sm);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.submit-button:disabled {
  background-color: var(--border-color);
  color: var(--text-light);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.spinner-sm {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

.result-section {
  border-top: 1px solid var(--border-color);
  background-color: var(--background-color);
  padding: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.icon-success {
  height: 1.5rem;
  width: 1.5rem;
  color: var(--success-color);
}

.result-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.score-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .score-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.score-card {
  background-color: var(--surface-color);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.card-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.score-value {
  display: flex;
  align-items: baseline;
}

.score-number {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.score-total {
  color: var(--text-light);
  margin-left: 0.5rem;
  font-size: var(--text-lg);
}

.comment-text {
  color: var(--text-main);
  font-weight: 500;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
}

.suggestion-box {
  margin-bottom: 2rem;
  background-color: #eff6ff;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid #bfdbfe;
}

.suggestion-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.75rem;
}

.suggestion-text {
  color: #1e3a8a;
  line-height: var(--leading-relaxed);
  opacity: 0.9;
}

.reference-answer-box {
  background-color: #f0fdf4;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid #bbf7d0;
}

.reference-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: #15803d;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reference-title .icon-sm {
  color: #15803d;
  margin: 0;
}

.reference-content {
  color: #14532d;
  line-height: var(--leading-relaxed);
  white-space: pre-wrap;
  opacity: 0.9;
  font-family: inherit;
}

.sidebar-wrapper {
  width: 100%;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .sidebar-wrapper {
    width: 24rem;
  }
}

.sticky-sidebar {
  position: sticky;
  top: 1.5rem;
  height: calc(100vh - 3rem);
  max-height: 800px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>