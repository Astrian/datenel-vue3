<script setup lang="ts">
	import { ref, defineProps, watch, onMounted, toRefs, getCurrentInstance } from 'vue'
	import { generateUniqueId, applyColor, getL10Weekday, getCalendarDates } from '../utils'

	interface SingleDatePickerPropsColorScheme {
		mainColor: string
		accentColor: string
		borderColor: string
		hoverColor: string
		reversedColor: string
	}

	const props = defineProps({
		colorScheme: {
			type: Object as () => SingleDatePickerPropsColorScheme,
			default: () => ({
				mainColor: '#000000',
				accentColor: '#000000',
				borderColor: '#e0e0e0',
				hoverColor: '#00000017',
				reversedColor: '#ffffff',
			}),
			required: false,
		},
		localization: {
			type: String,
			required: false,
		},
		modelValue: {
			type: Date,
			required: false,
		}
	})

	const emit = defineEmits(['update:modelValue', 'close'])
	const selectMonth = ref(false)
	const uniqueId = generateUniqueId()
	const currentMonth = ref(new Date().getMonth())
	const currentYear = ref(new Date().getFullYear())
	const l10nDays = ref<string[]>([])
	const dates = ref<Date[]>([])
	const hasCloseListener = getCurrentInstance()?.vnode?.props?.onClose !== undefined

	const { colorScheme, localization } = toRefs(props)

	watch(colorScheme, newVal => {
		applyColor(uniqueId, newVal)
	})

	watch([currentMonth, currentYear], () => {
		dates.value = getCalendarDates(currentMonth.value, currentYear.value)
	})

	onMounted(() => {
		applyColor(uniqueId, colorScheme.value)
		l10nDays.value = getL10Weekday(localization?.value || navigator.languages[0])
		
		if (props.modelValue) {
			currentMonth.value = props.modelValue.getMonth()
			currentYear.value = props.modelValue.getFullYear()
		} else {
			currentMonth.value = new Date().getMonth()
			currentYear.value = new Date().getFullYear()
		}
		dates.value = getCalendarDates(currentMonth.value, currentYear.value)
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

	function notAvailable(date: Date) {
		return currentMonth.value !== date.getMonth() //TODO: available date ranges
	}

	function selectDate(date: Date) {
		emit('update:modelValue', date)
	}

	function changeYear(event: Event) {
		const target = event.target as HTMLInputElement
		const year = parseInt(target.value)
		if (year) currentYear.value = year
	}

	function adjustYear() {
		if (currentYear.value < 100) currentYear.value = parseInt(`20${currentYear.value}`)
	}

	function monthNotAvailable() {
		return false
	}

	function closePanel() {
		emit('close')
	}

</script>

<template>
	<div :id="`__datenel-${uniqueId}`" class='datenel-component'>
		<div role="dialog" aria-label="Date selection panel, you are now at month and year quick-select" v-if="selectMonth">
			<div class='__datenel_header'>
				<button class='__datenel_stepper' @click="() => {
					if (currentYear <= 100) return
					currentYear -= 1
				}" :aria-label="`Go to last year, ${currentYear - 1}, you are now at year ${currentYear}`"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path></svg></button>
				<input class='__datenel_indicator'
					v-model="currentYear"
					@change="changeYear"
					@blur="adjustYear"
					aria-label="Year input, type a year to go to that year"
				/>
				<button class='__datenel_stepper' @click="() => {
					if (currentYear >= 9999) return
					currentYear += 1
				}" :aria-label="`Go to next year, ${currentYear + 1}, you are now at year ${currentYear}`"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path></svg></button>
			</div>

			<div class='__datenel_body'>
				<div class='__datenel_month-selector-body'>
					<button
						v-for="(_, index) in 12"
						:class="`__datenel_item ${monthNotAvailable() && '__datenel_not-available'}`"
						key={index}
						@click="() => {
							currentMonth = index
							selectMonth = false
						}"
						:aria-label="`Go to ${new Date(currentYear, index).toLocaleString(localization, { month: 'long' })} of the year ${currentYear}`"
						:disabled="monthNotAvailable()"
						:aria-hidden="monthNotAvailable()"
					>
						{{new Date(currentYear, index).toLocaleString(localization, { month: 'long' })}}
					</button>
				</div>
			</div>
		</div>

		<div role="dialog" aria-label="Date selection panel" v-if="!selectMonth">
			<div class='__datenel_header'>
				<button class='__datenel_stepper' @click="goToLastMonth()" :aria-label="`Go to last month, ${new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path></svg></button>
				<button class='__datenel_indicator' @click="selectMonth = true" :aria-label="`You are now at ${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}. Click here to quick-select month or year.`">
					{{  new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' }) }}
				</button>
				<button class='__datenel_stepper' @click="goToNextMonth()" :aria-label="`Go to next month, ${new Date(currentYear, currentMonth + 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path></svg></button>
			</div>

			<div class='__datenel_body'>
				<div class='__datenel_calendar-view-body __datenel_grid' aria-live="polite">
					<div class='__datenel_item __datenel_day-indicator' v-for="(day, index) in l10nDays" :key="index">{{ day }}</div>
					<!--  -->
					<button
						v-for="date in dates"
						:class="`__datenel_item __datenel_date ${notAvailable(date) && '__datenel_not-available'} ${modelValue?.toDateString() === date.toDateString() && '__datenel_active'}`"
						:key="date.toISOString()"
						@click="selectDate(date)"
						:aria-label="`${date.toLocaleString(localization, { dateStyle: 'full' })}${date.toDateString() === new Date().toDateString() ? ', this is today' : ''}, click to select this date`"
						:tabIndex="currentMonth !== date.getMonth() ? -1 : 0"
						:aria-hidden="notAvailable(date)"
						:disabled="notAvailable(date)"
					>
							{{date.getDate()}}
							<svg v-if="date.toDateString() === new Date().toDateString()" xmlns="http://www.w3.org/2000/svg" class='__datenel_today-indicator' viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path></svg>
						</button>
				</div>
			</div>
		</div>

		<button class='__datenel_sr-only' @click="closePanel" v-if="hasCloseListener">Close the panel</button>
	</div>
</template>

<style lang="scss" scoped>
@use '../style.scss' as *;
</style>