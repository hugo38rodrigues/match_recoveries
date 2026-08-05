import { beforeEach, describe, expect, it } from 'vitest'
import { DataExtractionService } from '../../../classes/services/DataExtraction.service.js'

const makeStream = (main, raw_url) => ({ main, raw_url })

describe('extractStreamPlatforms()', () => {
	let service

	beforeEach(() => {
		service = new DataExtractionService({})
	})

	it('retourne les raw_url des streams avec main === true', () => {
		const data = {
			streams_list: [
				makeStream(true,  'https://twitch.tv/lcs'),
				makeStream(false, 'https://youtube.com/lcs'),
			],
		}
		expect(service.extractStreamPlatforms(data)).toEqual(['https://twitch.tv/lcs'])
	})

	it('retourne un tableau vide si aucun stream principal', () => {
		const data = {
			streams_list: [
				makeStream(false, 'https://youtube.com/lcs'),
				makeStream(false, 'https://twitch.tv/lcs'),
			],
		}
		expect(service.extractStreamPlatforms(data)).toEqual([])
	})

	it('retourne un tableau vide si streams_list est vide', () => {
		expect(service.extractStreamPlatforms({ streams_list: [] })).toEqual([])
	})

	it('retourne plusieurs urls si plusieurs streams main === true', () => {
		const data = {
			streams_list: [
				makeStream(true, 'https://twitch.tv/lcs'),
				makeStream(true, 'https://twitch.tv/lcs-fr'),
			],
		}
		expect(service.extractStreamPlatforms(data)).toEqual([
			'https://twitch.tv/lcs',
			'https://twitch.tv/lcs-fr',
		])
	})

	it('exclut strictement les streams avec main !== true', () => {
		const data = {
			streams_list: [
				makeStream(null,      'https://a.com'),
				makeStream(undefined, 'https://b.com'),
				makeStream(1,         'https://c.com'),
				makeStream(true,      'https://d.com'),
			],
		}
		expect(service.extractStreamPlatforms(data)).toEqual(['https://d.com'])
	})
})