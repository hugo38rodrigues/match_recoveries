export class FormattingService {
	#currentYear = new Date().getFullYear()

	formatDate (dateString) {
		const date = new Date(dateString)
		return date.getFullYear() === this.#currentYear ? date : null
	}

	formatSlugToName (slug) {
		if (!slug) return slug
		return slug
			.replace(/-/g, ' ')
			.replace(/^./, (char) => char.toUpperCase())
	}

	generateDateRange (daysOffset = 14) {
		const today = new Date()
		const futureDate = new Date(today)
		futureDate.setDate(today.getDate() + daysOffset)

		return {
			today: today.toISOString(),
			futureDate: futureDate.toISOString(),
		}
	}
}