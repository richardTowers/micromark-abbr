import {abbr} from './lib/micromark-extension-abbr/syntax.js'
import {abbrFromMarkdown} from './lib/mdast-util-abbr/index.js'

export {
  abbr as micromarkAbbr,
  abbrTypes as micromarkAbbrTypes,
} from './lib/micromark-extension-abbr/syntax.js'
export {abbrFromMarkdown as mdastUtilAbbrFromMarkdown} from './lib/mdast-util-abbr/index.js'

/**
 * @this {any}
 */
export default function remarkAbbr() {
  const self = this
  const data = self.data()

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = [])
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = [])

  micromarkExtensions.push(abbr)
  fromMarkdownExtensions.push(abbrFromMarkdown())
}
