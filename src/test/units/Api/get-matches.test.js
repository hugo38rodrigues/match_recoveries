import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiService } from '../../../classes/services/Api.service.js'


const { makeLogger } = vi.hoisted(() => ({
	makeLogger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
	},
}))

const makeResponse = (data, linkHeader = null) => ({
	data,
	headers: { link: linkHeader },
})

vi.mock('../../../utils/logger.js', () => ({ logger: makeLogger }))
vi.mock('axios')
vi.mock('../../../utils/constants.utils.js', () => ({ TOKEN_API: 'test-token' }))


describe('getMatches()', () => {
	let service

	beforeEach(() => {
		vi.clearAllMocks()
		service = new ApiService('lol')
	})

	it('appelle l\'API avec les bons paramètres', async () => {
		axios.get.mockResolvedValue(makeResponse([]))

		await service.getMatches('2024-01-01', '2024-01-08')

		expect(axios.get).toHaveBeenCalledWith(
			'https://api.pandascore.co/lol/matches/upcoming',
			expect.objectContaining({
				params: expect.objectContaining({
					'range[begin_at]': '2024-01-01,2024-01-08',
					'page[size]': 100,
					'page[number]': 1,
					token: 'test-token',
				}),
			})
		)
	})

	it('retourne les matchs de la première page', async () => {
		const matches = [{ id: 1 }, { id: 2 }]
		axios.get.mockResolvedValue(makeResponse(matches))

		const result = await service.getMatches('2024-01-01', '2024-01-08')

		expect(result).toEqual(matches)
	})

	it('retourne [] et log l\'erreur si response.data est falsy', async () => {
		axios.get.mockResolvedValue(makeResponse(null))

		const result = await service.getMatches('2024-01-01', '2024-01-08')

		expect(result).toEqual([])
		expect(makeLogger.error).toHaveBeenCalledWith('Erreur lors de la récupération des matchs')
	})

	it('pagine et concatène les résultats si rel="next" est présent', async () => {
		axios.get
			.mockResolvedValueOnce(makeResponse([{ id: 1 }], '<url>; rel="next"'))
			.mockResolvedValueOnce(makeResponse([{ id: 2 }]))

		const result = await service.getMatches('2024-01-01', '2024-01-08')

		expect(axios.get).toHaveBeenCalledTimes(2)
		expect(result).toEqual([{ id: 1 }, { id: 2 }])
	})

	it('appelle la page suivante avec pageNumber incrémenté', async () => {
		axios.get
			.mockResolvedValueOnce(makeResponse([{ id: 1 }], '<url>; rel="next"'))
			.mockResolvedValueOnce(makeResponse([{ id: 2 }]))

		await service.getMatches('2024-01-01', '2024-01-08')

		expect(axios.get).toHaveBeenNthCalledWith(2,
			expect.any(String),
			expect.objectContaining({ params: expect.objectContaining({ 'page[number]': 2 }) })
		)
	})

	it('log info quand tous les matchs ont été récupérés', async () => {
		axios.get.mockResolvedValue(makeResponse([{ id: 1 }]))

		await service.getMatches('2024-01-01', '2024-01-08')

		expect(makeLogger.info).toHaveBeenCalledWith('Tous les matchs lol ont été récupérés.')
	})

	it('log info à chaque changement de page', async () => {
		axios.get
			.mockResolvedValueOnce(makeResponse([{ id: 1 }], '<url>; rel="next"'))
			.mockResolvedValueOnce(makeResponse([{ id: 2 }]))

		await service.getMatches('2024-01-01', '2024-01-08')

		expect(makeLogger.info).toHaveBeenCalledWith('Page 1 récupérée, passage à la suivante...')
	})

	it('retourne [] et log error.message si axios lève une exception sans response', async () => {
		axios.get.mockRejectedValue(new Error('Network error'))

		const result = await service.getMatches('2024-01-01', '2024-01-08')

		expect(result).toEqual([])
		expect(makeLogger.error).toHaveBeenCalledWith('Erreur lors de la requête:', 'Network error')
	})

	it('log error.response.data si la réponse d\'erreur existe', async () => {
		axios.get.mockRejectedValue({ response: { data: 'Bad Request' }, message: 'ignored' })

		await service.getMatches('2024-01-01', '2024-01-08')

		expect(makeLogger.error).toHaveBeenCalledWith('Erreur lors de la requête:', 'Bad Request')
	})

	it('pagine sur 3 pages et retourne tous les résultats', async () => {
		axios.get
			.mockResolvedValueOnce(makeResponse([{ id: 1 }], '<url>; rel="next"'))
			.mockResolvedValueOnce(makeResponse([{ id: 2 }], '<url>; rel="next"'))
			.mockResolvedValueOnce(makeResponse([{ id: 3 }]))

		const result = await service.getMatches('2024-01-01', '2024-01-08')

		expect(axios.get).toHaveBeenCalledTimes(3)
		expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
	})
})