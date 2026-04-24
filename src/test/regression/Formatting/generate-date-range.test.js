import { describe, expect, it } from 'vitest'
import { FormattingService } from '../../../classes/services/Formatting.service'

describe('generateDateRange()', () => {
	it('today n\'est pas muté par le calcul de futureDate avec un grand offset', () => {
		const service = new FormattingService()
		const before = new Date().toISOString().slice(0, 10)
		const { today, futureDate } = service.generateDateRange(365)
		expect(today.slice(0, 10)).toBe(before)
		expect(futureDate).not.toBe(today)
	})

	it('un offset négatif retourne une futureDate dans le passé', () => {
		const service = new FormattingService()
		const { today, futureDate } = service.generateDateRange(-7)
		expect(new Date(futureDate) < new Date(today)).toBe(true)
	})
})
