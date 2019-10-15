import { App, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core'
import { DestroyableBucket } from '../../src/resource/destroyable-bucket'

export class ExampleStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props)

    /**
     * NOTE: S3 requires bucket names to be globally unique across accounts so
     * you will need to change the bucketName to something that nobody else is
     * using.
     */
    new DestroyableBucket(this, 'example-destroyablebucket-1', {
      bucketName: 'destroyableexample-bucket1',
      removalPolicy: RemovalPolicy.DESTROY
    })

    /**
     * NOTE: S3 requires bucket names to be globally unique across accounts so
     * you will need to change the bucketName to something that nobody else is
     * using.
     */
    new DestroyableBucket(this, 'example-destroyablebucket-2', {
      bucketName: 'destoryableexample-bucket2',
      removalPolicy: RemovalPolicy.RETAIN
    })
  }
}
