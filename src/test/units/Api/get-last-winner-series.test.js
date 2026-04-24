import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeLogger, makeResponse } from './utils'
import { ApiService } from '../../../classes/services/Api.service'

vi.mock('axios')
vi.mock('../../../utils/constants.utils.js', () => ({ TOKEN_API: 'test-token' }))


describe('getLastWinnerSeries()', () => {
	let service
	let logger

	beforeEach(() => {
		vi.clearAllMocks()
		logger  = makeLogger()
		service = new ApiService('lol', logger)
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

	it('retourne uniquement les winner_id non null', async () => {
		const data = [
			{ winner_id: 10, years: undefined },
			{ winner_id: null, years: undefined },
			{ winner_id: 20, years: undefined },
		]
		axios.get.mockResolvedValue(makeResponse(data))

		const result = await service.getLastWinnerSeries()

		expect(result).toEqual([10, 20])
	})

	it('retourne [] si aucun winner_id valide', async () => {
		axios.get.mockResolvedValue(makeResponse([{ winner_id: null }, { winner_id: null }]))

		const result = await service.getLastWinnerSeries()

		expect(result).toEqual([])
	})

	it('pagine si rel="next" est présent et concatène les résultats', async () => {
		axios.get
			.mockResolvedValueOnce(makeResponse([{ winner_id: 1, years: undefined }], '<url>; rel="next"'))
			.mockResolvedValueOnce(makeResponse([{ winner_id: 2, years: undefined }]))

		const result = await service.getLastWinnerSeries()

		expect(axios.get).toHaveBeenCalledTimes(2)
		expect(result).toEqual([1, 2])
	})

	it('appelle la page suivante avec pageNumber incrémenté', async () => {
		axios.get
			.mockResolvedValueOnce(makeResponse([{ winner_id: 1, years: undefined }], '<url>; rel="next"'))
			.mockResolvedValueOnce(makeResponse([]))

		await service.getLastWinnerSeries()

		expect(axios.get).toHaveBeenNthCalledWith(2,
			expect.any(String),
			expect.objectContaining({ params: expect.objectContaining({ 'page[number]': 2 }) })
		)
	})

	it('log info quand tous les gagnants ont été récupérés', async () => {
		axios.get.mockResolvedValue(makeResponse([]))

		await service.getLastWinnerSeries()

		expect(logger.info).toHaveBeenCalledWith('Tous les gagnants de lol ont été récupérés.')
	})

	it('log info à chaque changement de page', async () => {
		axios.get
			.mockResolvedValueOnce(makeResponse([{ winner_id: 1, years: undefined }], '<url>; rel="next"'))
			.mockResolvedValueOnce(makeResponse([]))

		await service.getLastWinnerSeries()

		expect(logger.info).toHaveBeenCalledWith('Page 1 récupérée, passage à la suivante...')
	})

	it('log error.message si axios lève une exception sans response', async () => {
		axios.get.mockRejectedValue(new Error('Network error'))

		await service.getLastWinnerSeries()

		expect(logger.error).toHaveBeenCalledWith(
			'Erreur lors de la requête Last winner:',
			'Network error'
		)
	})

	it('log error.response.data si la réponse d\'erreur existe', async () => {
		axios.get.mockRejectedValue({ response: { data: 'Unauthorized' }, message: 'ignored' })

		await service.getLastWinnerSeries()

		expect(logger.error).toHaveBeenCalledWith(
			'Erreur lors de la requête Last winner:',
			'Unauthorized'
		)
	})

	it('retourne [] et log l\'erreur si response.data est falsy', async () => {
		axios.get.mockResolvedValue(makeResponse(null))

		const result = await service.getLastWinnerSeries()

		expect(result).toEqual([])
		expect(logger.error).toHaveBeenCalledWith('Erreur lors de la récupération des gagnant')
	})
})