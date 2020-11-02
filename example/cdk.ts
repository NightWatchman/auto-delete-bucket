#!/usr/bin/env node
import { App, Tag, Aspects } from '@aws-cdk/core'
import { ExampleStack } from './stacks/example-stack'

const cdk = new App()
const example = new ExampleStack(cdk, 'destroyable-bucket-example', {})
Aspects.of(example).add(new Tag('example', 'true'))
