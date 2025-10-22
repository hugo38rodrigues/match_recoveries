import axios from 'axios'
import { TOKEN_API } from '../utils/constants.utils.js'
import { getYers } from '../utils/date.js'
import { gamesHype, leaguesHype } from '../utils/hype-data.utils.js'
import Logger from './logger.js'

export class HypeScore {
	constructor (game) {
		this.game = game
		this.years = getYers()
		this.logger = new Logger()
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

	computeHypeScore = (gameName, leagueName, team1Id, team2Id, lastWinner) => {
		try {
			const gameScoreHype = gamesHype.includes(gameName) ? 1 : 0
			const leagueScoreHype = leaguesHype.includes(leagueName) ? 1 : 0
			const teams1ScoreHype = lastWinner.lenght === 0 ? 0 : lastWinner.includes(team1Id) ? 1 : 0
			const teams2ScoreHype = lastWinner.lenght === 0 ? 0 : lastWinner.includes(team2Id) ? 1 : 0

			const hypeScoreTotal = gameScoreHype + leagueScoreHype + teams1ScoreHype + teams2ScoreHype
			return hypeScoreTotal === 4 ? 3 : hypeScoreTotal
		} catch (error) {
			this.logger.error(error)
		}
	}
}