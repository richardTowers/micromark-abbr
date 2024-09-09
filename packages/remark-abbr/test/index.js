import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import test from 'node:test'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkAbbr from 'remark-abbr'

test('fixtures', async function (t) {
  const base = new URL('fixtures/', import.meta.url)

  const files = await fs.readdir(base)
  const extension = '.md'

  for (const d of files) {
    if (!d.endsWith(extension)) {
      continue
    }

    const name = d.slice(0, -extension.length)

    await t.test(name, async function () {
      const input = await fs.readFile(new URL(name + '.md', base))
      const expected = String(await fs.readFile(new URL(name + '.html', base)))
      const actualVFile = await unified()
        .use(remarkParse)
        .use(remarkAbbr)
        .use(remarkRehype, {
          handlers: {
            // Prevent empty divs
            // TODO - is there a way to get remarkAbbr to add this? Or to make it not needed?
            'abbrDefinition': () => undefined
          }
        })
        .use(rehypeStringify)
        .process(input)
      
      let actual = String(actualVFile)

      if (actual && !/\n$/.test(actual)) {
        actual += '\n'
      }

      assert.equal(actual, expected)
    }) 
  }
})
