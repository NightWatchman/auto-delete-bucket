import { Construct, RemovalPolicy, CustomResourceProvider, CustomResource, CustomResourceProviderRuntime } from '@aws-cdk/core'
import { Bucket, BucketProps } from '@aws-cdk/aws-s3'
import path = require('path')

export class DestroyableBucket extends Bucket {
  constructor(scope: Construct, id: string, props: BucketProps = {}) {
    super(scope, id, {...props})

    const serviceToken = CustomResourceProvider.getOrCreate(this, 'Custom::DestroyableBucket', {
      codeDirectory: path.join(__dirname, '..', 'lambda'),
      runtime: CustomResourceProviderRuntime.NODEJS_12,
      policyStatements: [
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:ListBucket'
        },
        {
          Effect: 'Allow',
          Resource: `${this.bucketArn}/*`,
          Action: 's3:*Object'
        }
      ]
    })

    new CustomResource(this, 'DestroyableBucket', {
      resourceType: 'Custom::DestroyableBucket',
      serviceToken,
      properties: {
        BucketName: this.bucketName,
        RemovalPolicy: props.removalPolicy || RemovalPolicy.RETAIN
      }
    })
  }
}
