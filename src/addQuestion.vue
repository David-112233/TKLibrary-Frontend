<template>
	<div>
		<AppNavbar />
		<div class="container">
			<div class="problem-edit">
				<h1>添加题目</h1>
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
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useProblemStore, type PhysicsProblem } from './stores/problemStore'

type ProblemFormState = Pick<PhysicsProblem, 'content' | 'answer' | 'tag'>

const router = useRouter()
const { addProblem } = useProblemStore()

const createEmptyForm = (): ProblemFormState => ({
	content: '',
	answer: '',
	tag: []
})

const form = reactive<ProblemFormState>(createEmptyForm())
const tagInput = ref('')

const handleAddTag = () => {
	if (!tagInput.value.trim()) return
	if (!form.tag.includes(tagInput.value.trim())) {
		form.tag.push(tagInput.value.trim())
	}
	tagInput.value = ''
}

const handleRemoveTag = (tag: string) => {
	const index = form.tag.indexOf(tag)
	if (index >= 0) {
		form.tag.splice(index, 1)
	}
}

const goHome = () => {
	router.push({ name: 'Home' })
}

const handleSubmit = () => {
	addProblem({ content: form.content, answer: form.answer, tag: form.tag })
	Object.assign(form, createEmptyForm())
	goHome()
}
</script>
