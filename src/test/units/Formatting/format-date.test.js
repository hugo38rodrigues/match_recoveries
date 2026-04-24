import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FormattingService } from '../../../classes/services/Formatting.service.js'

describe('formatDate()', () => {
	let service
	const currentYear = new Date().getFullYear()

	beforeEach(() => {
		service = new FormattingService()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('retourne un objet Date si l\'année correspond à l\'année courante', () => {
		const result = service.formatDate(`${currentYear}-06-15T12:00:00Z`)
		expect(result).toBeInstanceOf(Date)
	})

	it('retourne null si l\'année est dans le passé', () => {
		expect(service.formatDate(`${currentYear - 1}-06-15T12:00:00Z`)).toBeNull()
	})

	it('retourne null si l\'année est dans le futur', () => {
		expect(service.formatDate(`${currentYear + 1}-06-15T12:00:00Z`)).toBeNull()
	})

	it('retourne la date parsée correcte pour une date de l\'année courante', () => {
		const input = `${currentYear}-03-20T10:00:00Z`
		const result = service.formatDate(input)
		expect(result.toISOString()).toBe(new Date(input).toISOString())
	})

	it('compare bien l\'année UTC de la date avec l\'année courante', () => {
		// 31 décembre année courante
		const result = service.formatDate(`${currentYear}-12-31T23:59:59Z`)
		expect(result).toBeInstanceOf(Date)
	})

	it('retourne null pour une chaîne de date d\'une autre année même si proche', () => {
		// 1er janvier de l'année suivante
		const result = service.formatDate(`${currentYear + 1}-01-01T00:00:00Z`)
		expect(result).toBeNull()
	})

	it('l\'année courante est figée à l\'instantiation du service', () => {
		// On fige l'heure AVANT d'instancier le service
		vi.useFakeTimers()
		vi.setSystemTime(new Date(`${currentYear}-07-01T00:00:00Z`))

		const frozenService = new FormattingService()
		const result = frozenService.formatDate(`${currentYear}-01-01T00:00:00Z`)

		expect(result).toBeInstanceOf(Date)
	})
})