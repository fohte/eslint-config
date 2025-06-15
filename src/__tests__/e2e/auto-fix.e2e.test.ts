import { describe, it } from 'vitest'

import {
  expectFixed,
  runESLint,
  withTestProject} from './helpers/e2e-test-helper.js'

describe('Auto-fix E2E', { timeout: 30000 }, () => {
  it('fixes import ordering issues', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.js',
          content: `import { z } from 'zod'
import React from 'react'
import { helper } from './helper'

function test() {
  console.log(helper)
  console.log(React.version)
  console.log(z.string())
  return 'done'
}

export { test }
`
        }
      ]
    }, async (projectDir) => {
      await runESLint(projectDir, ['--fix'])

      expectFixed(projectDir, 'test.js', `import React from 'react'
import { z } from 'zod'

import { helper } from './helper'

function test() {
  console.log(helper)
  console.log(React.version)
  console.log(z.string())
  return 'done'
}

export { test }
`)
    })
  })

  it('fixes TypeScript import ordering', async () => {
    await withTestProject({
      files: [
        {
          path: 'test.ts',
          content: `import { helper } from './helper'
import React from 'react'

interface User {
  id: string
}

const data: User = { id: '1' }

console.log(React.version, helper, data)
`
        }
      ]
    }, async (projectDir) => {
      await runESLint(projectDir, ['--fix'])

      expectFixed(projectDir, 'test.ts', `import React from 'react'

import { helper } from './helper'

interface User {
  id: string
}

const data: User = { id: '1' }

console.log(React.version, helper, data)
`)
    })
  })

  it('handles JSX/TSX files correctly', async () => {
    await withTestProject({
      files: [
        {
          path: 'Component.tsx',
          content: `import React from 'react'
import { useState } from 'react'

interface Props {
  title: string
}

export const MyComponent = ({ title }: Props) => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  )
}
`
        }
      ]
    }, async (projectDir) => {
      await runESLint(projectDir, ['--fix'])

      expectFixed(projectDir, 'Component.tsx', `import React, { useState } from 'react'

interface Props {
  title: string
}

export const MyComponent = ({ title }: Props) => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  )
}
`)
    })
  })
})
