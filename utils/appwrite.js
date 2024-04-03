import { Client, Account, Databases, Storage } from 'appwrite'

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('66057a6f364c1c3f2b06');

export const account = new Account(client)
export const DB = new Databases(client)
export const storage = new Storage(client)

export { client }

export { ID } from 'appwrite'