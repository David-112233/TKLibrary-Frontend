<template>
	<div>
		<AppNavbar />
		<div class="container">
			<div class="problem-edit">
				<h1>添加题目</h1>
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
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useProblemStore, type PhysicsProblem } from './stores/problemStore'

type ProblemFormState = Omit<PhysicsProblem, 'id' | 'createdAt' | 'updatedAt'>

const router = useRouter()
const { addProblem } = useProblemStore()

const createEmptyForm = (): ProblemFormState => ({
	title: '',
	content: '',
	chapter: '',
	difficulty: 'medium',
	source: '',
	tags: [],
	answer: '',
	analysis: ''
})

const form = reactive<ProblemFormState>(createEmptyForm())
const tagInput = ref('')

const handleAddTag = () => {
	if (!tagInput.value.trim()) {
		return
	}
	if (!form.tags.includes(tagInput.value.trim())) {
		form.tags.push(tagInput.value.trim())
	}
	tagInput.value = ''
}

const handleRemoveTag = (tag: string) => {
	const index = form.tags.indexOf(tag)
	if (index >= 0) {
		form.tags.splice(index, 1)
	}
}

const goHome = () => {
	router.push({ name: 'Home' })
}

const handleSubmit = () => {
	addProblem({ ...form })
	Object.assign(form, createEmptyForm())
	goHome()
}
</script>
