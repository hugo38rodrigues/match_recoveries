import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DataExtractionService } from '../../../classes/services/DataExtraction.service.js'

const makeFormatter = () => ({
	formatDate: vi.fn().mockReturnValue('2024-01-05'),
	formatSlugToName: vi.fn().mockReturnValue('League of Legends'),
})

const makeData = (overrides = {}) => ({
	id: 42,
	number_of_games: 3,
	begin_at: '2024-01-05T18:00:00Z',
	videogame: { slug: 'league-of-legends' },
	league: { name: 'LCS' },
	rescheduled: false,
	...overrides,
})

describe('extractBaseFields()', () => {
	let service
	let formatter

	beforeEach(() => {
		formatter = makeFormatter()
		service   = new DataExtractionService(formatter)
	})

	it('retourne idMatch en string depuis data.id', () => {
		const result = service.extractBaseFields(makeData({ id: 42 }))
		expect(result.idMatch).toBe('42')
	})

	it('retourne numberOfGame en string depuis data.number_of_games', () => {
		const result = service.extractBaseFields(makeData({ number_of_games: 5 }))
		expect(result.numberOfGame).toBe('5')
	})

	it('appelle formatter.formatDate avec data.begin_at', () => {
		const data = makeData({ begin_at: '2024-01-05T18:00:00Z' })
		service.extractBaseFields(data)
		expect(formatter.formatDate).toHaveBeenCalledWith('2024-01-05T18:00:00Z')
	})

	it('retourne la date formatée depuis formatter.formatDate', () => {
		formatter.formatDate.mockReturnValue('05/01/2024')
		const result = service.extractBaseFields(makeData())
		expect(result.date).toBe('05/01/2024')
	})

	it('appelle formatter.formatSlugToName avec data.videogame.slug', () => {
		const data = makeData({ videogame: { slug: 'league-of-legends' }})
		service.extractBaseFields(data)
		expect(formatter.formatSlugToName).toHaveBeenCalledWith('league-of-legends')
	})

	it('retourne gameName depuis formatter.formatSlugToName', () => {
		formatter.formatSlugToName.mockReturnValue('League of Legends')
		const result = service.extractBaseFields(makeData())
		expect(result.gameName).toBe('League of Legends')
	})

	it('retourne leagueName depuis data.league.name', () => {
		const result = service.extractBaseFields(makeData({ league: { name: 'LEC' }}))
		expect(result.leagueName).toBe('LEC')
	})

	it('retourne rescheduled depuis data.rescheduled', () => {
		const result = service.extractBaseFields(makeData({ rescheduled: true }))
		expect(result.rescheduled).toBe(true)
	})

	it('retourne la structure complète attendue', () => {
		const result = service.extractBaseFields(makeData())
		expect(result).toEqual({
			idMatch:      '42',
			numberOfGame: '3',
			date:         '2024-01-05',
			gameName:     'League of Legends',
			leagueName:   'LCS',
			rescheduled:  false,
		})
	})
})