import { beforeEach, describe, expect, it } from 'vitest'
import { DataExtractionService } from '../../../classes/services/DataExtraction.service.js'

const makeOpponent = ({ id, name, acronym, image_url }) => ({
	opponent: { id, name, acronym, image_url },
})

const makeData = (t1, t2) => ({
	opponents: [makeOpponent(t1), makeOpponent(t2)],
})

describe('extractTeams()', () => {
	let service

	beforeEach(() => {
		service = new DataExtractionService({})
	})

	const team1 = { id: 1, name: 'Team Liquid', acronym: 'TL', image_url: 'https://logo1.png' }
	const team2 = { id: 2, name: 'Cloud9',      acronym: 'C9', image_url: 'https://logo2.png' }

	it('retourne team1 avec les bons champs', () => {
		const { team1: result } = service.extractTeams(makeData(team1, team2))
		expect(result).toEqual({ id: 1, name: 'Team Liquid', acronym: 'TL', logo: 'https://logo1.png' })
	})

	it('retourne team2 avec les bons champs', () => {
		const { team2: result } = service.extractTeams(makeData(team1, team2))
		expect(result).toEqual({ id: 2, name: 'Cloud9', acronym: 'C9', logo: 'https://logo2.png' })
	})

	it('mappe image_url vers logo', () => {
		const { team1: t1, team2: t2 } = service.extractTeams(makeData(team1, team2))
		expect(t1.logo).toBe('https://logo1.png')
		expect(t2.logo).toBe('https://logo2.png')
	})

	it('retourne la structure complète attendue', () => {
		const result = service.extractTeams(makeData(team1, team2))
		expect(result).toEqual({
			team1: { id: 1, name: 'Team Liquid', acronym: 'TL', logo: 'https://logo1.png' },
			team2: { id: 2, name: 'Cloud9',      acronym: 'C9', logo: 'https://logo2.png' },
		})
	})

	it('respecte l\'ordre des opponents (team1 = index 0, team2 = index 1)', () => {
		const { team1: t1, team2: t2 } = service.extractTeams(makeData(team1, team2))
		expect(t1.id).toBe(1)
		expect(t2.id).toBe(2)
	})

	it('fonctionne avec des valeurs nullables (logo null)', () => {
		const t1 = { ...team1, image_url: null }
		const { team1: result } = service.extractTeams(makeData(t1, team2))
		expect(result.logo).toBeNull()
	})
})