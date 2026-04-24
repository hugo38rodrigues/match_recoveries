import { HypeScore } from './HypeScore.js'
import Logger from './logger.js'
import { ApiService } from './services/Api.service.js'
import { DataExtractionService } from './services/DataExtraction.service.js'
import { FormattingService } from './services/Formatting.service.js'
import { ValidationService } from './services/Validation.service.js'

export class Match {
	constructor (game) {
		this.game = game
		this.logger = new Logger()
		this.hypeScore = new HypeScore(game)
		this.validation = new ValidationService()
		this.formatting = new FormattingService()
		this.extraction = new DataExtractionService(this.formatting)
		this.api = new ApiService(game, this.logger)
	}

	async createdMatch () {
		const { today, futureDate } = this.formatting.generateDateRange()
		const [rawMatches, lastWinner] = await Promise.all([
			this.api.getMatches(today, futureDate),
			this.hypeScore.getLastWinnerSeries(),
		])

		const matches = await Promise.all(
			rawMatches.map((data) => this.#buildMatchFromRawData(data, lastWinner))
		)

		return matches.filter(Boolean)
	}

	#buildMatchFromRawData (data, lastWinner) {
		const base      = this.extraction.extractBaseFields(data)
		const streams   = this.extraction.extractStreamPlatforms(data)
		const { team1, team2 } = this.extraction.extractTeams(data)

		const isInvalid = this.validation.hasEmptyRequiredField({
			...base,
			streamPlatform: streams,
			team1,
			team2,
		})

		if (isInvalid) return null

		const score = this.hypeScore.computeHypeScore(
			base.gameName,
			base.leagueName,
			team1.id,
			team2.id,
			lastWinner
		)

		return {
			idMatch:        base.idMatch,
			date:           base.date,
			numberOfGame:   base.numberOfGame,
			leagueName:     base.leagueName,
			gameName:       base.gameName,
			rescheduled:    base.rescheduled,
			streamPlatform: streams,
			hypeScore: score,
			team1: {
				id:      team1.id,
				name:    team1.name,
				acronym: team1.acronym,
				logoUrl: team1.logo,
			},
			team2: {
				id:      team2.id,
				name:    team2.name,
				acronym: team2.acronym,
				logoUrl: team2.logo,
			},
		}
	}

	async processMatches (matches, repository) {
		for (const match of matches) {
			const [leagueId, gameId, team1, team2] = await Promise.all([
				repository.insertLeague(match.leagueName),
				repository.insertGame(match.gameName),
				repository.insertTeam(match.team1),
				repository.insertTeam(match.team2),
			])

			await repository.insertMatch({ ...match, leagueId, gameId, team1, team2 })
		}
	}
}