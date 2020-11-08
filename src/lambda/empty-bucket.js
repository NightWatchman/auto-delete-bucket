import * as AWS from 'aws-sdk'

const s3 = new AWS.S3()

export const emptyBucket = async bucketName => {
  // delete bucket contents
  const listedObjects = await s3.listObjectsV2({ Bucket: bucketName }).promise()
  console.debug('listedObjects: %o', listedObjects)

  // nothing left - we're done!
  const contents = listedObjects.Contents || []
  if (contents.length === 0) return

  let records = []

  // make a list of objects to delete
  for (let record of contents) {
    records.push({ Key: record.Key })
  }

  const result = await s3
    .deleteObjects({ Bucket: bucketName, Delete: { Objects: records } })
    .promise()
  console.debug('delete bucket files response: %o', result)

  // repeat as necessary
  if (listedObjects.IsTruncated) await emptyBucket(bucketName)
}
