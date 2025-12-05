<template>
	<div>
		<AppNavbar />
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
				<template v-if="filteredProblems.length">
					<ul>
						<li v-for="problem in filteredProblems" :key="problem.id" class="problem-item">
							<div class="problem-header">
								<h3>{{ problem.title }}</h3>
								<span :class="['difficulty', problem.difficulty]">
									{{ getDifficultyText(problem.difficulty) }}
								</span>
							</div>
							<p class="problem-chapter">章节：{{ problem.chapter }}</p>
							<p class="problem-content">{{ previewContent(problem.content) }}</p>
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
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useProblemStore } from './stores/problemStore'

const router = useRouter()
const { problems } = useProblemStore()

const selectedDifficulty = ref<'all' | 'easy' | 'medium' | 'hard'>('all')
const selectedChapter = ref<'all' | string>('all')
const searchKeyword = ref('')

const filteredProblems = computed(() => {
	return problems.value.filter(problem => {
		const matchesDifficulty =
			selectedDifficulty.value === 'all' || problem.difficulty === selectedDifficulty.value
		const matchesChapter =
			selectedChapter.value === 'all' || problem.chapter === selectedChapter.value
		const keyword = searchKeyword.value.trim()
		const matchesKeyword =
			keyword === '' ||
			problem.title.includes(keyword) ||
			problem.content.includes(keyword) ||
			problem.tags.some(tag => tag.includes(keyword))

		return matchesDifficulty && matchesChapter && matchesKeyword
	})
})

const chapters = computed(() => Array.from(new Set(problems.value.map(problem => problem.chapter))))

const getDifficultyText = (difficulty: 'easy' | 'medium' | 'hard') => {
	switch (difficulty) {
		case 'easy':
			return '简单'
		case 'medium':
			return '中等'
		case 'hard':
			return '困难'
		default:
			return difficulty
	}
}

const previewContent = (content: string) => {
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
</script>
