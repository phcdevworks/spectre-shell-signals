import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

function propose(section: string) {
  const root = mkdtempSync(join(tmpdir(), 'signals-release-'))
  try {
    mkdirSync(join(root, 'scripts'))
    const script = join(root, 'scripts/propose-version.ts')
    copyFileSync(fileURLToPath(new URL('../scripts/propose-version.ts', import.meta.url)), script)
    writeFileSync(join(root, 'package.json'), JSON.stringify({ type: 'module', version: '1.4.2' }))
    writeFileSync(
      join(root, 'CHANGELOG.md'),
      `## [Unreleased]\n\n${section}\n\n## [1.4.2]\n\nContract change type: breaking\n`
    )
    return spawnSync(process.execPath, ['--experimental-strip-types', script], { encoding: 'utf8' })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

describe('release proposal CLI', () => {
  it.each([
    ['fix', 'patch', '1.4.3'],
    ['additive', 'minor', '1.5.0'],
    ['semantic change', 'minor', '1.5.0'],
    ['breaking', 'major', '2.0.0'],
  ])('proposes the correct version for %s', (classification, bump, version) => {
    const result = propose(
      `Contract change type: ${classification}\n\n### Fixed\n\n- Example change.`
    )
    expect(result.status).toBe(0)
    expect(result.stdout).toContain(`Bump type       : ${bump}`)
    expect(result.stdout).toContain(`Proposed version: ${version}`)
  })

  it('does not release an empty section or classify it from past releases', () => {
    const result = propose('')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('No version bump needed.')
  })

  it.each([
    '### Fixed\n- Missing classification.',
    'Contract change type: fixes',
    'Contract change type: unknown',
  ])('rejects invalid release notes: %s', (section) => {
    const result = propose(section)
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Expected: Contract change type:')
  })
})
