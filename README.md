## Depreciated

The CDK now has native support for this functionality via the `autoDeleteObjects` property, and this package is no longer necessary or supported.

## What it does

Creates an S3 bucket in Cloud Formation that, when used with `removalPolicy: RemovalPolicy.DESTROY`, can destroy the bucket even if it's not empty.

## How to use it

This is an [AWS CDK Construct](https://docs.aws.amazon.com/CDK/latest/userguide/constructs.html) which makes it dead simple to use in your CDK code.

Just install with npm:

```
npm install destroyable-bucket
```

Then require the construct and use it in your stack like any standard CDK resource!

```js
import { DestroyableBucket } from 'destroyable-bucket'

export class ExampleStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props)

    /**
     * NOTE: S3 requires bucket names to be globally unique across accounts so
     * you will need to change the bucketName to something that nobody else is
     * using.
     */
    new DestroyableBucket(this, 'example-autobucket-1', {
      bucketName: 'autoexample-bucket1'
    })
  }
}
```

See the example directory for a complete CDK example. Be sure to change the `bucketNames` so they are unique.

The bucket can be configured with any of the [standard CDK Bucket Properties](https://awslabs.github.io/aws-cdk/refs/_aws-cdk_aws-s3.html#bucketprops-interface).

- If `removalPolicy: RemovalPolicy.DESTROY` is used, the bucket will be emptied and deleted when the stack is destroyed.
- if `removalPolicy: RemovalPolicy.RETAIN` is used, the bucket will not be emptied, and will be orphaned when the stack is destroyed.

## Requirements

- This is designed to work with AWS CDK but feel free to borrow the code if you want to create the custom CF resource some other way.
- Does not yet work with versioned buckets but it can be easily adapted to do so (pull requests welcome.)

## Versioning

Version numbers are consistent with the major and minor version numbers of the corresponding AWS CDK version that this module is compatible with. In other words, version 1.1.X would be compatiable with aws-cdk 1.1.X. Patch versions will inevitably vary between the two projects.

## Motivation

Cloud Formation will often fail to actually delete your S3 Bucket resources when you destroy your stack. This happens whenever the bucket is not empty as the Cloud Formation documentation clearly states:

> You can only delete empty buckets. Deletion fails for buckets that have contents.

We find that in our use cases, we want to be able to delete the bucket and it's contents whenever the stack is deleted,
or alternatively to leave the bucket and it's contents in place, and orphan it when the stack is deleted.

## How it Works

Create a [custom resource](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html) that will automatically delete your bucket contents before attempting bucket deletion.

## Running Tests

```
npm test
```

## Building the Example Stack

The source code includes a reference CDK project inside the `example` directory which consists of a single `destroyable-bucket`.

You can build the stack with:

```
npm run cdk:deploy
```

Go ahead and test this bucket out by adding some files to it. You can then test that everything will delete properly by destroying the stack (and bucket) with:

```
npm run cdk:destroy
```

## More Information

See the [AWS documentation](https://docs.aws.amazon.com/AmazonS3/latest/dev/delete-or-empty-bucket.html) for more information on S3 and deleting bucket contents.

## Acknowledgements

This implementation was derived from the excellent https://github.com/mobileposse/auto-delete-bucket, with changes
that make it possible to selectively retain the bucket and it's contents when the stack is destroyed, rather than always deleting it.
