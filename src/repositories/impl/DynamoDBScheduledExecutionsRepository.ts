import type {
  DeleteItemCommandInput,
  PutItemCommandInput,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb'
import type { ScheduledExecutionModel } from '../../models/ScheduledExecutionModel'
import type { ScheduledExecutionsRepository } from '../repositories'
import { getEnv } from '../../utils/environments'
import { getClient } from '../../providers/DynamoDbProvider'

const getTableName = (): string => getEnv('DYNAMO_SCHEDULED_EXECUTIONS_TABLE_NAME')

const scheduledExecutionsRepository: ScheduledExecutionsRepository = {
  create: async (scheduledExecution: ScheduledExecutionModel): Promise<void> => {
    const client = getClient()

    const params: PutItemCommandInput = {
      TableName: getTableName(),
      Item: {
        scheduleId: { S: scheduledExecution.scheduleId },
        type: { S: scheduledExecution.type },
        nextExecution: { S: scheduledExecution.nextExecution },
      },
    }

    await client.putItem(params)
  },

  update: async (scheduleId: string, nextExecution: string): Promise<void> => {
    const client = getClient()

    const params: UpdateItemCommandInput = {
      TableName: getTableName(),
      Key: { scheduleId: { S: scheduleId } },
      UpdateExpression: 'set nextExecution = :nextExecution',
      ExpressionAttributeValues: {
        ':nextExecution': { S: nextExecution },
      },
    }

    await client.updateItem(params)
  },

  delete: async (scheduleId: string): Promise<void> => {
    const client = getClient()

    const params: DeleteItemCommandInput = {
      TableName: getTableName(),
      Key: { scheduleId: { S: scheduleId } },
    }

    await client.deleteItem(params)
  },
}

export { scheduledExecutionsRepository }
