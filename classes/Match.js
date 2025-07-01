import axios from 'axios'
import { TOKEN_API } from '../utils/constants.utils.js'

export class Match {
	constructor (game) {
		this.game = game
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

			allMatches.push(...response.data)

			const linkHeader = response.headers.link
			if (linkHeader && linkHeader.includes('rel="next"')) {
				console.log(`Page ${pageNumber} récupérée, passage à la suivante...`)
				return this.#getMatches(startDate, endDate, pageNumber + 1, allMatches)
			} else {
				console.log('Tous les matchs ont été récupérés.')
				return allMatches
			}
		} catch (error) {
			console.error('Erreur lors de la requête:', error.response ? error.response.data : error.message)
		}
	}

	#generateDates = () =>{
		const today = new Date() 
		const futureDate = new Date(today)

		futureDate.setDate(today.getDate() + 14)

		const formattedToday = today.toISOString() 
		const formattedFutureDate = futureDate.toISOString()

		return {
			today: formattedToday,
			futureDate: formattedFutureDate
		}
	}
	
	createdMatch = async () => {
		const { today, futureDate } = this.#generateDates()

		const responseData = await this.#getMatches(today, futureDate)
		const matches = responseData.map((data) => {
			const idMatch = data.id.toString()
			const numberOfGame = data.number_of_games.toString()
			const date = this.#formatedDate(data.begin_at)
			const gameName = this.#formatLeagueName(data.videogame.slug)
			const leagueName = data.league.name
			const reschulded = data.rescheduled
			const streamPlatform = data.streams_list.map((streamItem) =>
				streamItem.main === true ? streamItem.raw_url : null
			)
			
			const getTeamData = (field) =>
				data.opponents.map((opponent) => opponent.opponent[field]) || []

			const [team1Name, team2Name] = getTeamData('name')
			const [team1Acronym, team2Acronym] = getTeamData('acronym')
			const [team1Logo, team2Logo] = getTeamData('image_url')
			const filterStreamPlatform = streamPlatform.filter((streamItem) => streamItem !== null)	
			const isEmptyData = [
				idMatch,
				date,
				filterStreamPlatform,
				reschulded,
				numberOfGame,
				gameName,
				leagueName,
				team1Name,
				team2Name,
				team1Acronym,
				team2Acronym,
			].some((field) => this.#checkedData(field))

			if (isEmptyData) {
				return null
			}

			return {
				idMatch,
				date,
				streamPlatform: filterStreamPlatform,
				numberOfGame,
				leagueName,
				gameName,
				reschulded,
				team1: {
					name: team1Name,
					acronym: team1Acronym,
					logoUrl: team1Logo,
				},

				team2: {
					name: team2Name,
					acronym: team2Acronym,
					logoUrl: team2Logo,
				},
			}
		})

		return matches.filter((item) => item !== null)
	}

	processMatches = async (matches, recoveryMatchesInstance) => {
		for (const match of matches) {
			const isVerifyLolMatch = await recoveryMatchesInstance.verifyMatchIsPresent(match)
			if (isVerifyLolMatch) {
				console.error(`Match found ${match.idMatch}`)
			} else {
				const team1 = await recoveryMatchesInstance.insertTeam(match.team1)
				const team2 = await recoveryMatchesInstance.insertTeam(match.team2)

				const updateMatch = { ...match, team1: team1, team2: team2 }
				await recoveryMatchesInstance.insertMatch(updateMatch)
			}
		}
	}
}

