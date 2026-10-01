import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadConfigFromFile, resolveConfig } from 'vite'

test('Vite resolves the configured React plugin', async () => {
  const loaded = await loadConfigFromFile({ command: 'build', mode: 'production' }, undefined, process.cwd())
  assert.ok(loaded, 'Vite config should load')

  const resolved = await resolveConfig(loaded.config, 'build', 'production')
  assert.ok(resolved.plugins.some((plugin) => plugin.name.includes('react')))
})
