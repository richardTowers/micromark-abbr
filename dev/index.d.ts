/** @this {any} */
export default function remarkAbbr(this: any): void
export {abbrFromMarkdown as mdastUtilAbbrFromMarkdown} from './lib/mdast-util-abbr/index.js'
export {
  abbr as micromarkAbbr,
  abbrTypes as micromarkAbbrTypes,
} from './lib/micromark-extension-abbr/syntax.js'
