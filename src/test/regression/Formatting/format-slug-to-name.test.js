import { beforeEach, describe, expect, it } from 'vitest'
import { FormattingService } from '../../../classes/services/Formatting.service'

describe('formatSlugToName()', () => {
	let service

	beforeEach(() => {
		service = new FormattingService()
	})

	it('gère un slug commençant par un chiffre', () => {
		// Le premier char est un chiffre, toUpperCase() ne change rien
		expect(service.formatSlugToName('2k-games')).toBe('2k games')
	})

	it('gère un slug avec tiret en fin de chaîne', () => {
		expect(service.formatSlugToName('valorant-')).toBe('Valorant ')
	})

	it('gère un slug avec tirets consécutifs', () => {
		expect(service.formatSlugToName('cs--go')).toBe('Cs  go')
	})

	it('gère un slug d\'un seul caractère', () => {
		expect(service.formatSlugToName('a')).toBe('A')
	})
})