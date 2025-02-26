<script lang="ts">
/** 
 * @name SingleWeekPicker
 * @description A panel that allows users to select a week.
 * @component
 * @see {@link https://datenel.js.org/guide/vue3/components/SingleWeekPicker.html}
 */
export default {
	name: 'SingleDatePicker',
}

export interface SingleWeekPickerPropsColorScheme {
	mainColor: string
	accentColor: string
	borderColor: string
	hoverColor: string
	reversedColor: string
}
export interface SingleWeekPickerModelValue {
	weekYear: number
	weekNum: number
}
</script>

<script setup lang="ts">
import { ref, defineProps, toRefs, onMounted, getCurrentInstance, watch } from 'vue'
import { generateUniqueId, applyColor, getL10Weekday, getCalendarDates, calculateWeekNum } from '../utils'

const selectMonth = ref(false)
const uniqueId = generateUniqueId()
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const l10nDays = ref<string[]>([])
const calendarWeeks = ref<Date[][]>([])
const props = defineProps({
	/**
	 * The color scheme of the component
	 * 
	 * @description Customize the color scheme of the component.
	 * 
	 * The object should contain the following properties:
	 * 
	 * - `mainColor`: The main color of the panel, including the text color and the border color.
	 * - `accentColor`: The accent color of the panel, including the background color of the selected date.
	 * - `borderColor`: The border color of the panel, including the divider color between the header and the body.
	 * - `hoverColor`: The hover color of the panel, including the hover background color of the date.
	 * - `reversedColor`: The reversed color of the panel, including the text color of the selected date.
	 * 
	 * @see {@link https://datenel.js.org/guide/vue3/components/SingleWeekPicker.html#colorscheme}
	 * 
	 * @default { mainColor: '#000000', accentColor: '#000000', borderColor: '#e0e0e0', hoverColor: '#00000017', reversedColor: '#ffffff' }
	 */
	colorScheme: {
		type: Object as () => SingleWeekPickerPropsColorScheme,
		default: () => ({
			mainColor: '#000000',
			accentColor: '#000000',
			borderColor: '#e0e0e0',
			hoverColor: '#00000017',
			reversedColor: '#ffffff',
		}),
		required: false,
	},
	/**
	 * Localization
	 * @description The language code that will be used to localize the panel.
	 * 
	 * Accept standard ISO 639-1 language code, such as 'zh-CN', 'en-US', 'ja-JP', etc. Note 
	 * that it will not effect to the screen reader, but the screen reader will still read the 
	 * date in the user’s language.
	 * 
	 * @see {@link https://datenel.js.org/guide/vue3/components/SingleWeekPicker.html#localization}
	 * @default navigator.language
	 */
	localization: {
		type: String,
		required: false,
	},
	/**
	 * The model value of the component
	 * 
	 * @description The model value of the component.
	 * 
	 * @see {@link https://datenel.js.org/guide/vue3/components/SingleWeekPicker.html#modelvalue-a-k-a-v-model}
	 */
	modelValue: {
		type: Object as () => SingleWeekPickerModelValue,
		required: false,
	},
	/**
	 * Event handler when the panel is closed.
	 * @description User requires to close the panel without select a specific date. Note 
	 * that the close button is not visible, but can be read by screen reader. The close 
	 * button for the screen reader is only available when this prop is not `undefined`.
	 * 
	 * @see {@link https://datenel.js.org/guide/vue3/components/SingleWeekPicker.html#close-void}
	 * 
	 * @default undefined
	 */
	close: {
		type: Function,
		required: false,
	}
})

const { colorScheme, localization } = toRefs(props)
const emit = defineEmits(['update:modelValue', 'close'])
const hasCloseListener = getCurrentInstance()?.vnode?.props?.onClose !== undefined

onMounted(() => {
	applyColor(uniqueId, colorScheme.value)
	l10nDays.value = getL10Weekday(localization?.value || navigator.languages[0])

	if (props.modelValue) {
		let weekYear = props.modelValue.weekYear
		let weekNum = props.modelValue.weekNum
		if (weekYear < 100) weekYear = Number(`20${weekYear}`)
		if (weekNum < 1 || weekNum > 53)
			console.warn('The week number should be between 1 and 53.')
		else {
			const date = new Date(weekYear, 0, 1)
			date.setDate(date.getDate() + (weekNum - 1) * 7)
			currentMonth.value = date.getMonth()
			currentYear.value = date.getFullYear()
		}
	} else {
		currentMonth.value = new Date().getMonth()
		currentYear.value = new Date().getFullYear()
	}

	const dates = getCalendarDates(currentMonth.value, currentYear.value)
	let weeks: Date[][] = []
	for (let i = 0; i < dates.length; i += 7)
		weeks.push(dates.slice(i, i + 7))
	calendarWeeks.value = weeks
})

watch(colorScheme, newVal => {
	applyColor(uniqueId, newVal)
})

