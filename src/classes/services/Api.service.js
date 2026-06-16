import axios from 'axios'
import { TOKEN_API } from '../../utils/constants.utils.js'
import { logger } from '../../utils/logger.js'

export class ApiService {
	constructor (game) {
		this.game = game
	}

	async getMatches (startDate, endDate, pageNumber = 1, allMatches = []) {
		try {
			const response = await axios.get(
				`https://api.pandascore.co/${this.game}/matches/upcoming`,
				{
					params: {
						'range[begin_at]': `${startDate},${endDate}`,
						'page[size]': 100,
						'page[number]': pageNumber,
						token: TOKEN_API,
					},
				}
			)

			if (!response.data) {
				logger.error('Erreur lors de la récupération des matchs')
				return []
			}

			allMatches.push(...response.data)

			const hasNextPage = response.headers?.link?.includes('rel="next"')
			if (hasNextPage) {
				logger.info(`Page ${pageNumber} récupérée, passage à la suivante...`)
				return this.getMatches(startDate, endDate, pageNumber + 1, allMatches)
			}

			logger.info(`Tous les matchs ${this.game} ont été récupérés.`)
			return allMatches

		} catch (error) {
			logger.error(
				'Erreur lors de la requête:',
				error.response ? error.response.data : error.message
			)
			return []
		}
	}

	getLastWinnerSeries = async (pageNumber = 1, allWinners = []) => {
		try {
			const response = await axios.get(`https://api.pandascore.co/${this.game}/series/past`, {
				params: {
					'page[size]': 100,
					'page[number]': pageNumber,
					token: TOKEN_API,
				},
			})

			if (!response.data) {
				logger.error('Erreur lors de la récupération des gagnants')
				return []
			}

			const winnersId = response.data
				.filter((tournament) => tournament.winner_id !== null)
				.map((team) => team.winner_id)
			allWinners.push(...winnersId)

			const hasNextPage = response.headers?.link?.includes('rel="next"')
			if (hasNextPage) {
				logger.info(`Page ${pageNumber} récupérée, passage à la suivante...`)
				return this.getLastWinnerSeries(pageNumber + 1, allWinners)
			}

			logger.info(`Tous les gagnants de ${this.game} ont été récupérés.`)
			return allWinners

		} catch (error) {
			logger.error(
				'Erreur lors de la requête Last winner:',
				error.response ? error.response.data : error.message
			)
			return []
		}
	}
}