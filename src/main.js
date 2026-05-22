import { db } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import dotenv from 'dotenv'
import { Match } from './classes/Match.js'
import Logger from './classes/logger.js'

dotenv.config()
const logger = new Logger()
const lol = new Match('lol')
const csGo = new Match('csgo')
const valorant = new Match('valorant')
const recoveryMatchRepository = await db.recoveryMatch()
logger.info('############ START CREATED MATCH ############')

const lolMatches = await lol.createdMatch()
const csMatches = await csGo.createdMatch()
const valorantMatches = await valorant.createdMatch()

logger.info('############ END CREATED MATCH ############')

const currentDate = new Date()

logger.info('############ START DELETED OLD MATCH ############')

await recoveryMatchRepository.deleteOldMatches(currentDate.setHours(0, 0, 0, 0))

logger.info('############ END DELETED OLD MATCH ############')

logger.info('############ START SAVING MATCH ############')

await lol.processMatches(lolMatches, recoveryMatchRepository)
await csGo.processMatches(csMatches, recoveryMatchRepository)
await valorant.processMatches(valorantMatches, recoveryMatchRepository)
logger.info('############ END SAVING MATCH ############')
