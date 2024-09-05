# micromark-extension-abbr

[micromark][] extensions to support abbreviations in the style of [PHP's Markdown Extra][php-markdown-extra] and [Kramdown][kramdown-abbreviations].

**Status:** Work in progress / Not ready for publishing to npm

## Contents

* [What is this?](#what-is-this)
* [When to use this](#when-to-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
* [Bugs](#bugs)
* [Authoring](#authoring)
* [Types](#types)
* [Compatibility](#compatibility)
* [Related](#related)
* [License](#license)

## What is this?

This package contains extensions that add support for [abbreviations in the style of PHP's Markdown Extra](https://michelf.ca/projects/php-markdown/extra/#abbr) to micromark.

## When to use this

This project is useful when you want to support abbreviations in markdown.

You can use these extensions when you are working with [`micromark`][micromark].

There's no support for syntax trees or remark just yet.

## Install

This package is not published yet.

## Use

Say our document `example.md` contains:

````markdown
The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]:  World Wide Web Consortium

````

…and our module `example.js` looks as follows:

```js
import fs from 'node:fs/promises'
import {micromark} from 'micromark'
import {abbr, abbrHtml} from 'micromark-extension-gfm-footnote'

const output = micromark(await fs.readFile('example.md'), {
  extensions: [abbr],
  htmlExtensions: [abbrHtml]
})

console.log(output)
```

…now running `node example.js` yields:

```html
<p>The <abbr title="Hyper Text Markup Language">HTML</abbr> specification is maintained by the <abbr title="World Wide Web Consortium">W3C</abbr>.</p>
```

## API

This package exports the identifiers `abbr` and `abbrHtml`.
There is no default export.

The export map supports the [`development` condition][development].
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded. (TODO - eventually)

## Bugs

Plenty, I'm sure.

## Authoring

It’s recommended to place abbreviation definitions at the bottom of the document.

## Types

This package will eventually have some types.

## Compatibility

Best efforts

## Related

* [`micromark-extension-gfm`][micromark-extension-gfm] — support all of GFM
* [`mdast-util-gfm-footnote`][mdast-util-gfm-footnote] — converting GFM footnotes into markdown AST

## License

[MIT][licence] © Richard Towers

[licence]: LICENCE

[development]: https://nodejs.org/api/packages.html#packages_resolving_user_conditions

[micromark]: https://github.com/micromark/micromark

[micromark-extension-gfm]: https://github.com/micromark/micromark-extension-gfm

[mdast-util-gfm-footnote]: https://github.com/syntax-tree/mdast-util-gfm-footnote

[php-markdown-extra]: https://michelf.ca/projects/php-markdown/extra/#abbr

[kramdown-abbreviations]: https://kramdown.gettalong.org/syntax.html#abbreviations