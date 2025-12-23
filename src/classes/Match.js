import axios from 'axios'
import { TOKEN_API } from '../utils/constants.utils.js'
import { HypeScore } from './HypeScore.js'
import Logger from './logger.js'

export class Match {
	constructor (game) {
		this.game = game
		this.hypeScore = new HypeScore(game)
		this.logger = new Logger()
	}

	#checkedData = (value) => {
		return value === null || value === '' || value === undefined
	}

	#formatedDate = (date) => {
		const curentYears = new Date().getFullYear()
		const dateObject = new Date(date)
		if (dateObject.getFullYear() === curentYears) {
			return dateObject
		} else {
			return null
		}
	}

	#formatLeagueName = (name) => {
		return name.replace(/-/g, ' ').replace(/^./, (char) => char.toUpperCase())
	}

	#getMatches = async (startDate, endDate, pageNumber = 1, allMatches = []) => {
			
		try {
			const response = await axios.get(`https://api.pandascore.co/${this.game}/matches/upcoming`, {
				params: {
					'range[begin_at]': `${startDate},${endDate}`,
					'page[size]': 100,
					'page[number]': pageNumber,
					token: TOKEN_API,
				},
			})
			if (!response.data){
				this.logger.error("Erreur lors de la récupération des matchs",response.data.length)
				return 
			}

			allMatches.push(...response.data)

			const linkHeader = response.headers.link
			if (linkHeader && linkHeader.includes('rel="next"')) {
				this.logger.info(`Page ${pageNumber} récupérée, passage à la suivante...`)
				return this.#getMatches(startDate, endDate, pageNumber + 1, allMatches)
			} else {
				this.logger.info(`Tous les matchs ${this.game} ont été récupérés.`)
				return allMatches
			}
		} catch (error) {
			this.logger.error(
				'Erreur lors de la requête:',
				error.response ? error.response.data : error.message
			)
		}
	}

	#generateDates = () => {
		const today = new Date()
		const futureDate = new Date(today)

		futureDate.setDate(today.getDate() + 14)

		const formattedToday = today.toISOString()
		const formattedFutureDate = futureDate.toISOString()

		return {
			today: formattedToday,
			futureDate: formattedFutureDate,
		}
	}

	createdMatch = async () => {
		const { today, futureDate } = this.#generateDates()

		const responseData = await this.#getMatches(today, futureDate)
		const lastWinner = await this.hypeScore.getLastWinnerSeries()

		const matches = await Promise.all(
			responseData.map((data) => this.#createMatchFromRawData(data, lastWinner))
		)

		// Filtrage après résolution
		return matches.filter(Boolean)
	}

	/**
	 * 1. Orchestration : transforme une entrée "brute" en objet match
	 */
	#createMatchFromRawData = async (data, lastWinner) => {
		const baseFields = this.#extractBaseFields(data)
		const streamPlatform = this.#extractStreamPlatforms(data)
		const teams = this.#extractTeams(data)

		const filterStreamPlatform = streamPlatform.filter(Boolean)

		const hypeScore = this.hypeScore.computeHypeScore(
			baseFields.gameName,
			baseFields.leagueName,
			teams.team1.id,
			teams.team2.id,
			lastWinner
		)

		const hasEmptyRequiredField = this.#hasEmptyRequiredField({
			...baseFields,
			streamPlatform: filterStreamPlatform,
			team1: teams.team1,
			team2: teams.team2,
		})

		if (hasEmptyRequiredField) {
			return null
		}

		return {
			idMatch: baseFields.idMatch,
			date: baseFields.date,
			streamPlatform: filterStreamPlatform,
			numberOfGame: baseFields.numberOfGame,
			leagueName: baseFields.leagueName,
			gameName: baseFields.gameName,
			reschulded: baseFields.reschulded,
			hypeScore,
			team1: {
				id: teams.team1.id,
				name: teams.team1.name,
				acronym: teams.team1.acronym,
				logoUrl: teams.team1.logo,
			},
			team2: {
				id: teams.team2.id,
				name: teams.team2.name,
				acronym: teams.team2.acronym,
				logoUrl: teams.team2.logo,
			},
		}
	}

	/**
	 * 2. Extraction des champs "simples"
	 */
	#extractBaseFields = (data) => {
		const idMatch = data.id.toString()
		const numberOfGame = data.number_of_games.toString()
		const date = this.#formatedDate(data.begin_at)
		const gameName = this.#formatLeagueName(data.videogame.slug)
		const leagueName = data.league.name
		const reschulded = data.rescheduled

		return {
			idMatch,
			numberOfGame,
			date,
			gameName,
			leagueName,
			reschulded,
		}
	}

	/**
	 * 3. Extraction des streams
	 */
	#extractStreamPlatforms = (data) => {
		return data.streams_list.map((streamItem) =>
			streamItem.main === true ? streamItem.raw_url : null
		)
	}

	/**
	 * 4. Extraction des équipes
	 */
	#extractTeams = (data) => {
		const getTeamData = (field) =>
			data.opponents.map((opponent) => opponent.opponent[field]) || []

		const [team1Id, team2Id] = getTeamData('id')
		const [team1Name, team2Name] = getTeamData('name')
		const [team1Acronym, team2Acronym] = getTeamData('acronym')
		const [team1Logo, team2Logo] = getTeamData('image_url')

		return {
			team1: {
				id: team1Id,
				name: team1Name,
				acronym: team1Acronym,
				logo: team1Logo,
			},
			team2: {
				id: team2Id,
				name: team2Name,
				acronym: team2Acronym,
				logo: team2Logo,
			},
		}
	}

	/**
	 * 5. Validation des données requises
	 */
	#hasEmptyRequiredField = ({ idMatch, date, streamPlatform, reschulded, numberOfGame, gameName, leagueName, team1, team2 }) => {
		const fieldsToCheck = [
			idMatch,
			date,
			streamPlatform,
			reschulded,
			numberOfGame,
			gameName,
			leagueName,
			team1.id,
			team2.id,
			team1.name,
			team2.name,
			team1.acronym,
			team2.acronym,
		]

		return fieldsToCheck.some((field) => this.#checkedData(field))
	}


	processMatches = async (matches, recoveryMatchRepository) => {
		for (const match of matches) {
			const leagueId = await recoveryMatchRepository.insertLeague(match.leagueName)
			const gameId = await recoveryMatchRepository.insertGame(match.gameName)
			const team1 = await recoveryMatchRepository.insertTeam(match.team1)
			const team2 = await recoveryMatchRepository.insertTeam(match.team2)

			const updateMatch = { ...match, team1: team1, team2: team2, leagueId: leagueId, gameId: gameId }
			await recoveryMatchRepository.insertMatch(updateMatch)
		}
	}
	
}

