export default {
  name: '${self:service}-${self:provider.stage}-process-scheduled-event',
  type: 'EXPRESS',
  loggingConfig: {
    level: 'ALL',
    includeExecutionData: true,
    destinations: [
      {
        'Fn::GetAtt': ['LogGroupProcessScheduledEvent', 'Arn'],
      },
    ],
  },
  tracingConfig: {
    enabled: true,
  },
  events: [
    {
      schedule: 'cron(0 * * * ? *)', // Every hour. Change here to support other time intervals.
      name: 'ScheduledEventCron',
      description:
        'Rule for triggering the StepFunction that triggers scheduled executions.',
    },
  ],
  definition: {
    Comment: 'Disbursement QiTech',
    StartAt: 'Query-ScheduledExecutionByNextExecution',
    States: {
      'Query-ScheduledExecutionByNextExecution': {
        Type: 'Task',
        Next: 'Query-ScheduledExecutionByNextExecution2',
        Parameters: {
          TableName: '${self:service}-${self:provider.stage}-scheduled-executions',
          IndexName: 'nextExecutionIndex',
          KeyConditionExpression: '#T = :t AND #N = :n',
          ExpressionAttributeNames: {
            '#T': 'type',
            '#N': 'nextExecution',
          },
          ExpressionAttributeValues: {
            ':t': {
              S: 'scheduled',
            },
            ':n': {
              'S.$': '$.time',
            },
          },
        },
        Resource: 'arn:aws:states:::aws-sdk:dynamodb:query',
      },
      'Query-ScheduledExecutionByNextExecution2': {
        Type: 'Task',
        Next: 'Map',
        Parameters: {
          TableName: '${self:service}-${self:provider.stage}-schedules',
          KeyConditionExpression: '#I = :i',
          ExpressionAttributeNames: {
            '#I': 'id',
          },
          ExpressionAttributeValues: {
            ':i': {
              S: 'scheduled',
            },
          },
        },
        Resource: 'arn:aws:states:::aws-sdk:dynamodb:query',
      },
      Map: {
        Type: 'Map',
        ItemProcessor: {
          ProcessorConfig: {
            Mode: 'INLINE',
          },
          StartAt: 'Invoke-ScheduledTrigger',
          States: {
            'Invoke-ScheduledTrigger': {
              Type: 'Task',
              Resource: 'arn:aws:states:::lambda:invoke',
              Parameters: {
                FunctionName: {
                  'Fn::Join': [
                    '',
                    [
                      'arn:aws:lambda',
                      ':',
                      {
                        Ref: 'AWS::Region',
                      },
                      ':',
                      {
                        Ref: 'AWS::AccountId',
                      },
                      ':',
                      'function',
                      ':',
                      '${self:service}-${self:provider.stage}-reschedule',
                      ':$LATEST',
                    ],
                  ],
                },
                Payload: {
                  body: {
                    'triggerId.$': '$.triggerId.S',
                  },
                },
              },
              Retry: [
                {
                  ErrorEquals: [
                    'Lambda.ServiceException',
                    'Lambda.AWSLambdaException',
                    'Lambda.SdkClientException',
                    'Lambda.TooManyRequestsException',
                  ],
                  IntervalSeconds: 2,
                  MaxAttempts: 1,
                  BackoffRate: 2,
                },
              ],
              End: true,
              ResultPath: null,
            },
          },
        },
        End: true,
        ItemsPath: '$.Items',
      },
    },
  },
}
