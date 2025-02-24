<script setup lang="ts">
	import { ref, defineProps, watch, onMounted, toRefs } from 'vue'
	import { generateUniqueId, applyColor } from '../utils'

	interface SingleDatePickerProps {
		colorScheme: {
			mainColor: string
			accentColor: string
			borderColor: string
			hoverColor: string
			reversedColor: string
		}
	}

	const props = defineProps({
		colorScheme: {
			type: Object as () => SingleDatePickerProps['colorScheme'],
			default: () => ({
				mainColor: '#000000',
				accentColor: '#000000',
				borderColor: '#e0e0e0',
				hoverColor: '#00000017',
				reversedColor: '#ffffff',
			}),
			required: false,
		}
	})

	const selectMonth = ref(false)
	const uniqueId = generateUniqueId()
	const currentMonth = ref(new Date().getMonth())
	const currentYear = ref(new Date().getFullYear())

	const { colorScheme } = toRefs(props)

	watch(colorScheme, newVal => {
		applyColor(uniqueId, newVal)
	})

	onMounted(() => {
		applyColor(uniqueId, colorScheme.value)
	})

	function goToLastMonth() {
		if (currentMonth.value === 0) {
			currentMonth.value = 11
			currentYear.value -= 1
		} else {
			currentMonth.value -= 1
		}
	}

	function goToNextMonth() {
		if (currentMonth.value === 11) {
			currentMonth.value = 0
			currentYear.value += 1
		} else {
			currentMonth.value += 1
		}
	}

</script>

<template>
	<div :id="`__datenel-${uniqueId}`">
		<div class='datenel-component' role="dialog" aria-label="Date selection panel" v-if="!selectMonth">
			<div className='__datenel_header'>
				<button className='__datenel_stepper' @click="goToLastMonth()" :aria-label="`Go to last month, ${new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path></svg></button>
				<button className='__datenel_indicator' @click="selectMonth = true" :aria-label="`You are now at ${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}. Click here to quick-select month or year.`">
					{{  new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' }) }}
				</button>
				<button className='__datenel_stepper' @click="goToNextMonth()" :aria-label="`Go to next month, ${new Date(currentYear, currentMonth + 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path></svg></button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use '../style.scss' as *;
</style>