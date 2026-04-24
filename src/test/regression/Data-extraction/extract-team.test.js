import { beforeEach, describe, expect, it } from 'vitest'
import { DataExtractionService } from '../../../classes/services/DataExtraction.service'
import { FormattingService } from '../../../classes/services/Formatting.service'

describe('extractTeams()', () => {
	let service

	beforeEach(() => {
		service = new DataExtractionService(new FormattingService())
	})

	it('ne crashe pas avec un seul opponent et retourne undefined pour team2', () => {
		const data = {
			opponents: [
				{ opponent: { id: 1, name: 'Team Liquid', acronym: 'TL', image_url: 'https://logo.png' }},
			],
		}
		// Avec un seul opponent, la déstructuration [id1, id2] donne id2 = undefined
		const result = service.extractTeams(data)
		expect(result.team1.id).toBe(1)
		expect(result.team2.id).toBeUndefined()
	})

	it('ne crashe pas avec un tableau opponents vide', () => {
		const data = { opponents: [] }
		const result = service.extractTeams(data)
		expect(result.team1.id).toBeUndefined()
		expect(result.team2.id).toBeUndefined()
	})

	it('ne crashe pas avec plus de 2 opponents (ignore les suivants)', () => {
		const data = {
			opponents: [
				{ opponent: { id: 1, name: 'T1', acronym: 'T1', image_url: 'https://a.png' }},
				{ opponent: { id: 2, name: 'T2', acronym: 'T2', image_url: 'https://b.png' }},
				{ opponent: { id: 3, name: 'T3', acronym: 'T3', image_url: 'https://c.png' }},
			],
		}
		const result = service.extractTeams(data)
		expect(result.team1.id).toBe(1)
		expect(result.team2.id).toBe(2)
	})
})