import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiService } from '../../../classes/services/Api.service.js'


const { makeLogger } = vi.hoisted(() => ({
	makeLogger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn()
	},
}))

const makeResponse = (data, linkHeader = null) => ({
	data,
	headers: { link: linkHeader },
})

vi.mock('axios')
vi.mock('../../../utils/constants.utils.js', () => ({ TOKEN_API: 'test-token' }))
vi.mock('../../../utils/logger.js', () => ({ logger: makeLogger }))

describe('getLastWinnerSeries()', () => {
	let service

	beforeEach(() => {
		vi.clearAllMocks()
		service = new ApiService('lol')
	})

	it('appelle l\'API avec les bons paramètres', async () => {
		axios.get.mockResolvedValue(makeResponse([]))

		await service.getLastWinnerSeries()

		expect(axios.get).toHaveBeenCalledWith(
			'https://api.pandascore.co/lol/series/past',
			expect.objectContaining({
				params: expect.objectContaining({
					'page[size]': 100,
					'page[number]': 1,
					token: 'test-token',
				}),
			})
		)
	})

	it('retourne les winner_id non nuls de la première page', async () => {
		axios.get.mockResolvedValue(
			makeResponse([{ winner_id: 1 }, { winner_id: null }, { winner_id: 3 }])
		)

		const result = await service.getLastWinnerSeries()

		expect(result).toEqual([1, 3])
	})

	it('log info quand tous les gagnants ont été récupérés', async () => {
		axios.get.mockResolvedValue(makeResponse([{ winner_id: 1 }]))

		await service.getLastWinnerSeries()

		expect(makeLogger.info).toHaveBeenCalledWith('Tous les gagnants de lol ont été récupérés.')
	})

	it('log info à chaque changement de page', async () => {
		axios.get
			.mockResolvedValueOnce(makeResponse([{ winner_id: 1 }], '<url>; rel="next"'))
			.mockResolvedValueOnce(makeResponse([{ winner_id: 2 }]))

		await service.getLastWinnerSeries()

		expect(makeLogger.debug).toHaveBeenCalledWith('Page 1 récupérée, passage à la suivante...')
	})

	it('log error.message si axios lève une exception sans response', async () => {
		axios.get.mockRejectedValue(new Error('Network error'))

		await service.getLastWinnerSeries()

		expect(makeLogger.error).toHaveBeenCalledWith(
			'Erreur lors de la requête Last winner:',
			'Network error'
		)
	})

	it('log error.response.data si la réponse d\'erreur existe', async () => {
		axios.get.mockRejectedValue({ response: { data: 'Unauthorized' }, message: 'ignored' })

		await service.getLastWinnerSeries()

		expect(makeLogger.error).toHaveBeenCalledWith(
			'Erreur lors de la requête Last winner:',
			'Unauthorized'
		)
	})

	it('retourne [] et log l\'erreur si response.data est falsy', async () => {
		axios.get.mockResolvedValue(makeResponse(null))

		const result = await service.getLastWinnerSeries()

		expect(result).toEqual([])
		expect(makeLogger.error).toHaveBeenCalledWith('Erreur lors de la récupération des gagnants')
	})
})