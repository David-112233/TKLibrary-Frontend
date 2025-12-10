<template>
	<div>
		<AppNavbar />
		<div class="container">
			<div class="problem-detail">
				<template v-if="problem">
					<div class="problem-header">
						<h1>题目详情</h1>
					</div>

					<div class="problem-meta">
						<div class="problem-tags">
							<span v-for="tag in (problem.tag || [])" :key="tag" class="tag">{{ tag }}</span>
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



					<div class="problem-actions">
						<button class="btn-secondary" @click="goHome">返回列表</button>
						<button class="btn-primary" @click="goEdit(problem.id)">编辑题目</button>
					</div>
				</template>
				<template v-else>
					<p class="error-msg">题目不存在</p>
					<div class="problem-actions">
						<button class="btn-secondary" @click="goHome">返回列表</button>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<style scoped>
.problem-detail {
  background-color: var(--card-background);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  max-width: 800px;
  margin: 0 auto;
}

.problem-header h1 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 1rem;
}

.problem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.tag {
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.problem-content,
.problem-answer {
  margin-bottom: 2rem;
}

h3 {
  color: var(--text-color);
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

p {
  color: var(--text-color);
  line-height: var(--line-height-base);
  font-size: 1rem;
}

.problem-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-secondary {
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
}

.btn-secondary:hover {
  background-color: var(--border-color);
}

.error-msg {
  text-align: center;
  color: var(--text-light);
  margin: 2rem 0;
}
</style>

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


const goHome = () => {
	router.push({ name: 'Home' })
}

const goEdit = (id: string) => {
	router.push({ name: 'EditQuestion', params: { id } })
}
</script>
