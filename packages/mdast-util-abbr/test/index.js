import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import test from 'node:test'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {abbr} from 'micromark-extension-abbr-definition-syntax'
import {abbrFromMarkdown} from 'mdast-util-abbr'
import { title } from 'node:process'

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
          title: 'Hyper Text Markup Language',
          children: [],
          position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 36, offset: 35 } }
        }
      ],
      position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 36, offset: 35 } }
    }
    assert.deepEqual(actual, expected)
  })

  await t.test('should support abbreviation calls', async function () {
    const actual = fromMarkdown('I like to use HTML because it is cool\n\n*[HTML]: Hyper Text Markup Language', {
      extensions: [abbr],
      mdastExtensions: [abbrFromMarkdown()]
    })
    const expected = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'I like to use ',
              position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 1, column: 15, offset: 14 }
              }
            },
            {
              type: 'abbr',
              abbr: 'HTML',
              reference: 'Hyper Text Markup Language',
              children: [
                {
                  type: 'text',
                  value: 'HTML',
                  position: {
                    start: { line: 1, column: 15, offset: 14 },
                    end: { line: 1, column: 19, offset: 18 }
                  }
                }
              ],
              data: {
                hName: 'abbr',
                hProperties: {
                  title: 'Hyper Text Markup Language'
                },
              },
              position: {
                start: { line: 1, column: 15, offset: 14 },
                end: { line: 1, column: 19, offset: 18 }
              }
            },
            {
              type: 'text',
              value: ' because it is cool',
              position: {
                start: { line: 1, column: 19, offset: 18 },
                end: { line: 1, column: 38, offset: 37 }
              }
            }
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 38, offset: 37 }
          }
        },
        {
          type: 'abbrDefinition',
          identifier: 'html',
          label: 'HTML',
          title: 'Hyper Text Markup Language',
          children: [],
          position: {
            start: { line: 3, column: 1, offset: 39 },
            end: { line: 3, column: 36, offset: 74 }
          }
        }
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 3, column: 36, offset: 74 }
      }
    }
    assert.deepEqual(actual, expected)
  })
})
