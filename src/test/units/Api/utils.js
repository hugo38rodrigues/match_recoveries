import { vi } from 'vitest'

export const makeLogger = () => ({
	info:  vi.fn(),
	error: vi.fn(),
})

export const makeResponse = (data, linkHeader = null) => ({
	data,
	headers: { link: linkHeader },
})