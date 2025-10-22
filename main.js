import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import dotenv from 'dotenv'
import { Match } from './classes/Match.js'
import Logger from './classes/logger.js'

dotenv.config()
const logger = new Logger()
const lol = new Match('lol')
const csGo = new Match('csgo')
const valorant = new Match('valorant')

logger.info('############ START CREATED MATCH ############')

const lolMatches = await lol.createdMatch()
const csMatches = await csGo.createdMatch()
const valorantMatches = await valorant.createdMatch()

logger.info('############ END CREATED MATCH ############')

const databaseInstance = databaseFactory()
const conn = await databaseInstance.connectDb()
const recoveryMatchesInstance = await databaseInstance.recoveryMatchesInstance()
const currentDate = new Date()

logger.info('############ START DELETED OLD MATCH ############')

await recoveryMatchesInstance.deletedOldMatches(currentDate.setHours(0, 0, 0, 0))

logger.info('############ END DELETED OLD MATCH ############')

logger.info('############ START SAVING MATCH ############')

await lol.processMatches(lolMatches, recoveryMatchesInstance)
await csGo.processMatches(csMatches, recoveryMatchesInstance)
await valorant.processMatches(valorantMatches, recoveryMatchesInstance)
try {
	if (conn) await conn.close(true);
	
} catch (e) {
	logger.error("Error close DB:", e);
}
logger.info('############ END SAVING MATCH ############')
