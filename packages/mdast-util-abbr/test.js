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
          identifier: 'html',
          label: 'HTML',
          children: [
            {
              // TODO parse this properly
              type: 'text',
              value: 'Hyper Text Markup Language',
              position: {
                start: { line: 1, column: 10, offset: 9 },
                end: { line: 1, column: 36, offset: 35 },
              }
            }
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 36, offset: 35 }
          }
        }
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 36, offset: 35 }
      }
    }
    assert.deepEqual(actual, expected)
  })
})
