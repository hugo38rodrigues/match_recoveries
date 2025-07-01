import { databaseFactory } from 'bdd-service-hall-e/main.js'
import dotenv from 'dotenv'
import { Match } from './classes/Match.js'

dotenv.config()
const lol = new Match('lol')
const csGo = new Match('csgo')
const valorant = new Match('valorant')

console.log('############ START CREATED MATCH ############')

const lolMatches = await lol.createdMatch()
const csMatches = await csGo.createdMatch()
const valorantMatches = await valorant.createdMatch()

console.log('############ END CREATED MATCH ############')

const databaseInstance = databaseFactory()
await databaseInstance.connectDb()
const recoveryMatchesInstance = await databaseInstance.recoveryMatchesInstance()
const currentDate = new Date()

console.log('############ START DELETED OLD MATCH ############')

await recoveryMatchesInstance.deletedOldMatches(currentDate.setHours(0, 0, 0, 0))

console.log('############ END DELETED OLD MATCH ############')

console.log('############ START SAVING MATCH ############')

await lol.processMatches(lolMatches, recoveryMatchesInstance)
await csGo.processMatches(csMatches, recoveryMatchesInstance)
await valorant.processMatches(valorantMatches, recoveryMatchesInstance)

console.log('############ END SAVING MATCH ############')
await databaseInstance.disconnectDb()

process.exit(1)
