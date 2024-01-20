const resourceName = 'ScheduledExecutionsDynamoDBTable'

const tableName = '${self:service}-${self:provider.stage}-scheduled-executions'

const getResources = () => ({
  [resourceName]: {
    Type: 'AWS::DynamoDB::Table',
    DeletionPolicy: 'Retain',
    Properties: {
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: 'scheduleId',
          AttributeType: 'S',
        },
        {
          AttributeName: 'type',
          AttributeType: 'S',
        },
        {
          AttributeName: 'nextExecution',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'scheduleId',
          KeyType: 'HASH',
        },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'nextExecutionIndex',
          KeySchema: [
            {
              AttributeName: 'type',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'nextExecution',
              KeyType: 'RANGE',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    },
  },

  [resourceName + '2']: {
    Type: 'AWS::DynamoDB::Table',
    DeletionPolicy: 'Retain',
    Properties: {
      TableName: tableName + '2',
      AttributeDefinitions: [
        {
          AttributeName: 'scheduleId',
          AttributeType: 'S',
        },
        {
          AttributeName: 'nextExecution',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'scheduleId',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'nextExecution',
          KeyType: 'RANGE',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    },
  },
})

const getAllRoles = () => [
  {
    Effect: 'Allow',
    Resource: [
      {
        'Fn::GetAtt': [resourceName, 'Arn'],
      },
    ],
    Action: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem'],
  },
  {
    Effect: 'Allow',
    Resource: [
      {
        'Fn::Join': [
          '',
          [
            'arn:aws:dynamodb',
            ':',
            '${self:provider.region}',
            ':',
            { Ref: 'AWS::AccountId' },
            ':',
            'table/',
            tableName,
            '/index/nextExecutionIndex',
          ],
        ],
      },
    ],
    Action: ['dynamodb:Query'],
  },
]

export const ScheduledExecutionsDynamoDB = {
  tableName,
  getResources,
  getAllRoles,
}