watch([currentMonth, currentYear], () => {
	const dates = getCalendarDates(currentMonth.value, currentYear.value)
	let weeks: Date[][] = []
	for (let i = 0; i < dates.length; i += 7)
		weeks.push(dates.slice(i, i + 7))
	calendarWeeks.value = weeks
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

function closePanel() {
	emit('close')
}

function selectWeek(weekYear: number, weekNum: number) {
	emit('update:modelValue', { weekYear, weekNum })
}

function changeYear(event: Event) {
	const target = event.target as HTMLInputElement
	const year = parseInt(target.value)
	if (year) currentYear.value = year
}

function adjustYear() {
	if (currentYear.value < 100) currentYear.value = parseInt(`20${currentYear.value}`)
}

</script>

<template>
	<div :id="`__datenel-${uniqueId}`" class='datenel-component'>
		<div role="dialog" aria-label="Week selection panel, you are now at month and year quick-select" v-if="selectMonth">
			<div class='__datenel_header'>
				<button class='__datenel_stepper' @click="() => {
					if (currentYear <= 100) return
					currentYear -= 1
				}" :aria-label="`Go to last year, ${currentYear - 1}, you are now at year ${currentYear}`"><svg
						xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z">
						</path>
					</svg></button>
				<input class='__datenel_indicator' v-model="currentYear" @change="changeYear" @blur="adjustYear"
					aria-label="Year input, type a year to go to that year" />
				<button class='__datenel_stepper' @click="() => {
					if (currentYear >= 9999) return
					currentYear += 1
				}" :aria-label="`Go to next year, ${currentYear + 1}, you are now at year ${currentYear}`"> <svg
						xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z">
						</path>
					</svg></button>
			</div>

			<div class='__datenel_body'>
				<div class='__datenel_month-selector-body'>
					<button v-for="(_, index) in 12" :class="`__datenel_item ${currentMonth === index && '__datenel_active'}`"
						key={index} @click="() => {
							currentMonth = index
							selectMonth = false
						}" :aria-label="`Go to ${new Date(currentYear, index).toLocaleString(localization, { month: 'long' })} of the year ${currentYear}`">
						{{ new Date(currentYear, index).toLocaleString(localization, { month: 'long' }) }}
					</button>
				</div>
			</div>
		</div>

		<div v-else>
			<div class='__datenel_header'>
				<button class='__datenel_stepper' @click="goToLastMonth()"
					:aria-label="`Go to last month, ${new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`"><svg
						xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z">
						</path>
					</svg></button>
				<button class='__datenel_indicator' @click="selectMonth = true"
					:aria-label="`You are now at ${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}. Click here to quick-select month or year.`">
					{{ new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' }) }}
				</button>
				<button class='__datenel_stepper' @click="goToNextMonth()"
					:aria-label="`Go to next month, ${new Date(currentYear, currentMonth + 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`"><svg
						xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z">
						</path>
					</svg></button>
			</div>

			<div class="__datenel_body">
				<div class="__datenel_week-indicator">
					<div class="__datenel_item __datenel_title">Wk</div>

					<div v-for="week in calendarWeeks" :class="`__datenel_item ${modelValue && (modelValue.weekNum === calculateWeekNum(week[0]).weekNum && modelValue.weekYear === calculateWeekNum(week[0]).weekYear) ? '__datenel_active' : ''}`"
						:key="calculateWeekNum(week[0]).weekNum" @click="selectWeek(calculateWeekNum(week[0]).weekYear, calculateWeekNum(week[0]).weekNum)">
						{{ calculateWeekNum(week[0]).weekNum }}
					</div>
				</div>

				<div class='__datenel_calendar-view-body __datenel_flex' aria-live="polite">
					<div class="__datenel_listitem">
						<div v-for="(_, index) in Array.from({ length: 7 })" class='__datenel_item __datenel_day-indicator'
							:key="index">{{ l10nDays[index] }}</div>
					</div>

					<button v-for="(week, index) in calendarWeeks"
						:class="`__datenel_listitem ${modelValue && (modelValue.weekNum === calculateWeekNum(week[0]).weekNum && modelValue.weekYear === calculateWeekNum(week[0]).weekYear) ? '__datenel_active' : ''}`"
						:key="index" @click="selectWeek(calculateWeekNum(week[0]).weekYear, calculateWeekNum(week[0]).weekNum)"
						:aria-label="`Select week ${calculateWeekNum(week[0]).weekNum} of the year ${calculateWeekNum(week[0]).weekYear}, from ${week[0].toLocaleString(localization, { dateStyle: `full` })} to ${week[6].toLocaleString(localization, { weekday: 'long' })}, ${week[6].toLocaleString(localization, { month: 'long' })} ${week[6].getDate()}, ${week[6].getFullYear()}`">
						<div v-for="date in week"
							:class="`__datenel_item __datenel_date ${currentMonth !== date.getMonth() && '__datenel_extra-month'}`"
							:key="date.getDate()">
							{{ date.getDate() }}
							<svg v-if="date.toDateString() === new Date().toDateString()" xmlns="http://www.w3.org/2000/svg"
								class='__datenel_today-indicator' viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z">
								</path>
							</svg>
						</div>
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