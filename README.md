# micromark-extension-abbr

[micromark][] extensions to support [abbreviations in the style of PHP's Markdown Extra](https://michelf.ca/projects/php-markdown/extra/#abbr)

**Status:** Work in progress / Not ready for publishing to npm

## Contents

* [What is this?](#what-is-this)
* [When to use this](#when-to-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
* [Bugs](#bugs)
* [Authoring](#authoring)
* [HTML](#html)
* [CSS](#css)
* [Syntax](#syntax)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
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
Without this condition, production code is loaded.

## Bugs

Plenty, I'm sure.

## Authoring

It’s recommended to place abbreviation definitions at the bottom of the document.

## Types

This package will eventually have some types.

## Compatibility

Best efforts

## Related

* [`micromark-extension-gfm`][micromark-extension-gfm]
  — support all of GFM

## License

MIT © Richard Towers