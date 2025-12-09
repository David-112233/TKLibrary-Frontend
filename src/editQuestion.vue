<template>
	<div>
		<AppNavbar />
		<div class="container">
			<div class="problem-edit">
				<h1>编辑题目</h1>

				<template v-if="form">
					<form @submit.prevent="handleSubmit">
						<div class="form-group">
							<label for="content">题目内容</label>
							<textarea id="content" v-model="form.content" rows="6" required />
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
								<span v-for="tag in form.tag" :key="tag" class="tag">
									{{ tag }}
									<button type="button" @click="handleRemoveTag(tag)">×</button>
								</span>
							</div>
						</div>

						<div class="form-group">
							<label for="answer">答案</label>
							<input id="answer" type="text" v-model="form.answer" required />
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

type ProblemFormState = Pick<PhysicsProblem, 'content' | 'answer' | 'tag'>

const route = useRoute()
const router = useRouter()
const { getProblemById, updateProblem } = useProblemStore()

const form = ref<ProblemFormState | null>(null)
const tagInput = ref('')

const toFormState = (problem: PhysicsProblem): ProblemFormState => ({
	content: problem.content,
	tag: Array.isArray((problem as any).tag) ? [...(problem as any).tag] : [],
	answer: problem.answer
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
	if (!form.value) return
	const candidate = tagInput.value.trim()
	if (candidate && !form.value.tag.includes(candidate)) {
		form.value.tag.push(candidate)
	}
	tagInput.value = ''
}

const handleRemoveTag = (tag: string) => {
	if (!form.value) return
	form.value.tag = form.value.tag.filter((item: string) => item !== tag)
}

const goHome = () => {
	router.push({ name: 'Home' })
}

const handleSubmit = async () => {
		if (!form.value) return
		const id = route.params.id as string
		await updateProblem(id, { content: form.value.content, answer: form.value.answer, tag: form.value.tag })
		goHome()
	}
</script>
