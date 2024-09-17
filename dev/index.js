/// <reference types="./lib/mdast-util-abbr/types/index.js" />
/// <reference types="./lib/micromark-extension-abbr/types/index.js" />

/** @import { Processor } from "unified" */
import {abbr} from './lib/micromark-extension-abbr/syntax.js'
import {abbrFromMarkdown} from './lib/mdast-util-abbr/index.js'

export {
  abbr as micromarkAbbr,
  abbrTypes as micromarkAbbrTypes,
} from './lib/micromark-extension-abbr/syntax.js'
export {
  abbrFromMarkdown as mdastUtilAbbrFromMarkdown,
  abbrToMarkdown as mdastUtilAbbrToMarkdown,
} from './lib/mdast-util-abbr/index.js'

/** @this {Processor} */
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
