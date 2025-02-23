<script setup lang="ts">
	import { ref } from 'vue'
	import { generateUniqueId } from '../utils'

	const selectMonth = ref(false)
	const uniqueId = generateUniqueId()
</script>

<template>
	<div :id="`__datenel_${uniqueId}`">
		<div class='datenel-component' role="dialog" aria-label="Date selection panel" v-if="!selectMonth">
			<div className='__datenel_header'>
				<button className='__datenel_stepper' @click="() => {}" :aria-label="`Go to last month, `"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path></svg></button>
				<button className='__datenel_indicator' @click="() => {}" :aria-label="`You are now at . Click here to quick-select month or year.`">
					Feb 2025
				</button>
				<button className='__datenel_stepper' @click="() => {}" :aria-label="`Go to next month, `"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path></svg></button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use '../style.scss' as *;
</style>