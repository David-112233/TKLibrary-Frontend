<template>
	<div>
		<AppNavbar />
		<div class="container">
			<div class="filters">
				<h2>筛选与操作</h2>
				<div class="filter-group">
					<label>搜索：</label>
					<input
						type="text"
						placeholder="输入关键词搜索（内容或标签）"
						v-model="searchKeyword"
					/>
				</div>
				<button class="add-button" @click="navigateToAdd">添加题目</button>
			</div>

			<div class="problem-list">
				<h2>题目列表</h2>
				<template v-if="filteredProblems.length">
					<ul class="problem-items">
						<li v-for="(problem, index) in filteredProblems" :key="problem.id" class="problem-item card fade-in" :style="{ animationDelay: `${index * 0.1}s` }">
							<div class="problem-header">
								<h3 class="problem-title"></h3>
							</div>
							<p class="problem-content">{{ previewContent(problem.content) }}</p>
							<div class="problem-tags">
								<span v-for="tag in (problem.tag || [])" :key="tag" class="tag">{{ tag }}</span>
							</div>
							<div class="problem-actions">
    <button @click="navigateToSolve(problem.id)" class="btn-secondary">做题</button>
    <button @click="navigateToDetail(problem.id)" class="btn-primary-white">查看详情</button>
    <button @click="navigateToEdit(problem.id)" class="btn-edit">编辑</button>
    <button @click="handleDelete(problem.id)" class="btn-delete">删除</button>
</div>
						</li>
					</ul>
				</template>
				<p v-else class="no-results">暂无符合条件的题目</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useProblemStore } from './stores/problemStore'

const router = useRouter()
const { problems, deleteProblem } = useProblemStore()

const searchKeyword = ref('')

const filteredProblems = computed(() => {
	const keyword = searchKeyword.value.trim()
	return problems.value.filter(problem => {
		if (!keyword) return true
		const inContent = problem.content && problem.content.includes(keyword)
		const inTag = Array.isArray(problem.tag) && problem.tag.some(tag => tag.includes(keyword))
		return inContent || inTag
	})
})

const previewContent = (content?: string) => {
	if (!content) return ''
	return content.length > 100 ? `${content.slice(0, 100)}...` : content
}

const navigateToDetail = (id: string) => {
	router.push({ name: 'QuestionDetail', params: { id } })
}

const navigateToEdit = (id: string) => {
	router.push({ name: 'EditQuestion', params: { id } })
}

const navigateToAdd = () => {
	router.push({ name: 'AddQuestion' })
}

const navigateToSolve = (id: string) => {
	router.push({ name: 'SolveQuestion', params: { id } })
}

const handleDelete = async (id: string) => {
	if (confirm('确定要删除这道题目吗？')) {
		try {
			await deleteProblem(id)
		} catch (error) {
			console.error('删除题目失败:', error)
		}
	}
}
</script>

<style scoped>
.filters {
  background-color: var(--card-background);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
  transition: var(--transition);
}

.filters:hover {
  box-shadow: var(--shadow-lg);
}

.filters h2 {
  margin-top: 0;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group label {
  font-weight: bold;
  color: var(--text-color);
  white-space: nowrap;
}

.filter-group input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  flex-grow: 1;
  transition: var(--transition);
}

.add-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.add-button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.problem-list h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.problem-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.problem-item {
  transition: var(--transition);
}

.problem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.problem-content {
  margin-bottom: 0.5rem;
  word-break: break-word;
  color: var(--text-color);
  font-size: 1.1rem;
  font-weight: 500;
}

.problem-tags {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  transition: var(--transition);
  display: inline-block;
  margin: 0;
}

.tag:hover {
  transform: scale(1.05);
  background-color: var(--primary-color);
  color: white;
}

.problem-actions {
  display: flex;
  gap: 1rem;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.btn-delete:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.problem-title {
  margin: 0;
}

.no-results {
  text-align: center;
  padding: 2rem;
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  color: var(--text-light);
  transition: var(--transition);
}

.no-results:hover {
  box-shadow: var(--shadow-lg);
}

.problem-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.problem-item {
  padding: 1.5rem;
}

.problem-header {
  margin-bottom: 0.75rem;
}

.problem-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
}

.problem-content {
  margin-bottom: 1rem;
  line-height: var(--line-height-base);
}

.problem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.problem-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #6b7280;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-xl);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary:hover {
  background-color: #4b5563;
}

.btn-primary-white {
  background-color: white;
  color: #6b7280;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-xl);
  border: 1px solid #6b7280;
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary-white:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-secondary {
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-xl);
  border: none;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.btn-secondary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  color: white;
}

.btn-secondary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-edit {
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.btn-edit:hover {
  background-color: #d1d5db;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-2 {
  gap: 0.5rem;
}

.text-primary-color {
  color: var(--primary-color);
}

.text-lg {
  font-size: 1.125rem;
}

.font-semibold {
  font-weight: 600;
}

.bg-primary-light {
  background-color: var(--primary-light);
}

.bg-primary-color {
  background-color: var(--primary-color);
}

.text-white {
  color: white;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.rounded-md {
  border-radius: var(--border-radius-md);
}
</style>
