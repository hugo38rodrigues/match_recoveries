export class DataExtractionService {
	constructor (formattingService) {
		this.formatter = formattingService
	}

	extractBaseFields (data) {
		return {
			idMatch: data.id.toString(),
			numberOfGame: data.number_of_games.toString(),
			date: this.formatter.formatDate(data.begin_at),
			gameName: this.formatter.formatSlugToName(data.videogame.slug),
			leagueName: data.league.name,
			rescheduled: data.rescheduled,
		}
	}

	extractStreamPlatforms (data) {
		return data.streams_list
			.filter((stream) => stream.main === true)
			.map((stream) => stream.raw_url)
	}

	extractTeams (data) {
		const pick = (field) => data.opponents.map((o) => o.opponent[field])

		const [id1, id2]           = pick('id')
		const [name1, name2]       = pick('name')
		const [acronym1, acronym2] = pick('acronym')
		const [logo1, logo2]       = pick('image_url')

		return {
			team1: { id: id1, name: name1, acronym: acronym1, logo: logo1 },
			team2: { id: id2, name: name2, acronym: acronym2, logo: logo2 },
		}
	}
}