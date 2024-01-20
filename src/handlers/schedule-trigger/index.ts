import type { AWS } from '@serverless/typescript'
import { SchedulesDynamoDB } from '../../infra/SchedulesDynamoDB'
import { ScheduledExecutionsDynamoDB } from '../../infra/ScheduledExecutionsDynamoDB'

const handlerPath = (context: string): string =>
  `${context.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}`

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    DYNAMO_SCHEDULES_TABLE_NAME: SchedulesDynamoDB.tableName,
    DYNAMO_SCHEDULED_EXECUTIONS_TABLE_NAME: ScheduledExecutionsDynamoDB.tableName,
  },
} as AWS['functions'][0]
