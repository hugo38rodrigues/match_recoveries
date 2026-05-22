import { gamesHype, leaguesHype } from '../utils/hype-data.utils.js'
import Logger from './logger.js'

export class HypeScore {
	constructor (game) {
		this.logger = new Logger()
	}

	computeHypeScore = (gameName, leagueName, team1Id, team2Id, lastWinner) => {
		try {
			const gameScoreHype = gamesHype.includes(gameName) ? 1 : 0
			const leagueScoreHype = leaguesHype.includes(leagueName) ? 1 : 0
			const teams1ScoreHype = lastWinner.length === 0 ? 0 : lastWinner.includes(team1Id) ? 1 : 0
			const teams2ScoreHype = lastWinner.length === 0 ? 0 : lastWinner.includes(team2Id) ? 1 : 0

			const hypeScoreTotal = gameScoreHype + leagueScoreHype + teams1ScoreHype + teams2ScoreHype
			return hypeScoreTotal === 4 ? 3 : hypeScoreTotal
		} catch (error) {
			this.logger.error(error)
		}
	}
}