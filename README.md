# remark-abbr

[![Build][build-badge]][build]

**[remark][]** plugin to support [abbreviations][], in the style of [PHP Markdown Extra][php-markdown-extra] and [Kramdown][kramdown].

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(remarkAbbr)`](#unifieduseremarkabbr)
*   [Authoring](#authoring)
*   [HTML](#html)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [Licence](#licence)

## What is this?

This package is a [unified][] ([remark][]) plugin which extends markdown to support
abbreviations:

```
The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]:  World Wide Web Consortium
```

You can use this plugin to add support for parsing abbreviation definitions and
abbreviation calls.

Rendering the syntax tree to HTML is handled by [remark-rehype][], but note that you currently have to manually unset its handler for abbrDefinitions to avoid empty divs in the output:

```js
  .use(remarkRehype, {
    handlers: {
      // Prevent empty divs
      abbrDefinition: () => undefined,
    },
  })
```

## When should I use this?

The abbreviation syntax supported by this plugin (and [PHP Markdown
Extra][php-markdown-extra] and [Kramdown][kramdown]) is a bit unusual and
ambiguous - there's no hint to the parser that `HTML` might be an abbreviation
until it sees the definition.

If you don't already have a large body of markdown using abbreviations,
you're probably better using directives, like in [remark-directive][] instead.

If you need to support abbreviations in this style for whatever reason, and
can't use a less ambiguous syntax like directives, then this plugin is for you.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install @richardtowers/remark-abbr
```

You should be able to use [esmsh][] in other environments like the browser,
but this hasn't been tested.

```html
<script type="module">
  import remarkAbbr from 'https://esm.sh/@richardtowers/remark-abbr@0.0.0?bundle'
</script>
```

## Use

Say our document `example.md` contains:

```markdown
The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]:  World Wide Web Consortium
```

…and our module `example.js` contains:

```js
import rehypeStringify from 'rehype-stringify'
import remarkAbbr from '@richardtowers/remark-abbr'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {read} from 'to-vfile'
import {unified} from 'unified'

const file = await unified()
  .use(remarkParse)
  .use(remarkAbbr)
  .use(remarkRehype, {
    handlers: {
      abbrDefinition: () => undefined,
    },
  })
  .use(rehypeStringify)
  .process(await read('example.md'))

console.log(String(file))
```

…then running `node example.js` yields:

```html
<p>The <abbr title="Hyper Text Markup Language">HTML</abbr> specification is maintained by the <abbr title="World Wide Web Consortium">W3C</abbr>.</p>
```

## API

This package exports `micromarkAbbr`, `micromarkAbbrTypes`,
`mdastUtilAbbrFromMarkdown`, and `mdastUtilAbbrToMarkdown`, which are used
internally. Use them directly at your own risk.

The default export is `remarkAbbr`.

### `unified().use(remarkAbbr)`

Add support for abbreviations.

## Authoring

Be careful with the use of abbreviations. Every instance will be expanded,
so you can create a lot of noise for users by doing silly things like:

```
foo and bar and baz and biz

*[and]: a conjunction between two words, true if both words are true
```

## HTML

This plugin does not handle how markdown is turned to HTML.
See [`remark-rehype`][remark-rehype] for how that happens and how to change it.

As mentioned above, to avoid empty divs being rendered for abbreviationDefinitions, you must unset the handler for these nodes:

```js
  .use(remarkRehype, {
    handlers: {
      // Prevent empty divs
      abbrDefinition: () => undefined,
    },
  })
```

## Types

This package is fully typed with [TypeScript][].

## Compatibility

Tested with the current version of node, and the last two LTS releases.

Compatibility with other environments is best effort.

## Security

If untrusted input is included in the markdown parsed by this plugin, you should
consider the possibility that an annoying user will define every word as an
abbreviation, resulting in rubbish output.

## Related

*   [`remark-directive`](https://github.com/remarkjs/remark-directive)
    — support directives

## Contribute

PRs and issues welcome. I can't promise a great support experience though.

## Licence

[MIT][licence] © [Richard Towers][author]

<!-- Definitions -->

[build-badge]: https://github.com/richardtowers/remark-abbr/workflows/main/badge.svg

[build]: https://github.com/richardtowers/remark-abbr/actions

[abbreviations]: https://michelf.ca/projects/php-markdown/extra/#abbr

[php-markdown-extra]: https://michelf.ca/projects/php-markdown/extra/

[kramdown]: https://kramdown.gettalong.org/

[remark-directive]: https://github.com/remarkjs/remark-directive

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[licence]: LICENCE

[author]: https://richard-towers.com

[hast]: https://github.com/syntax-tree/hast

[mdast-util-from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown

[micromark]: https://github.com/micromark/micromark

[rehype]: https://github.com/rehypejs/rehype

[remark]: https://github.com/remarkjs/remark

[remark-rehype]: https://github.com/remarkjs/remark-rehype

[typescript]: https://www.typescriptlang.org

[unified]: https://github.com/unifiedjs/unified

[api-options]: #options
