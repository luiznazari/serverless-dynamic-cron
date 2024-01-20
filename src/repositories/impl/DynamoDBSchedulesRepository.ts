import type { GetItemCommandInput } from '@aws-sdk/client-dynamodb'
import {
  mapDynamoToModel,
  type ScheduleModel,
  type ScheduleDynamoModel,
} from '../../models/ScheduleModel'
import type { SchedulesRepository } from '../repositories'
import { getEnv } from '../../utils/environments'
import { getClient } from '../../providers/DynamoDbProvider'

const getTableName = (): string => getEnv('DYNAMO_SCHEDULES_TABLE_NAME')

const schedulesRepository: SchedulesRepository = {
  getById: async (id: string): Promise<ScheduleModel | null> => {
    const client = getClient()

    const params: GetItemCommandInput = {
      TableName: getTableName(),
      Key: { id: { S: id } },
    }

    const item = await client.getItem(params)

    if (!item.Item) {
      return null
    }

    return mapDynamoToModel(item.Item as ScheduleDynamoModel)
  },
}

export { schedulesRepository }
