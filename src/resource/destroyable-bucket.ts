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
          Action: 's3:DeleteObject'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:DeleteObjectTagging'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:DeleteObjectVersion'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:DeleteObjectVersionTagging'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:GetBucketLogging'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:GetBucketNotification'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:GetBucketObjectLockConfiguration'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:GetObject'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:GetObjectVersion'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:ListBucket'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:ListBucketVersions'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:PutBucketLogging'
        },
        {
          Effect: 'Allow',
          Resource: this.bucketArn,
          Action: 's3:PutObject'
        },
      ]
    })

    new CustomResource(this, 'DestroyableBucket', {
      resourceType: 'Custom::DestroyableBucket',
      serviceToken,
      properties: {
        bucketName: this.bucketName,
        removalPolicy: props.removalPolicy || RemovalPolicy.RETAIN
      }
    })
  }
}
