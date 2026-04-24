import axios from 'axios'
import { TOKEN_API } from '../../utils/constants.utils.js'

export class ApiService {
	constructor (game, logger) {
		this.game = game
		this.logger = logger
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
				this.logger.error('Erreur lors de la récupération des matchs')
				return []
			}

			allMatches.push(...response.data)

			const hasNextPage = response.headers.link?.includes('rel="next"')
			if (hasNextPage) {
				this.logger.info(`Page ${pageNumber} récupérée, passage à la suivante...`)
				return this.getMatches(startDate, endDate, pageNumber + 1, allMatches)
			}

			this.logger.info(`Tous les matchs ${this.game} ont été récupérés.`)
			return allMatches

		} catch (error) {
			this.logger.error(
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
			
			if (!response.data){
				this.logger.error('Erreur lors de la récupération des gagnant')
				return []
			}

			const winnersId = response.data
				.filter((tournament) => tournament.winner_id !== null && tournament.years === this.years)
				.map((team) => team.winner_id)
			allWinners.push(...winnersId)

			const linkHeader = response.headers.link
			if (linkHeader && linkHeader.includes('rel="next"')) {
				this.logger.info(`Page ${pageNumber} récupérée, passage à la suivante...`)
				return this.getLastWinnerSeries(pageNumber + 1, allWinners)
			} else {
				this.logger.info(`Tous les gagnants de ${this.game} ont été récupérés.`)
				return allWinners
			}
		} catch (error) {
			this.logger.error(
				'Erreur lors de la requête Last winner:',
				error.response ? error.response.data : error.message
			)
		}
	}
}