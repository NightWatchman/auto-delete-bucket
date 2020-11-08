import { Construct, RemovalPolicy, CustomResourceProvider, CustomResource, CustomResourceProviderRuntime } from '@aws-cdk/core'
import { Bucket, BucketProps } from '@aws-cdk/aws-s3'
import path = require('path')

export class DestroyableBucket extends Bucket {
  // TODO: Figure out a way to share the same provider, but append
  // the permissions for each invocation, so that when two or more
  // instances of DestroyableBucket are created the single provider
  // has the permissions to delete all buckets
  constructor(scope: Construct, id: string, props: BucketProps = {}) {
    super(scope, id, {...props})

    // The bucket id is included in the provider id here, so that
    // it creates a unique provider for each bucket that has permissions
    // to delete the files in that bucket.
    const serviceToken = CustomResourceProvider.getOrCreate(this, `DestroyableBucketProvider${id}`, {
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

    new CustomResource(this, `DestroyableBucket${id}`, {
      resourceType: 'Custom::DestroyableBucket',
      serviceToken,
      properties: {
        BucketName: this.bucketName,
        RemovalPolicy: props.removalPolicy || RemovalPolicy.RETAIN
      }
    })
  }
}
