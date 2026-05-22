import { beforeEach, describe, expect, test, vi } from 'vitest'
import { HypeScore } from '../../classes/HypeScore.js'
import { gamesHype, leaguesHype } from '../../utils/hype-data.utils.js'

// On récupère des valeurs réelles depuis les données
const KNOWN_GAME = gamesHype[0]
const KNOWN_LEAGUE = leaguesHype[0]
const UNKNOWN_GAME = '__unknown_game__'
const UNKNOWN_LEAGUE = '__unknown_league__'

describe('HypeScore.js', () => {
	let score

	beforeEach(() => {
		score = new HypeScore()
	})

	// ─── computeHypeScore ────────────────────────────────────────────────────

	describe('computeHypeScore()', () => {

		describe('Score maximum (4 critères → retourne 3)', () => {
			test('Doit retourner 3 quand game, league et les 2 équipes sont hype', () => {
				const hypeScore = score.computeHypeScore(KNOWN_GAME,KNOWN_LEAGUE, 1, 2, [1, 2])
				expect(hypeScore).toEqual(3)
			})
		})

		describe('Score partiel', () => {
			test('Doit retourner 2 quand game + league sont hype mais lastWinner est vide', () => {
				const hypeScore = score.computeHypeScore(KNOWN_GAME,KNOWN_LEAGUE, 1, 2, [])
				expect(hypeScore).toEqual(2)
			})

			test('Doit retourner 3 quand game + league + 1 équipe sont hype', () => {
				const hypeScore = score.computeHypeScore(KNOWN_GAME,KNOWN_LEAGUE, 1, 2, [1])
				expect(hypeScore).toEqual(3)
			})

			test('Doit retourner 1 quand seulement game est hype', () => {
				const hypeScore = score.computeHypeScore(KNOWN_GAME,UNKNOWN_LEAGUE, 1, 2, [])
				expect(hypeScore).toEqual(1)
			})

			test('Doit retourner 1 quand seulement league est hype', () => {
				const unknownScore = new HypeScore()
				const hypeScore = unknownScore.computeHypeScore(UNKNOWN_GAME,KNOWN_LEAGUE, 1, 2, [])
				expect(hypeScore).toEqual(1)
			})
		})

		describe('Score nul', () => {
			test('Doit retourner 0 quand aucun critère n\'est hype', () => {
				const unknownScore = new HypeScore()
				const hypeScore = unknownScore.computeHypeScore(UNKNOWN_GAME,UNKNOWN_LEAGUE, 1, 2, [])
				expect(hypeScore).toEqual(0)
			})
		})

		describe('Cas limites sur lastWinner', () => {
			test('Doit retourner 0 pour les équipes si lastWinner est vide', () => {
				// game inconnue + league inconnue pour isoler les équipes
				const unknownScore = new HypeScore()
				const hypeScore = unknownScore.computeHypeScore(UNKNOWN_GAME,UNKNOWN_LEAGUE, 1, 2, [])
				expect(hypeScore).toEqual(0)
			})

			test('Ne doit compter que team1 si seulement team1 est dans lastWinner', () => {
				const unknownScore = new HypeScore()
				const hypeScore = unknownScore.computeHypeScore(UNKNOWN_GAME,UNKNOWN_LEAGUE, 1, 2, [1])
				expect(hypeScore).toEqual(1)
			})

			test('Ne doit compter que team2 si seulement team2 est dans lastWinner', () => {
				const unknownScore = new HypeScore()
				const hypeScore = unknownScore.computeHypeScore(UNKNOWN_GAME,UNKNOWN_LEAGUE, 1, 2, [2])
				expect(hypeScore).toEqual(1)
			})
		})

		describe('Gestion des erreurs', () => {
			test('Doit appeler logger.error si lastWinner est null', () => {
				score.logger.error = vi.fn()
				score.computeHypeScore(KNOWN_GAME,KNOWN_LEAGUE, 1, 2, null)
				expect(score.logger.error).toHaveBeenCalledOnce()
				expect(score.logger.error).toHaveBeenCalledWith(expect.any(Error))
			})

			test('Doit appeler logger.error si lastWinner est undefined', () => {
				score.logger.error = vi.fn()
				score.computeHypeScore(KNOWN_GAME,KNOWN_LEAGUE, 1, 2, undefined)
				expect(score.logger.error).toHaveBeenCalledOnce()
			})

			test('Ne doit pas throw même en cas d\'erreur', () => {
				expect(() => score.computeHypeScore(KNOWN_GAME,KNOWN_LEAGUE, 1, 2, null)).not.toThrow()
			})
		})
	})
})