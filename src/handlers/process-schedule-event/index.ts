import type { AWS } from '@serverless/typescript'
import { SchedulesDynamoDB } from '../../infra/SchedulesDynamoDB'
import { ScheduledExecutionsDynamoDB } from '../../infra/ScheduledExecutionsDynamoDB'

const handlerPath = (context: string): string =>
  `${context.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}`

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    DYNAMO_SCHEDULED_EXECUTIONS_TABLE_NAME: ScheduledExecutionsDynamoDB.tableName,
  },
  events: [
    {
      stream: {
        type: 'dynamodb',
        arn: {
          'Fn::GetAtt': [SchedulesDynamoDB.resourceName, 'StreamArn'],
        },
        filterPatterns: [
          {
            eventName: ['INSERT', 'MODIFY', 'REMOVE'],
          },
        ],
        startingPosition: 'LATEST',
        batchSize: 1,
        maximumRetryAttempts: 2,
        functionResponseType: 'ReportBatchItemFailures' as const,
      },
    },
  ],
} as AWS['functions'][0]
