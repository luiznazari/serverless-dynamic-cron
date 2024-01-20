import type { AWS } from '@serverless/typescript'
import functions from './src/handlers'
import stepFunctions from './src/stepfunctions'
import { CloudWatch } from './src/infra/CloudWatch'
import { SchedulesDynamoDB } from './src/infra/SchedulesDynamoDB'
import { ScheduledExecutionsDynamoDB } from './src/infra/ScheduledExecutionsDynamoDB'

interface AWSExtended extends AWS {
  stepFunctions: {
    stateMachines: unknown
  }
}

const getStage = (): string => {
  const programArgs = process.argv.join('=')
  const matcher = /--stage=(\w+)/.exec(programArgs)
  return matcher ? matcher[1] : 'dev'
}

const isStage = (envs: string | string[]): boolean => {
  const stage = getStage()
  if (!Array.isArray(envs)) {
    return stage === envs
  }
  return envs.includes(stage)
}

const serverlessConfiguration: AWSExtended = {
  frameworkVersion: '3',
  service: 'serverless-dynamic-cron',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-step-functions'],
  provider: {
    name: 'aws',
    deploymentMethod: 'direct',
    runtime: 'nodejs20.x',
    stage: '${opt:stage, "offline"}',
    region: '${opt:region, "us-east-1"}' as AWS['provider']['region'],
    environment: {
      ENV: '${self:provider.stage}',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        statements: [
          ...SchedulesDynamoDB.getAllRoles(),
          ...ScheduledExecutionsDynamoDB.getAllRoles(),
        ],
      },
    },
  },
  resources: {
    Resources: {
      ...CloudWatch.getResources(),
      ...SchedulesDynamoDB.getResources(),
      ...ScheduledExecutionsDynamoDB.getResources(),
    },
  },
  stepFunctions: {
    stateMachines: {
      ...stepFunctions,
    },
  },
  functions,
  package: {
    individually: true,
  },
  configValidationMode: 'error',
  custom: {
    esbuild: {
      legalComments: 'none',
      bundle: true,
      minify: false,
      sourcemap: isStage(['local', 'dev']),
      exclude: ['aws-sdk'],
      target: 'node20',
      platform: 'node',
      concurrency: 10,
      watch: {
        pattern: ['src/**/*.ts'],
        ignore: ['temp/**/*'],
      },
    },
  },
}

module.exports = serverlessConfiguration
