<script lang="ts">
/** 
 * @name SingleDatePicker
 * @description A panel that allows users to select a date.
 * @component
 * @see {@link https://datenel.js.org/guide/vue/components/SingleDatePicker.html}
 */
export default {
	name: 'SingleDatePicker',
}

export interface SingleDatePickerPropsColorScheme {
	mainColor: string
	accentColor: string
	borderColor: string
	hoverColor: string
	reversedColor: string
}

export type SingleDatePickerPropsAvailableDates = [Date | null, Date | null]
</script>

<script setup lang="ts">
import { ref, defineProps, watch, onMounted, toRefs, getCurrentInstance, PropType } from 'vue'
import { generateUniqueId, applyColor, getL10Weekday, getCalendarDates } from '../utils'

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
	 * @see {@link https://datenel.js.org/guide/vue/components/SingleDatePicker.html#colorscheme}
	 * 
	 * @default { mainColor: '#000000', accentColor: '#000000', borderColor: '#e0e0e0', hoverColor: '#00000017', reversedColor: '#ffffff' }
	 */
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
	/**
	 * Localization
	 * @description The language code that will be used to localize the panel.
	 * 
	 * Accept standard ISO 639-1 language code, such as 'zh-CN', 'en-US', 'ja-JP', etc. Note 
	 * that it will not effect to the screen reader, but the screen reader will still read the 
	 * date in the user’s language.
	 * 
	 * @see {@link https://datenel.js.org/guide/vue/components/SingleDatePicker.html#localization}
	 * @default navigator.language
	 */
	localization: {
		type: String,
		required: false,
	},
	/**
		* Value of the selected date.
		* 
		* @description Control the selected
		* date programmatically, including situations like provide a default value or control the selected 
		* date by parent component.
		* 
		* @see {@link https://datenel.js.org/guide/vue/components/SingleDatePicker.html#value}
		* 
		* @example new Date(2025, 0, 1)
		* @default undefined (the panel will be in read-only mode)
		*/
	modelValue: {
		type: Date,
		required: false,
	},
	/**
	 * Available range of dates
	 * 
	 * @description Limit a range of dates that can be selected. It should be an array of two dates, which the first
	 * one is the available range start date, and the second one is the available range end date. 
	 * 
	 * The parameter will be ignored if the array length is not 2.
	 * 
	 * @see {@link https://datenel.js.org/guide/vue/components/SingleDatePicker.html#availablerange}
	 * 
	 * @example [new Date(2025, 0, 1), new Date(2025, 11, 31)]
	 * @example [new Date(2025, 0, 1), null]
	 * @example [null, new Date(2025, 11, 31)]
	 * @example [new Date(2025, 11, 31), new Date(2025, 0, 1)]
	 * @default undefined
	 */
	availableRange: {
		type: Array as unknown as PropType<SingleDatePickerPropsAvailableDates>,
		required: false,
	},
	/**
	 * Event handler when the panel is closed.
	 * @description User requires to close the panel without select a specific date. Note 
	 * that the close button is not visible, but can be read by screen reader. The close 
	 * button for the screen reader is only available when this prop is not `undefined`.
	 * 
	 * @see {@link https://datenel.js.org/guide/vue/components/SingleDatePicker.html#onclose-void}
	 * 
	 * @default undefined
	 */
	close: {
		type: Function,
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
const availableRangeStart = ref<Date | null>(null)
const availableRangeEnd = ref<Date | null>(null)

const { colorScheme, localization, availableRange } = toRefs(props)

watch(colorScheme, newVal => {
	applyColor(uniqueId, newVal)
})

watch([currentMonth, currentYear], () => {
	dates.value = getCalendarDates(currentMonth.value, currentYear.value)
})

watch([availableRange], () => {
	calculateAvailableRange()
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

	calculateAvailableRange()
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

function notAvailable(date: Date): boolean {
	return currentMonth.value !== date.getMonth() || (availableRangeStart.value !== null && date < availableRangeStart.value) || (availableRangeEnd.value !== null && date > availableRangeEnd.value)
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

function monthNotAvailable(month: number): boolean {
	// When the last day of a month not inside the range of available dates
	const lastDayOfMonth = new Date(currentYear.value, month + 1, 0)
	if (availableRangeStart.value && lastDayOfMonth < availableRangeStart.value) return true
	// When the first day of a month not inside the range of available dates
	const firstDayOfMonth = new Date(currentYear.value, month, 1)
	if (availableRangeEnd.value && firstDayOfMonth > availableRangeEnd.value) return true
	return false
}

function closePanel() {
	emit('close')
}

function calculateAvailableRange() {
	if (!props.availableRange) {
		availableRangeStart.value = null
		availableRangeEnd.value = null
		return
	}

	if (props.availableRange.length !== 2) {
		console.warn('Invalid availableRange: The length of the array should be 2. The parameter will be ignored.')
		availableRangeStart.value = null
		availableRangeEnd.value = null
		return
	}

	const [start, end] = props.availableRange

	if (start && end) {
		if (start > end) {
			availableRangeStart.value = end
			availableRangeEnd.value = start
		} else {
			availableRangeStart.value = start
			availableRangeEnd.value = end
		}
	} else if (start && !end) {
		availableRangeStart.value = start
		availableRangeEnd.value = null
	} else if (!start && end) {
		availableRangeStart.value = null
		availableRangeEnd.value = end
	} else {
		availableRangeStart.value = null
		availableRangeEnd.value = null
	}
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
						:class="`__datenel_item ${monthNotAvailable(index) && '__datenel_not-available'} ${currentMonth === index && '__datenel_active'}`"
						key={index}
						@click="() => {
							currentMonth = index
							selectMonth = false
						}"
						:aria-label="`Go to ${new Date(currentYear, index).toLocaleString(localization, { month: 'long' })} of the year ${currentYear}`"
						:disabled="monthNotAvailable(index)"
						:aria-hidden="monthNotAvailable(index)"
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