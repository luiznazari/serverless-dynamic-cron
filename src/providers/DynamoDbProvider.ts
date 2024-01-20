import { Logger } from '../utils/logger'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

let client: DynamoDB

const getClient = () => {
  if (!client) {
    Logger.debug('Creating DynamoDB client.')
    client = new DynamoDB({})
  }
  return client
}

export { getClient }
