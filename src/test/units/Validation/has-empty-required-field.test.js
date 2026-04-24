import { beforeEach, describe, expect, it } from 'vitest'
import { ValidationService } from '../../../classes/services/Validation.service.js'

describe('hasEmptyRequiredField()', () => {
	let service

	beforeEach(() => {
		service = new ValidationService()
	})

	// --- Valeurs scalaires vides ---

	it('retourne true si un champ est null', () => {
		expect(service.hasEmptyRequiredField({ name: null })).toBe(true)
	})

	it('retourne true si un champ est une chaîne vide', () => {
		expect(service.hasEmptyRequiredField({ name: '' })).toBe(true)
	})

	it('retourne true si un champ est undefined', () => {
		expect(service.hasEmptyRequiredField({ name: undefined })).toBe(true)
	})

	// --- Tableaux ---

	it('retourne true si un champ tableau est vide', () => {
		expect(service.hasEmptyRequiredField({ streams: [] })).toBe(true)
	})

	it('retourne false si un champ tableau est non vide', () => {
		expect(service.hasEmptyRequiredField({ streams: ['https://twitch.tv'] })).toBe(false)
	})

	// --- Objets imbriqués ---

	it('retourne true si une valeur dans un objet imbriqué est null', () => {
		expect(service.hasEmptyRequiredField({ team: { id: null, name: 'T1' }})).toBe(true)
	})

	it('retourne true si une valeur dans un objet imbriqué est une chaîne vide', () => {
		expect(service.hasEmptyRequiredField({ team: { id: 1, name: '' }})).toBe(true)
	})

	it('retourne true si une valeur dans un objet imbriqué est undefined', () => {
		expect(service.hasEmptyRequiredField({ team: { id: 1, name: undefined }})).toBe(true)
	})

	it('retourne false si toutes les valeurs d\'un objet imbriqué sont valides', () => {
		expect(service.hasEmptyRequiredField({ team: { id: 1, name: 'T1' }})).toBe(false)
	})

	// --- Cas valides ---

	it('retourne false si tous les champs scalaires sont valides', () => {
		expect(service.hasEmptyRequiredField({ id: '1', name: 'LCS', rescheduled: false })).toBe(false)
	})

	it('retourne false pour 0 (valeur falsy non vide)', () => {
		expect(service.hasEmptyRequiredField({ count: 0 })).toBe(false)
	})

	it('retourne false pour false (valeur falsy non vide)', () => {
		expect(service.hasEmptyRequiredField({ rescheduled: false })).toBe(false)
	})

	// --- Cas mixtes ---

	it('retourne true si un seul champ parmi plusieurs est invalide', () => {
		expect(service.hasEmptyRequiredField({
			id: '1',
			name: 'LCS',
			stream: null,
		})).toBe(true)
	})

	it('retourne false pour un objet complet valide (structure match)', () => {
		expect(service.hasEmptyRequiredField({
			idMatch:        '42',
			leagueName:     'LCS',
			gameName:       'League of Legends',
			rescheduled:    false,
			streamPlatform: ['https://twitch.tv/lcs'],
			team1:          { id: 1, name: 'Team Liquid', acronym: 'TL', logo: 'https://logo.png' },
			team2:          { id: 2, name: 'Cloud9',      acronym: 'C9', logo: 'https://logo2.png' },
		})).toBe(false)
	})

	it('retourne true si team1 a un champ vide dans une structure match complète', () => {
		expect(service.hasEmptyRequiredField({
			idMatch:        '42',
			leagueName:     'LCS',
			gameName:       'League of Legends',
			rescheduled:    false,
			streamPlatform: ['https://twitch.tv/lcs'],
			team1:          { id: null, name: 'Team Liquid', acronym: 'TL', logo: 'https://logo.png' },
			team2:          { id: 2,    name: 'Cloud9',      acronym: 'C9', logo: 'https://logo2.png' },
		})).toBe(true)
	})

	// --- Objet vide ---

	it('retourne false pour un objet fields vide', () => {
		expect(service.hasEmptyRequiredField({})).toBe(false)
	})
})