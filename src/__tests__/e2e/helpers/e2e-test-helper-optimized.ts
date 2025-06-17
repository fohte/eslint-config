import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export interface TestFile {
  path: string
  content: string
}

export interface E2ETestOptions {
  files: TestFile[]
  eslintArgs?: string[]
}

export interface ESLintMessage {
  ruleId: string | null
  severity: number
  message: string
  line: number
  column: number
  nodeType: string
  endLine?: number
  endColumn?: number
  fix?: {
    range: [number, number]
    text: string
  }
}

export interface ESLintResult {
  filePath: string
  messages: ESLintMessage[]
  errorCount: number
  warningCount: number
  fixableErrorCount: number
  fixableWarningCount: number
  output?: string
  source?: string
}

export type ESLintOutput = ESLintResult[]

const TEST_PROJECT_PREFIX = 'eslint-config-e2e-test-'

// Cached values for performance
let isBuilt = false
let baseTestDir: string | null = null
let nodeModulesPath: string | null = null

/**
 * Ensures the package is built (one-time check)
 */
function ensureBuilt(): void {
  if (isBuilt) return

  const libPath = join(process.cwd(), 'lib')
  if (!existsSync(libPath)) {
    execSync('npm run build', { cwd: process.cwd(), stdio: 'pipe' })
  }

  isBuilt = true
}

/**
 * Creates a base test directory with common setup (one-time)
 */
function createBaseTestDir(): string {
  if (baseTestDir && existsSync(baseTestDir)) {
    return baseTestDir
  }

  baseTestDir = mkdtempSync(join(tmpdir(), `${TEST_PROJECT_PREFIX}base-`))

  // Create symlink to node_modules once
  nodeModulesPath = join(process.cwd(), 'node_modules')
  execSync(`ln -s ${nodeModulesPath} ${baseTestDir}/node_modules`, { stdio: 'pipe' })

  return baseTestDir
}

/**
 * Creates a test project subdirectory with the specified files
 */
export async function createTestProject(options: E2ETestOptions): Promise<string> {
  ensureBuilt()
  const baseDir = createBaseTestDir()

  // Create a unique subdirectory for this test
  const testId = Math.random().toString(36).substring(7)
  const projectDir = join(baseDir, `test-${testId}`)
  execSync(`mkdir -p "${projectDir}"`)

  // Get the library directory path (built files)
  const libPath = join(process.cwd(), 'lib')

  // Create package.json
  const packageJson = {
    name: 'test-project',
    type: 'module'
  }

  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  )

  // Create symlink to node_modules from base directory
  execSync(`ln -s ${baseDir}/node_modules ${projectDir}/node_modules`, { stdio: 'pipe' })

  // Create eslint.config.js
  const eslintConfig = `import { mainConfig, typescriptConfig } from '${libPath}/index.js'

export default [
  ...mainConfig,
  ...typescriptConfig,
]`

  writeFileSync(
    join(projectDir, 'eslint.config.js'),
    eslintConfig + '\n'
  )

  // Create test files
  for (const file of options.files) {
    const filePath = join(projectDir, file.path)
    const dir = join(filePath, '..')

    // Ensure directory exists
    execSync(`mkdir -p "${dir}"`)

    writeFileSync(filePath, file.content)
  }

  return projectDir
}

/**
 * Runs ESLint using optimized subprocess execution
 * Note: ESLint v8 API doesn't support flat config properly when set via environment variable
 */
export async function runESLint(
  projectDir: string,
  args: string[] = []
): Promise<ESLintOutput> {
  // For ESLint v8, we need to use execSync with ESLINT_USE_FLAT_CONFIG
  // but we can optimize by avoiding npx overhead
  const eslintPath = join(process.cwd(), 'node_modules', '.bin', 'eslint')
  const eslintArgs = [
    eslintPath,
    '--format=json',
    ...args,
    '.'
  ]

  try {
    const output = execSync(eslintArgs.join(' '), {
      cwd: projectDir,
      encoding: 'utf-8',
      stdio: 'pipe',
      env: { ...process.env, ESLINT_USE_FLAT_CONFIG: 'true' }
    })

    return JSON.parse(output) as ESLintOutput
  } catch (error: unknown) {
    // ESLint exits with code 1 when there are linting errors
    if (error && typeof error === 'object' && 'stdout' in error && typeof error.stdout === 'string') {
      return JSON.parse(error.stdout) as ESLintOutput
    }
    throw error
  }
}

/**
 * Cleans up a test project directory
 */
export function cleanupTestProject(projectDir: string): void {
  // Only remove the test subdirectory, not the base directory
  if (projectDir.includes('/test-')) {
    rmSync(projectDir, { recursive: true, force: true })
  }
}

/**
 * Cleans up all test resources (call this in global teardown)
 */
export function cleanupAllTests(): void {
  // Remove base test directory
  if (baseTestDir && existsSync(baseTestDir)) {
    rmSync(baseTestDir, { recursive: true, force: true })
    baseTestDir = null
  }
}

/**
 * Assertion helper to check if a specific rule was triggered
 */
export function expectRule(output: ESLintOutput, ruleId: string): void {
  const hasRule = output.some(result =>
    result.messages.some(message => message.ruleId === ruleId)
  )

  if (!hasRule) {
    throw new Error(`Expected rule "${ruleId}" to be triggered, but it was not found`)
  }
}

/**
 * Assertion helper to check for no errors
 */
export function expectNoErrors(output: ESLintOutput): void {
  const totalErrors = output.reduce((sum, result) => sum + result.errorCount, 0)

  if (totalErrors > 0) {
    const errorMessages = output.flatMap(result =>
      result.messages
        .filter(msg => msg.severity === 2)
        .map(msg => `  ${result.filePath}: ${msg.message} (${msg.ruleId})`)
    ).join('\n')

    throw new Error(`Expected no errors, but found ${totalErrors}:\n${errorMessages}`)
  }
}

/**
 * Assertion helper to check if a file was fixed correctly
 */
export function expectFixed(
  projectDir: string,
  filePath: string,
  expected: string
): void {
  const fullPath = join(projectDir, filePath)
  const actual = readFileSync(fullPath, 'utf-8')

  if (actual !== expected) {
    throw new Error(
      `File "${filePath}" was not fixed as expected.\n` +
      `Expected:\n${expected}\n` +
      `Actual:\n${actual}`
    )
  }
}

/**
 * Gets all messages for a specific rule from the output
 */
export function getMessagesForRule(
  output: ESLintOutput,
  ruleId: string
): ESLintMessage[] {
  return output.flatMap(result =>
    result.messages.filter(message => message.ruleId === ruleId)
  )
}

/**
 * Test wrapper that automatically cleans up the test project
 */
export async function withTestProject<T>(
  options: E2ETestOptions,
  testFn: (projectDir: string) => Promise<T>
): Promise<T> {
  const projectDir = await createTestProject(options)

  try {
    return await testFn(projectDir)
  } finally {
    cleanupTestProject(projectDir)
  }
}
