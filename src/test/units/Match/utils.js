export const makeBaseFields = (overrides = {}) => ({
	idMatch: 'match-1',
	date: '2024-01-05',
	numberOfGame: 3,
	leagueName: 'LCS',
	gameName: 'LoL',
	rescheduled: false,
	...overrides,
})
 
export const makeTeam = (n) => ({
	id: `team-${n}`,
	name: `Team ${n}`,
	acronym: `T${n}`,
	logo: `https://logo${n}.png`,
})
 