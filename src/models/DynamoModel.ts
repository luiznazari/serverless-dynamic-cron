import type { AttributeValue } from '@aws-sdk/client-dynamodb'

export interface DynamoModel {
  [key: string]: AttributeValue | undefined
}
