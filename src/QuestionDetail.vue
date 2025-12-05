<template>
	<div>
		<AppNavbar />
		<div class="container">
			<div class="problem-detail">
				<template v-if="problem">
					<div class="problem-header">
						<h1>{{ problem.title }}</h1>
						<span :class="['difficulty', problem.difficulty]">{{ getDifficultyText(problem.difficulty) }}</span>
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
						<button @click="goHome">返回列表</button>
						<button @click="goEdit(problem.id)">编辑题目</button>
					</div>
				</template>
				<template v-else>
					<p>题目不存在</p>
					<div class="problem-actions">
						<button @click="goHome">返回列表</button>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useProblemStore } from './stores/problemStore'

const route = useRoute()
const router = useRouter()
const { problems } = useProblemStore()

const problem = computed(() => {
	const id = route.params.id as string
	return problems.value.find(item => item.id === id)
})

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

const goHome = () => {
	router.push({ name: 'Home' })
}

const goEdit = (id: string) => {
	router.push({ name: 'EditQuestion', params: { id } })
}
</script>
