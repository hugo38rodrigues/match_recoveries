import { beforeEach, describe, expect, it } from 'vitest'
import { ValidationService } from '../../../classes/services/Validation.service.js'

describe('hasEmptyRequiredField()', () => {
	let service

	beforeEach(() => {
		service = new ValidationService()
	})

	it('ne descend pas au-delà du 1er niveau d\'imbrication', () => {
		// { team: { nested: { id: null } } } — null est à 2 niveaux → non détecté
		const result = service.hasEmptyRequiredField({
			team: { nested: { id: null }},
		})
		// La validation ne descend qu'à 1 niveau d'objet : ce cas passe (false)
		expect(result).toBe(false)
	})

	it('détecte bien un null à exactement 1 niveau d\'imbrication', () => {
		expect(service.hasEmptyRequiredField({
			team: { id: null, name: 'T1' },
		})).toBe(true)
	})

	it('un tableau contenant null n\'est pas vide → retourne false', () => {
		// [null] a length > 0, donc le tableau lui-même n'est pas considéré vide
		expect(service.hasEmptyRequiredField({ streams: [null] })).toBe(false)
	})

	it('un objet imbriqué avec un tableau vide n\'est pas détecté (limite connue)', () => {
		// La validation vérifie isEmptyValue sur les valeurs d'un objet imbriqué,
		// mais [] n'est pas une valeur vide pour isEmptyValue → non détecté
		expect(service.hasEmptyRequiredField({
			team: { id: 1, streams: [] },
		})).toBe(false)
	})
})
