import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HypeScore } from '../../../classes/HypeScore.js'
import { Match } from '../../../classes/Match.js'
import { ApiService } from '../../../classes/services/Api.service.js'
import { DataExtractionService } from '../../../classes/services/DataExtraction.service.js'
import { FormattingService } from '../../../classes/services/Formatting.service.js'
import { ValidationService } from '../../../classes/services/Validation.service.js'
import { makeBaseFields, makeTeam } from './utils.js'

vi.mock('../../../classes/HypeScore.js', () => ({
	HypeScore: vi.fn(),
}))

vi.mock('../../../classes/services/Api.service.js', () => ({
	ApiService: vi.fn(),
}))

vi.mock('../../../classes/services/DataExtraction.service.js', () => ({
	DataExtractionService: vi.fn(),
}))

vi.mock('../../../classes/services/Formatting.service.js', () => ({
	FormattingService: vi.fn(),
}))

vi.mock('../../../classes/services/Validation.service.js', () => ({
	ValidationService: vi.fn(),
}))


describe('Match.js', () => {

	let mockApi
	let mockHype
	let mockExtraction
	let mockValidation
	let mockFormatting

	let match

	beforeEach(() => {
		vi.clearAllMocks()

		mockApi = {
			getMatches: vi.fn().mockResolvedValue([]),
			getLastWinnerSeries: vi.fn().mockResolvedValue('team-winner-id'),
		}
		mockHype = {
			computeHypeScore: vi.fn().mockReturnValue(42),
		}
		mockExtraction = {
			extractBaseFields: vi.fn(),
			extractStreamPlatforms: vi.fn(),
			extractTeams: vi.fn(),
		}
		mockValidation = {
			hasEmptyRequiredField: vi.fn().mockReturnValue(false),
		}
		mockFormatting = {
			generateDateRange: vi.fn().mockReturnValue({ today: '2024-01-01', futureDate: '2024-01-08' }),
		}

		// Vitest exige mockImplementation avec une fonction normale (pas arrow)
		// quand le mock est appelé avec `new`
		HypeScore.mockImplementation(function () { return mockHype })
		ApiService.mockImplementation(function () { return mockApi })
		DataExtractionService.mockImplementation(function () { return mockExtraction })
		ValidationService.mockImplementation(function () { return mockValidation })
		FormattingService.mockImplementation(function () { return mockFormatting })

		match = new Match('LoL')
	})

	// -----------------------------------------------------------------------
	// constructor
	// -----------------------------------------------------------------------

	describe('constructor', () => {
		it('instancie HypeScore avec le bon game', () => {
			expect(HypeScore).toHaveBeenCalledWith('LoL')
		})

		it('instancie ApiService avec le bon game', () => {
			expect(ApiService).toHaveBeenCalledWith('LoL', expect.anything())
		})
	})
	describe('createdMatch()', () => {
		it('retourne un tableau vide si aucun match brut', async () => {
			const result = await match.createdMatch()
			expect(result).toEqual([])
		})

		it('appelle getMatches avec la plage de dates correcte', async () => {
			await match.createdMatch()
			expect(mockFormatting.generateDateRange).toHaveBeenCalledOnce()
			expect(mockApi.getMatches).toHaveBeenCalledWith('2024-01-01', '2024-01-08')
		})

		it('appelle getLastWinnerSeries en parallèle de getMatches', async () => {
			await match.createdMatch()
			expect(mockApi.getLastWinnerSeries).toHaveBeenCalledOnce()
		})

		it('retourne les matchs valides construits', async () => {
			mockApi.getMatches.mockResolvedValue([{ id: 1 }, { id: 2 }])
			mockExtraction.extractBaseFields.mockReturnValue(makeBaseFields())
			mockExtraction.extractStreamPlatforms.mockReturnValue(['twitch'])
			mockExtraction.extractTeams.mockReturnValue({ team1: makeTeam(1), team2: makeTeam(2) })
			mockValidation.hasEmptyRequiredField.mockReturnValue(false)

			const result = await match.createdMatch()

			expect(result).toHaveLength(2)
			expect(result[0]).toMatchObject({ idMatch: 'match-1', leagueName: 'LCS' })
		})

		it('filtre les matchs invalides (null)', async () => {
			mockApi.getMatches.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }])
			mockExtraction.extractBaseFields.mockReturnValue(makeBaseFields())
			mockExtraction.extractStreamPlatforms.mockReturnValue(['twitch'])
			mockExtraction.extractTeams.mockReturnValue({ team1: makeTeam(1), team2: makeTeam(2) })

			mockValidation.hasEmptyRequiredField
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(true)
				.mockReturnValueOnce(false)

			const result = await match.createdMatch()
			expect(result).toHaveLength(2)
		})

		it('propage l\'erreur si getMatches échoue', async () => {
			mockApi.getMatches.mockRejectedValue(new Error('API down'))
			await expect(match.createdMatch()).rejects.toThrow('API down')
		})

		it('propage l\'erreur si getLastWinnerSeries échoue', async () => {
			mockApi.getLastWinnerSeries.mockRejectedValue(new Error('Hype error'))
			await expect(match.createdMatch()).rejects.toThrow('Hype error')
		})})

 
	describe('#buildMatchFromRawData (via createdMatch)', () => {
		beforeEach(() => {
			mockExtraction.extractBaseFields.mockReturnValue(makeBaseFields())
			mockExtraction.extractStreamPlatforms.mockReturnValue(['twitch', 'youtube'])
			mockExtraction.extractTeams.mockReturnValue({ team1: makeTeam(1), team2: makeTeam(2) })
			mockValidation.hasEmptyRequiredField.mockReturnValue(false)
			mockHype.computeHypeScore.mockReturnValue(99)
		})
 
		it('retourne null si le champ requis est vide', async () => {
			mockApi.getMatches.mockResolvedValue([{ id: 1 }])
			mockValidation.hasEmptyRequiredField.mockReturnValue(true)
 
			const result = await match.createdMatch()
			expect(result).toEqual([])
		})
 
		it('construit le match avec la structure attendue', async () => {
			mockApi.getMatches.mockResolvedValue([{ id: 1 }])
 
			const [built] = await match.createdMatch()
 
			expect(built).toEqual({
				idMatch: 'match-1',
				date: '2024-01-05',
				numberOfGame: 3,
				leagueName: 'LCS',
				gameName: 'LoL',
				rescheduled: false,
				streamPlatform: ['twitch', 'youtube'],
				hypeScore: 99,
				team1: { id: 'team-1', name: 'Team 1', acronym: 'T1', logoUrl: 'https://logo1.png' },
				team2: { id: 'team-2', name: 'Team 2', acronym: 'T2', logoUrl: 'https://logo2.png' },
			})
		})
 
		it('appelle computeHypeScore avec les bons arguments', async () => {
			mockApi.getMatches.mockResolvedValue([{ id: 1 }])
			mockApi.getLastWinnerSeries.mockResolvedValue('winner-42')
 
			await match.createdMatch()
 
			expect(mockHype.computeHypeScore).toHaveBeenCalledWith(
				'LoL', 'LCS', 'team-1', 'team-2', 'winner-42'
			)
		})
 
		it('mappe correctement logoUrl depuis logo', async () => {
			mockApi.getMatches.mockResolvedValue([{ id: 1 }])
			const [built] = await match.createdMatch()
 
			expect(built.team1.logoUrl).toBe('https://logo1.png')
			expect(built.team2.logoUrl).toBe('https://logo2.png')
		})
 
		it('passe streamPlatform complet à la validation', async () => {
			mockApi.getMatches.mockResolvedValue([{ id: 1 }])
			await match.createdMatch()
 
			expect(mockValidation.hasEmptyRequiredField).toHaveBeenCalledWith(
				expect.objectContaining({ streamPlatform: ['twitch', 'youtube'] })
			)
		})
	})
})