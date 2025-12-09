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
					<ul>
						<li v-for="problem in filteredProblems" :key="problem.id" class="problem-item">
							<div class="problem-header">
								<h3>题目预览</h3>
							</div>
							<p class="problem-content">{{ previewContent(problem.content) }}</p>
							<div class="problem-tags">
								<span v-for="tag in (problem.tag || [])" :key="tag" class="tag">{{ tag }}</span>
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
</script>
