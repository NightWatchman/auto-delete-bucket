import { Code, Runtime, SingletonFunction } from '@aws-cdk/aws-lambda'
import { Construct, Duration } from '@aws-cdk/core'
import { CustomResource, CustomResourceProvider} from '@aws-cdk/aws-cloudformation'
import { Bucket, BucketProps } from '@aws-cdk/aws-s3'
import path = require('path')

export class DestroyableBucket extends Bucket {
  constructor(scope: Construct, id: string, props: BucketProps = {}) {
    super(scope, id, {...props})

    const lambda = new SingletonFunction(this, 'DestroyableBucketHandler', {
      uuid: 'a8e853be-c06c-46c6-ab64-bd61819e992f',
      runtime: Runtime.NODEJS_10_X,
      code: Code.asset(path.join(__dirname, '../lambda')),
      handler: 'main.handler',
      lambdaPurpose: 'DestroyableBucket',
      timeout: Duration.minutes(15)
    })

    const provider = CustomResourceProvider.lambda(lambda)

    // allow the bucket contents to be read and deleted by the lambda
    this.grantReadWrite(lambda)

    new CustomResource(this, 'DestroyableBucket', {
      provider,
      resourceType: 'Custom::DestroyableBucket',
      properties: {
        bucketName: this.bucketName,
        removalPolicy: props.removalPolicy
      }
    })
  }
}
