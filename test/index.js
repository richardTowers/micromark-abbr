import fs from 'node:fs/promises'
import {micromark} from 'micromark'

import assert from 'node:assert/strict'
import test from 'node:test'

import {variables, variablesHtml} from 'micromark-extension-abbr'


await test('micromark-extension-abbr', async () => {
  await test('fixtures', async function (t) {
    const base = new URL('fixtures/', import.meta.url)

    const htmlExtension = variablesHtml({firstPlanet: 'mercury', 'secondPla}net': 'venus', 'thirdPla}net': 'earth'})

    const files = await fs.readdir(base)
    const extension = '.md'

    for (const d of files) {
      if (!d.endsWith(extension)) {
        continue
      }

      const name = d.slice(0, -extension.length)

      await t.test(name, async function () {
        const input = await fs.readFile(new URL(name + '.md', base))
        let expected = String(await fs.readFile(new URL(name + '.html', base)))
        const actual = micromark(input, {extensions: [variables], htmlExtensions: [htmlExtension]})

        if (actual && !/\n$/.test(actual)) {
          actual += '\n'
        }

        assert.equal(actual, expected)
      })
    }
  })
})
