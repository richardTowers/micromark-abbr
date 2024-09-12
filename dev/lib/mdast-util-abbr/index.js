/**
 * @import {
 *   CompileContext,
 *   Extension as FromMarkdownExtension,
 *   Handle as FromMarkdownHandle
 * } from 'mdast-util-from-markdown'
 * @import {
 *   Literal,
 *   Node
 * } from 'unist'
 */

import {SKIP, CONTINUE, visit} from 'unist-util-visit'
import {ok as assert} from 'devlop'
import {abbrTypes} from '../micromark-extension-abbr/syntax.js'

/**
 *
 * @param {Literal} textNode
 * @param {{label: string, title: string}[]} abbreviations
 * @returns {Node[]}
 */
function splitTextByAbbr(textNode, abbreviations) {
  // Technically, there can be multiple abbreviation definitions
  // with the same label. In this case, the last one should win.
  // We can achieve this by creating a map with the label as the key
  // and then getting the values
  const uniqueAbbreviationMap = new Map()
  for (const abbreviation of abbreviations) {
    uniqueAbbreviationMap.set(abbreviation.label, abbreviation)
  }

  const uniqueAbbreviations = uniqueAbbreviationMap.values().toArray()

  const matches = uniqueAbbreviations
    .map((abbr) => [abbr, textNode.value.indexOf(abbr.label)])
    .filter(([_abbr, index]) => index >= 0)
    .map(([abbr, index]) => {
      const start = index
      const end = index + abbr.label.length - 1
      return {
        abbr,
        start,
        end,
        prevChar: textNode.value[start - 1],
        nextChar: textNode.value[end + 1],
      }
    })
    .filter((match) =>
      // We don't want to match "HTML" inside strings like "HHHHTMLLLLLL", so check that the
      // surrounding characters are either undefined (i.e. start of string / end of string)
      // or non-word characters
      [match.prevChar, match.nextChar].every(
        (c) => c === undefined || /^\W$/.test(c),
      ),
    )
    .sort((l, r) => l.start - r.start)

  if (matches.length === 0) {
    return [textNode]
  }

  const nodes = []
  let currentIndex = 0
  for (const match of matches) {
    if (match.start > currentIndex) {
      nodes.push({
        type: 'text',
        value: textNode.value.slice(currentIndex, match.start),
        position: {
          start: {
            line: textNode.position.start.line,
            column: textNode.position.start.column + currentIndex,
            offset: textNode.position.start.offset + currentIndex,
          },
          end: {
            line: textNode.position.start.line,
            column: textNode.position.start.column + match.start,
            offset: textNode.position.start.offset + match.start,
          },
        },
      })
    }

    const abbrPosition = {
      start: {
        line: textNode.position.start.line,
        column: textNode.position.start.column + match.start,
        offset: textNode.position.start.offset + match.start,
      },
      end: {
        line: textNode.position.end.line,
        column: textNode.position.start.column + match.end + 1,
        offset: textNode.position.start.offset + match.end + 1,
      },
    }

    nodes.push({
      type: 'abbr',
      abbr: match.abbr.label,
      reference: match.abbr.title,
      children: [
        {type: 'text', value: match.abbr.label, position: abbrPosition},
      ],
      data: {
        hName: 'abbr',
        hProperties: {
          title: match.abbr.title,
        },
      },
      position: abbrPosition,
    })

    // Move the position forwards
    currentIndex = match.end + 1
  }

  // If the final abbreviation wasn't at the very end of the value,
  // add one final text node with the remainder of the value
  if (currentIndex < textNode.value.length) {
    nodes.push({
      type: 'text',
      value: textNode.value.slice(currentIndex),
      position: {
        start: {
          line: textNode.position.start.line,
          column: textNode.position.start.column + currentIndex,
          offset: textNode.position.start.offset + currentIndex,
        },
        end: {
          line: textNode.position.start.line,
          column: textNode.position.end.column,
          offset: textNode.position.end.offset,
        },
      },
    })
  }

  return nodes
}

/**
 * Create an extension for `mdast-util-from-markdown` to enable abbreviations
 * in markdown.
 *
 * @returns {FromMarkdownExtension}
 *   Extension for `mdast-util-from-markdown`.
 */
export function abbrFromMarkdown() {
  return {
    enter: {
      abbrDefinition: enterAbbrDefinition,
      abbrDefinitionLabel: enterAbbrDefinitionLabel,
      abbrDefinitionValueString: enterAbbrDefinitionValueString,
    },
    exit: {
      abbrDefinition: exitAbbrDefinition,
      abbrDefinitionLabel: exitAbbrDefinitionLabel,
      abbrDefinitionValueString: exitAbbrDefinitionValueString,
    },
    transforms: [
      (tree) => {
        // Find the abbrDefinitions - they'll be at the top level
        const abbrDefinitions = tree.children.filter(
          (x) => x.type === abbrTypes.abbrDefinition,
        )
        if (abbrDefinitions.length === 0) {
          return tree
        }

        visit(tree, null, (node, index, parent) => {
          // Don't recurse into abbrDefinitions
          if (node.type === abbrTypes.abbrDefinition) {
            return SKIP
          }

          if (node.type === 'text' && parent.type !== 'abbr') {
            const newNodes = splitTextByAbbr(node, abbrDefinitions)
            parent.children.splice(index, 1, ...newNodes)
            return SKIP
          }

          return CONTINUE
        })
      },
    ],
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  function enterAbbrDefinition(token) {
    this.enter({type: abbrTypes.abbrDefinition, label: '', children: []}, token)
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  function enterAbbrDefinitionLabel() {
    this.buffer()
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  function exitAbbrDefinitionLabel() {
    const label = this.resume()
    const node = this.stack[this.stack.length - 1]
    assert(node.type === abbrTypes.abbrDefinition)
    node.label = label
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  function enterAbbrDefinitionValueString() {
    this.buffer()
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  function exitAbbrDefinitionValueString() {
    const node = this.stack.find(
      (node) => node.type === abbrTypes.abbrDefinition,
    )
    assert(node, 'expected to find an abbrDefinition node in the stack')
    node.title = this.resume()
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  function exitAbbrDefinition(token) {
    this.exit(token)
  }
}
