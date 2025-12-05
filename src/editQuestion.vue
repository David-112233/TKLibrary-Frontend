<template>
	<div>
		<AppNavbar />
		<div class="container">
			<div class="problem-edit">
				<h1>编辑题目</h1>

				<template v-if="form">
					<form @submit.prevent="handleSubmit">
						<div class="form-group">
							<label for="title">题目标题</label>
							<input id="title" type="text" v-model="form.title" required />
						</div>

						<div class="form-group">
							<label for="content">题目内容</label>
							<textarea id="content" v-model="form.content" rows="6" required />
						</div>

						<div class="form-group">
							<label for="chapter">所属章节</label>
							<input id="chapter" type="text" v-model="form.chapter" required />
						</div>

						<div class="form-group">
							<label for="difficulty">难度</label>
							<select id="difficulty" v-model="form.difficulty">
								<option value="easy">简单</option>
								<option value="medium">中等</option>
								<option value="hard">困难</option>
							</select>
						</div>

						<div class="form-group">
							<label for="source">题目来源</label>
							<input id="source" type="text" v-model="form.source" />
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
								<span v-for="tag in form.tags" :key="tag" class="tag">
									{{ tag }}
									<button type="button" @click="handleRemoveTag(tag)">×</button>
								</span>
							</div>
						</div>

						<div class="form-group">
							<label for="answer">答案</label>
							<input id="answer" type="text" v-model="form.answer" required />
						</div>

						<div class="form-group">
							<label for="analysis">解析</label>
							<textarea id="analysis" v-model="form.analysis" rows="6" required />
						</div>

						<div class="form-actions">
							<button type="submit" class="submit-button">保存</button>
							<button type="button" class="cancel-button" @click="goHome">取消</button>
						</div>
					</form>
				</template>

				<template v-else>
					<p class="no-results">未找到对应的题目</p>
					<div class="problem-actions">
						<button @click="goHome">返回列表</button>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useProblemStore, type PhysicsProblem } from './stores/problemStore'

type ProblemFormState = Omit<PhysicsProblem, 'id' | 'createdAt' | 'updatedAt'>

const route = useRoute()
const router = useRouter()
const { getProblemById, updateProblem } = useProblemStore()

const form = ref<ProblemFormState | null>(null)
const tagInput = ref('')

const toFormState = (problem: PhysicsProblem): ProblemFormState => ({
	title: problem.title,
	content: problem.content,
	chapter: problem.chapter,
	difficulty: problem.difficulty,
	source: problem.source,
	tags: [...problem.tags],
	answer: problem.answer,
	analysis: problem.analysis
})

const loadForm = () => {
	const id = route.params.id as string
	const target = id ? getProblemById(id) : undefined
	form.value = target ? toFormState(target) : null
	tagInput.value = ''
}

watch(
	() => route.params.id,
	() => {
		loadForm()
	},
	{ immediate: true }
)

const handleAddTag = () => {
	if (!form.value) {
		return
	}
	const candidate = tagInput.value.trim()
	if (candidate && !form.value.tags.includes(candidate)) {
		form.value.tags.push(candidate)
	}
	tagInput.value = ''
}

const handleRemoveTag = (tag: string) => {
	if (!form.value) {
		return
	}
	form.value.tags = form.value.tags.filter((item: string) => item !== tag)
}

const goHome = () => {
	router.push({ name: 'Home' })
}

const handleSubmit = () => {
	if (!form.value) {
		return
	}
	const id = route.params.id as string
	updateProblem(id, { ...form.value })
	goHome()
}
</script>
