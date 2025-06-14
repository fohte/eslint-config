import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, rm, mkdir } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
const testDir = join(__dirname, 'test-project')

describe('ESLint Behavior with Real Files', () => {
  beforeEach(async () => {
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  describe('Import Rules', () => {
    it('should detect unordered imports', async () => {
      const testFile = join(testDir, 'test.js')
      await writeFile(testFile, `
import { z } from 'zod'
import { a } from './a'
import React from 'react'

export function test() {
  return React.createElement('div')
}
`)

      const configFile = join(testDir, 'eslint.config.js')
      await writeFile(configFile, `
import { mainConfig } from '${join(__dirname, '../../lib/index.js')}'
export default mainConfig
`)

      try {
        await execAsync(`npx eslint ${testFile}`, { cwd: testDir })
        expect.fail('ESLint should have reported errors')
      } catch (error: any) {
        expect(error.stdout).toContain('simple-import-sort/imports')
      }
    })

    it('should fix imports with --fix', async () => {
      const testFile = join(testDir, 'test.js')
      await writeFile(testFile, `
import { z } from 'zod'
import React from 'react'
import { useState } from 'react'

export function test() {
  return React.createElement('div')
}
`)

      const configFile = join(testDir, 'eslint.config.js')
      await writeFile(configFile, `
import { mainConfig } from '${join(__dirname, '../../lib/index.js')}'
export default mainConfig
`)

      await execAsync(`npx eslint ${testFile} --fix`, { cwd: testDir })

      const { readFile } = await import('fs/promises')
      const fixedContent = await readFile(testFile, 'utf8')

      // Should combine React imports
      expect(fixedContent).toContain('import React, { useState } from \'react\'')
      // Should not have duplicate React imports
      expect((fixedContent.match(/from 'react'/g) || []).length).toBe(1)
    })

    it('should not error on unused variables', async () => {
      const testFile = join(testDir, 'test.js')
      await writeFile(testFile, `
const unused = 'test'
const alsoUnused = 42

export function test() {
  return 'hello'
}
`)

      const configFile = join(testDir, 'eslint.config.js')
      await writeFile(configFile, `
import { mainConfig } from '${join(__dirname, '../../lib/index.js')}'
export default mainConfig
`)

      const { stdout } = await execAsync(`npx eslint ${testFile}`, { cwd: testDir })
      expect(stdout).toBe('') // No errors
    })
  })

  describe('TypeScript Rules', () => {
    it('should detect explicit any in TypeScript files', async () => {
      const testFile = join(testDir, 'test.ts')
      await writeFile(testFile, `
function processData(data: any): any {
  return data
}

export { processData }
`)

      const configFile = join(testDir, 'eslint.config.js')
      await writeFile(configFile, `
import { mainConfig, typescriptConfig } from '${join(__dirname, '../../lib/index.js')}'
export default [...mainConfig, ...typescriptConfig]
`)

      try {
        await execAsync(`npx eslint ${testFile}`, { cwd: testDir })
        expect.fail('ESLint should have reported errors')
      } catch (error: any) {
        expect(error.stdout).toContain('@typescript-eslint/no-explicit-any')
      }
    })

    it('should parse TypeScript syntax correctly', async () => {
      const testFile = join(testDir, 'test.ts')
      await writeFile(testFile, `
interface User {
  id: number
  name: string
}

export function getUser(): User {
  return { id: 1, name: 'test' }
}
`)

      const configFile = join(testDir, 'eslint.config.js')
      await writeFile(configFile, `
import { mainConfig, typescriptConfig } from '${join(__dirname, '../../lib/index.js')}'
export default [...mainConfig, ...typescriptConfig]
`)

      const { stdout } = await execAsync(`npx eslint ${testFile}`, { cwd: testDir })
      expect(stdout).toBe('') // No errors
    })
  })

  describe('Prettier Compatibility', () => {
    it('should not complain about formatting', async () => {
      const testFile = join(testDir, 'test.js')
      await writeFile(testFile, `
const obj={a:1,b:2,c:3}
const arr=[1,2,3,4,5]

function test(a,b,c){
return a+b+c
}

const single='single'
const double="double"

export { test }
`)

      const configFile = join(testDir, 'eslint.config.js')
      await writeFile(configFile, `
import { mainConfig } from '${join(__dirname, '../../lib/index.js')}'
export default mainConfig
`)

      const { stdout } = await execAsync(`npx eslint ${testFile}`, { cwd: testDir })
      expect(stdout).toBe('') // No formatting errors
    })
  })
})
