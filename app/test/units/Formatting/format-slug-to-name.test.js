import { beforeEach, describe, expect, it } from 'vitest'
import { FormattingService } from '../../../classes/services/Formatting.service.js'

describe('formatSlugToName()', () => {
	let service

	beforeEach(() => {
		service = new FormattingService()
	})

	it('remplace les tirets par des espaces', () => {
		expect(service.formatSlugToName('league-of-legends')).toBe('League of legends')
	})

	it('met en majuscule le premier caractère', () => {
		expect(service.formatSlugToName('valorant')).toBe('Valorant')
	})

	it('gère un slug avec plusieurs tirets', () => {
		expect(service.formatSlugToName('counter-strike-2')).toBe('Counter strike 2')
	})

	it('retourne le slug tel quel si pas de tiret', () => {
		expect(service.formatSlugToName('dota2')).toBe('Dota2')
	})

	it('retourne null si le slug est null', () => {
		expect(service.formatSlugToName(null)).toBeNull()
	})

	it('retourne undefined si le slug est undefined', () => {
		expect(service.formatSlugToName(undefined)).toBeUndefined()
	})

	it('retourne une chaîne vide si le slug est une chaîne vide', () => {
		expect(service.formatSlugToName('')).toBe('')
	})

	it('ne modifie pas les caractères après le premier', () => {
		expect(service.formatSlugToName('cs-GO')).toBe('Cs GO')
	})
})