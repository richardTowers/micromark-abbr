import { abbr } from './lib/micromark-extension-abbr/syntax.js'
import { abbrFromMarkdown } from './lib/mdast-util-abbr/index.js'

export { abbr as micromarkAbbr, abbrTypes as micromarkAbbrTypes } from './lib/micromark-extension-abbr/syntax.js'
export { abbrFromMarkdown as mdastUtilAbbrFromMarkdown } from './lib/mdast-util-abbr/index.js'

export default function remarkAbbr(options) {
  const self = this
  const data = self.data()

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = [])
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = [])
  const rehmarkRehypeOptions = data.options || (data.options = {})

  micromarkExtensions.push(abbr)
  fromMarkdownExtensions.push(abbrFromMarkdown())
  
}