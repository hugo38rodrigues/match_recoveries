// app/middleware/logger.js
import { inspect } from 'node:util'
import winston from 'winston'

const {
	combine, timestamp, printf, colorize, errors, splat,
} = winston.format

export default class Logger {
	constructor (context = '') {
		const withContext = winston.format((info) => {
			const newInfo = { ...info }

			if (context) newInfo.context = context
			if (newInfo.error instanceof Error && !newInfo.stack) {
				newInfo.stack = newInfo.error.stack
				newInfo.message = newInfo.message || newInfo.error.message
				delete newInfo.error
			}

			return newInfo
		})

		const consoleLine = printf(({
			timestamp: ts, level, message, stack, context: ctx, ...meta
		}) => {
			// meta safe (évite JSON.stringify naif)
			const metaStr = Object.keys(meta).length ? ` ${inspect(meta, { depth: null, colors: false })}` : ''
			const ctxStr = ctx ? ` [${ctx}]` : ''
			return stack
				? `${ts} ${ctxStr} ${level}: ${message}\n${stack}${metaStr}`
				: `${ts} ${ctxStr} ${level}: ${message}${metaStr}`
		})

		this.logger = winston.createLogger({
			level: process.env.LOG_LEVEL || 'info',
			format: combine(
				errors({ stack: true }), // si message est une Error → stack auto
				splat(), // support %s, %d…
				withContext(), // ajoute le contexte + normalise meta.error
				timestamp(),
				...(process.env.NODE_ENV === 'development' ? [colorize({ all: true })] : []),
				consoleLine,
			),
			transports: [
				new winston.transports.Console(),
			],
			exitOnError: false,
		})
	}

	// Tolère logger.log('message') → niveau 'info' par défaut
	log (levelOrMsg, maybeMsg, meta = {}) {
		if (typeof levelOrMsg === 'string' && typeof maybeMsg === 'undefined') {
			this.logger.log('info', levelOrMsg)
			return
		}
		this.logger.log(levelOrMsg, maybeMsg, meta)
	}

	info (message, meta = {}) { this.logger.info(message, meta) }

	warn (message, meta = {}) { this.logger.warn(message, meta) }

	error (message, meta = {}) { this.logger.error(message, meta) }

	debug (message, meta = {}) { this.logger.debug(message, meta) }
}
