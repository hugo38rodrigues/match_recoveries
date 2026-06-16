import pino from 'pino'

export const logger =	pino({
	level: process.env.LOG_LEVEL || 'info', // Niveau minimum
	transport: {
		target: 'pino-pretty', // Pour un affichage lisible
		options: {
			colorize: true,
			translateTime: 'SYS:standard',
		},
	},
})
