import { beforeEach, describe, expect, it } from 'vitest'
import { FormattingService } from '../../../classes/services/Formatting.service'

describe('formatDate()', () => {
	let service

	beforeEach(() => {
		service = new FormattingService()
	})

	it('retourne null pour une chaîne non parseable ("not-a-date")', () => {
		// new Date("not-a-date").getFullYear() === NaN → NaN !== currentYear → null
		expect(service.formatDate('not-a-date')).toBeNull()
	})

	it('retourne null pour une chaîne vide', () => {
		// new Date("") est Invalid Date
		expect(service.formatDate('')).toBeNull()
	})

	it('retourne null pour null', () => {
		// new Date(null) === epoch (1970) → année passée
		expect(service.formatDate(null)).toBeNull()
	})

	it('retourne null pour undefined', () => {
		// new Date(undefined) === Invalid Date
		expect(service.formatDate(undefined)).toBeNull()
	})

	it('retourne null pour un timestamp epoch (1970)', () => {
		expect(service.formatDate('1970-01-01T00:00:00Z')).toBeNull()
	})
})