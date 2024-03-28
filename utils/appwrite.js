import { Client, Account, Databases, Storage } from 'appwrite'

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('651beccfd633c608a464');

export const account = new Account(client)
export const DB = new Databases(client)
export const storage = new Storage(client)

export { client }

export { ID } from 'appwrite'