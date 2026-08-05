import { beforeEach, describe, expect, it } from 'vitest'
import { ValidationService } from '../../../classes/services/Validation.service.js'

describe('isEmptyValue()', () => {
	let service

	beforeEach(() => {
		service = new ValidationService()
	})

	it('retourne true pour null', () => {
		expect(service.isEmptyValue(null)).toBe(true)
	})

	it('retourne true pour une chaîne vide', () => {
		expect(service.isEmptyValue('')).toBe(true)
	})

	it('retourne true pour undefined', () => {
		expect(service.isEmptyValue(undefined)).toBe(true)
	})

	it('retourne false pour une chaîne non vide', () => {
		expect(service.isEmptyValue('hello')).toBe(false)
	})

	it('retourne false pour 0', () => {
		expect(service.isEmptyValue(0)).toBe(false)
	})

	it('retourne false pour false', () => {
		expect(service.isEmptyValue(false)).toBe(false)
	})

	it('retourne false pour un tableau vide', () => {
		expect(service.isEmptyValue([])).toBe(false)
	})

	it('retourne false pour un objet vide', () => {
		expect(service.isEmptyValue({})).toBe(false)
	})
})