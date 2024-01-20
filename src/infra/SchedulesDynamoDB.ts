const resourceName = 'SchedulesDynamoDBTable'

const tableName = '${self:service}-${self:provider.stage}-schedules'

const getResources = () => ({
  [resourceName]: {
    Type: 'AWS::DynamoDB::Table',
    DeletionPolicy: 'Retain',
    Properties: {
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      StreamSpecification: {
        StreamViewType: 'NEW_AND_OLD_IMAGES',
      },
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
    Action: [
      'dynamodb:GetItem',
      'dynamodb:PutItem',
      'dynamodb:UpdateItem',
      'dynamodb:DeleteItem',
    ],
  },
]

export const SchedulesDynamoDB = {
  tableName,
  resourceName,
  getResources,
  getAllRoles,
}
