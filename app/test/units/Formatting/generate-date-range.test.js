import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FormattingService } from '../../../classes/services/Formatting.service.js'

const FIXED_NOW = new Date('2024-06-01T00:00:00.000Z')

describe('generateDateRange()', () => {
	let service

	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(FIXED_NOW)
		service = new FormattingService()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('retourne un objet avec les clés today et futureDate', () => {
		const result = service.generateDateRange()
		expect(result).toHaveProperty('today')
		expect(result).toHaveProperty('futureDate')
	})

	it('today est l\'ISO string de maintenant', () => {
		const { today } = service.generateDateRange()
		expect(today).toBe(FIXED_NOW.toISOString())
	})

	it('futureDate est à 14 jours par défaut', () => {
		const { futureDate } = service.generateDateRange()
		const expected = new Date('2024-06-15T00:00:00.000Z').toISOString()
		expect(futureDate).toBe(expected)
	})

	it('futureDate respecte le daysOffset passé en argument', () => {
		const { futureDate } = service.generateDateRange(7)
		const expected = new Date('2024-06-08T00:00:00.000Z').toISOString()
		expect(futureDate).toBe(expected)
	})

	it('futureDate avec offset 0 est égal à today', () => {
		const { today, futureDate } = service.generateDateRange(0)
		expect(futureDate).toBe(today)
	})

	it('today et futureDate sont des ISO strings valides', () => {
		const { today, futureDate } = service.generateDateRange()
		expect(() => new Date(today)).not.toThrow()
		expect(() => new Date(futureDate)).not.toThrow()
		expect(new Date(today).toISOString()).toBe(today)
		expect(new Date(futureDate).toISOString()).toBe(futureDate)
	})

	it('ne mute pas la date today lors du calcul de futureDate', () => {
		const { today, futureDate } = service.generateDateRange(30)
		expect(today).toBe(FIXED_NOW.toISOString())
		expect(futureDate).not.toBe(today)
	})
})