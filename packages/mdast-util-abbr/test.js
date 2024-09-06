import assert from 'node:assert/strict'
import test from 'node:test'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {abbr} from 'micromark-extension-abbr-definition-syntax'
import {abbrFromMarkdown} from 'mdast-util-abbr'

test('core', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('mdast-util-abbr')).sort(),
      ['abbrFromMarkdown']
    )
  })
})

test('abbrFromMarkdown', async function (t) {
  await t.test('should support an abbreviation definition', async function () {
    const actual = fromMarkdown('*[HTML]: Hyper Text Markup Language', {
      extensions: [abbr],
      mdastExtensions: [abbrFromMarkdown()]
    })
    const expected = {
      type: 'root',
      children: [
        {
          type: 'abbrDefinition',
          identifier: 'a',
          label: 'a',
          children: [
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 4, column: 6, offset: 16 }
          }
        }
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 4, column: 6, offset: 16 }
      }
    }
    assert.deepEqual(actual, expected)
  })
})
