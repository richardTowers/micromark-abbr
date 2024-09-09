import { abbr } from 'micromark-extension-abbr-definition-syntax'
import { abbrFromMarkdown } from 'mdast-util-abbr'

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