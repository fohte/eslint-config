import { describe, expect,it } from 'vitest'

import {
  expectFixed,
  expectNoErrors,
  expectRule,
  getMessagesForRule,
  runESLint,
  withTestProject} from './helpers/e2e-test-helper-optimized.js'

describe('Import Rules E2E', { timeout: 30000 }, () => {
  it('detects unordered imports', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `import { z } from 'zod'
import { a } from './a'
import React from 'react'
`
        }
      ]
    }, async (projectDir) => {
      const output = await runESLint(projectDir)
      expectRule(output, 'simple-import-sort/imports')

      const messages = getMessagesForRule(output, 'simple-import-sort/imports')
      expect(messages).toHaveLength(1)
      expect(messages[0].message).toContain('Run autofix to sort these imports')
    })
  })

  it('sorts imports correctly with autofix', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `import { z } from 'zod'
import { a } from './a'
import React from 'react'
`
        }
      ]
    }, async (projectDir) => {
      await runESLint(projectDir, ['--fix'])

      expectFixed(projectDir, 'test.js', `import React from 'react'
import { z } from 'zod'

import { a } from './a'
`)
    })
  })

  it('detects no-duplicates violations', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `import React from 'react'
import { useState } from 'react'
`
        }
      ]
    }, async (projectDir) => {
      const output = await runESLint(projectDir)
      expectRule(output, 'import/no-duplicates')
    })
  })

  it('fixes duplicate imports', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `import React from 'react'
import { useState } from 'react'
`
        }
      ]
    }, async (projectDir) => {
      await runESLint(projectDir, ['--fix'])

      expectFixed(projectDir, 'test.js', `import React, { useState } from 'react'
`)
    })
  })


  it('allows valid imports', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `import React from 'react'
import { z } from 'zod'

import { helper } from './utils'

const schema = z.object({})
const Component = () => React.createElement('div')
console.log(helper, schema, Component)
`
        }
      ]
    }, async (projectDir) => {
      const output = await runESLint(projectDir)
      expectNoErrors(output)
    })
  })
})
