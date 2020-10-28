import { handler } from '../../src/lambda/index'
import * as fx from 'node-fixtures'

// mock the s3 stuff so we don't actually attempt to delete any buckets
jest.mock('../../src/lambda/empty-bucket', () => ({
  emptyBucket: jest.fn()
}))

const { emptyBucket } = require('../../src/lambda/empty-bucket')

describe('#handler', () => {
  beforeEach(async () => {
    emptyBucket.mockReset()
  })

  describe('when request type is Create but no bucketName is specified', () => {
    it('should fail with reason bucketName is required', () => {
      const result = handler(fx.create_no_bucket)
      return expect(result).rejects.toEqual(new Error('bucketName is required'))
    })
  })

  describe('when request type is Update but no bucketName is specified', () => {

    it('should fail with reason bucketName is required', () => {
      const result = handler(fx.update_no_bucket)
      return expect(result).rejects.toEqual(new Error('bucketName is required'))
    })
  })

  describe('when request type is Delete but no bucketName is specified', () => {

    it('should fail with reason bucketName is required', () => {
      const result = handler(fx.delete_no_bucket)
      return expect(result).rejects.toEqual(new Error('bucketName is required'))
    })

    // TODO: test to ensure that S3 operations are not attempted
    test.toString('should not attempt any S3 operations')
  })

  describe('when request type is Create', () => {

    it('should respond with no operations performed message', async () => {
      const result = await handler(fx.create)
      expect(result).toEqual(
        expect.objectContaining({
          Reason: 'No operations are performed by this custom resource when it is created'
        })
      )
    })

    it('should return with a generated physical resource id', async () => {
      const result = await handler(fx.create)
      expect(result).toEqual(
        expect.objectContaining({
          PhysicalResourceId: expect.any(String)
        })
      )
    })
  })

  describe('with two different Create requests', () => {
    it('should send a response with a unique PhysicalResourceId for each request', async () => {
      const result1 = await handler(fx.create)
      const result2 = await handler(fx.create2)
      expect(result1.PhysicalResourceId).not.toEqual(result2.PhysicalResourceId)
    })
  })

  describe('when a resource with the same LogicalResourceId is Created and then Updated', () => {
    it('should send a response with the same PhysicalResourceId for each request', async () => {
      const result1 = await handler(fx.create)
      const result2 = await handler(fx.update)
      expect(result1.PhysicalResourceId).toEqual(result2.PhysicalResourceId)
    })
  })

  describe('when a resource with the same LogicalResourceId is Created and then Deleted', () => {

    it('should send a response with the same PhysicalResourceId for each request', async () => {
      const result1 = await handler(fx.create)
      const result2 = await handler(fx.delete)

      expect(result1.PhysicalResourceId).toEqual(result2.PhysicalResourceId)
    })
  })

  describe('when request type is Update', () => {
    it('should return with no operations performed reason', async () => {
      const result = await handler(fx.update)
      expect(result).toEqual(expect.objectContaining({
          Reason: 'No operations are performed by this custom resource when it is updated'
        })
      )
    })

    it('should return a generated physical resource id', async () => {
      const result = await handler(fx.update)
      expect(result).toEqual(
        expect.objectContaining({
          PhysicalResourceId: expect.any(String)
        })
      )
    })
  })

  describe('when request type is Delete, and the bucket exists, and the retainPolicy is destroy', () => {
    it('should respond with bucket deleted message', async () => {
      const result = await handler(fx.delete)

      expect(result).toEqual(
        expect.objectContaining({
          Reason: "Deleted files from bucket 'autoexample-bucket1' in preparation for bucket delete"
        })
      )
    })

    it('should send a response with a generated physical resource id', async () => {
      const result = await handler(fx.delete)

      expect(result).toEqual(
        expect.objectContaining({
          PhysicalResourceId: expect.any(String)
        })
      )
    })

    it('should empty the bucket', async () => {
      await handler(fx.delete)
      expect(emptyBucket).toHaveBeenCalled()
    })
  })

  describe('when request type is Delete, and the bucket exists, and the retainPolicy is retain', () => {

    it('should return a bucket retained reason', async () => {
      const result = await handler(fx.delete_with_retain)
      expect(result).toEqual(
        expect.objectContaining({
          Reason: "No operations have been performed on bucket 'autoexample-bucket1', because it is set to be retained"
        })
      )
    })

    it('should send a response with a generated physical resource id', async () => {
      const result = await handler(fx.delete_with_retain)
      expect(result).toEqual(
        expect.objectContaining({
          PhysicalResourceId: expect.any(String)
        })
      )
    })

    it('should not empty the bucket', () => {
      expect(emptyBucket).not.toHaveBeenCalled()
    })
  })

  describe('when request type is Delete and S3 raises an error message', () => {
    beforeEach(() => {
      emptyBucket.mockImplementation(() => {
        throw new Error('Some Reason')
      })
    })

    it('should respond with a rejected result containing the S3 error message', () => {
      const result = handler(fx.delete)

      return expect(result).rejects.toEqual(new Error('Some Reason'))
    })
  })
})
