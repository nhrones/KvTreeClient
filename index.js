import { DbClient } from './db/dbClient.js'
export const DEV = true

export const thisDB = new DbClient()

thisDB.init()
