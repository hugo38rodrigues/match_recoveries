import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Match } from '../../../classes/Match'
 
 
describe('processMatches()', () => {
	let match
	
	beforeEach(()=> {
		vi.clearAllMocks()
		match = new Match('LoL')
	})

	const makeMatch = (id = '1') => ({
		leagueName: 'LCS',
		gameName: 'LoL',
		team1: { id: `t1-${id}`, name: 'Team A' },
		team2: { id: `t2-${id}`, name: 'Team B' },
		idMatch: id,
	})
 
	const makeRepository = () => ({
		insertLeague: vi.fn().mockResolvedValue('league-id'),
		insertGame: vi.fn().mockResolvedValue('game-id'),
		insertTeam: vi.fn().mockResolvedValue('team-id'),
		insertMatch: vi.fn().mockResolvedValue(undefined),
	})
 
	it('ne fait aucun appel repository pour un tableau vide', async () => {
		const repo = makeRepository()
		await match.processMatches([], repo)
		expect(repo.insertLeague).not.toHaveBeenCalled()
		expect(repo.insertMatch).not.toHaveBeenCalled()
	})
 
	it('appelle insertLeague, insertGame et insertTeam en parallèle', async () => {
		const repo = makeRepository()
		await match.processMatches([makeMatch()], repo)
 
		expect(repo.insertLeague).toHaveBeenCalledWith('LCS')
		expect(repo.insertGame).toHaveBeenCalledWith('LoL')
		expect(repo.insertTeam).toHaveBeenCalledTimes(2)
	})
 
	it('appelle insertMatch avec les ids résolus', async () => {
		const repo = makeRepository()
		repo.insertLeague.mockResolvedValue('resolved-league')
		repo.insertGame.mockResolvedValue('resolved-game')
		repo.insertTeam.mockResolvedValueOnce('resolved-t1').mockResolvedValueOnce('resolved-t2')
 
		const m = makeMatch()
		await match.processMatches([m], repo)
 
		expect(repo.insertMatch).toHaveBeenCalledWith({
			...m,
			leagueId: 'resolved-league',
			gameId: 'resolved-game',
			team1: 'resolved-t1',
			team2: 'resolved-t2',
		})
	})
 
	it('traite plusieurs matchs séquentiellement', async () => {
		const repo = makeRepository()
		const matches = [makeMatch('1'), makeMatch('2'), makeMatch('3')]
		await match.processMatches(matches, repo)
 
		expect(repo.insertMatch).toHaveBeenCalledTimes(3)
	})
 
	it('propage l\'erreur si insertLeague échoue', async () => {
		const repo = makeRepository()
		repo.insertLeague.mockRejectedValue(new Error('DB error'))
 
		await expect(match.processMatches([makeMatch()], repo)).rejects.toThrow('DB error')
	})
 
	it('propage l\'erreur si insertMatch échoue', async () => {
		const repo = makeRepository()
		repo.insertMatch.mockRejectedValue(new Error('Insert failed'))
 
		await expect(match.processMatches([makeMatch()], repo)).rejects.toThrow('Insert failed')
	})
})