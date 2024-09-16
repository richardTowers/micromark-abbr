/**
 * @import {
 *   CompileContext,
 *   Extension as FromMarkdownExtension,
 *   Handle as FromMarkdownHandle
 * } from 'mdast-util-from-markdown'
 * @import {
 *   Options as ToMarkdownExtension,
 *   Handle as ToMarkdownHandle
 * } from 'mdast-util-to-markdown'
 * @import {
 *   Point,
 * } from 'unist'
 * @import {
 *   Text,
 * } from 'mdast'
 * @import {
 *   Abbr,
 *   AbbrDefinition,
 * } from './types/index.js'
 */

import {SKIP, CONTINUE, visit} from 'unist-util-visit'
import {ok as assert} from 'devlop'
import {abbrTypes} from '../micromark-extension-abbr/syntax.js'

/**
 *
 * @param {Text} textNode
 * @param {AbbrDefinition[]} abbrDefinitions
 * @returns {(Text|Abbr)[]}
 */
function splitTextByAbbr(textNode, abbrDefinitions) {
  /**
   * Technically, there can be multiple abbreviation definitions
   * with the same label. In this case, the last one should win.
   * We can achieve this by creating a map with the label as the key
   * and then getting the values
   * @type {Map<string, AbbrDefinition>}
   */
  const uniqueAbbreviationMap = new Map()
  for (const abbreviation of abbrDefinitions) {
    uniqueAbbreviationMap.set(abbreviation.identifier, abbreviation)
  }

  const uniqueAbbreviations = [...uniqueAbbreviationMap.values()]

  const matches = uniqueAbbreviations
    .map(
      (abbr) =>
        /** @type {const} */ ([abbr, textNode.value.indexOf(abbr.identifier)]),
    )
    .filter(([_abbr, index]) => index >= 0)
    .map(([abbr, index]) => {
      const start = index
      const end = index + abbr.identifier.length - 1
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
        ...textNode,
        value: textNode.value.slice(currentIndex, match.start),
        position: textNode.position && {
          start: updatePoint(textNode.position.start, currentIndex),
          end: updatePoint(textNode.position.start, match.start),
        },
      })
    }

    const abbrPosition = textNode.position && {
      start: updatePoint(textNode.position.start, match.start),
      end: updatePoint(textNode.position.start, match.end + 1),
    }
    /** @type {Abbr} */
    const abbr = {
      type: 'abbr',
      value: match.abbr.value,
      identifier: match.abbr.identifier,
      data: {
        hName: 'abbr',
        hProperties: {
          title: match.abbr.value,
        },
        hChildren: [{type: 'text', value: match.abbr.identifier}],
      },
      position: abbrPosition,
    }
    nodes.push(abbr)

    // Move the position forwards
    currentIndex = match.end + 1
  }

  // If the final abbreviation wasn't at the very end of the value,
  // add one final text node with the remainder of the value
  if (currentIndex < textNode.value.length) {
    nodes.push({
      ...textNode,
      value: textNode.value.slice(currentIndex),
      position: textNode.position && {
        start: updatePoint(textNode.position.start, currentIndex),
        end: updatePoint(textNode.position.end, 0),
      },
    })
  }

  return nodes

  /**
   *
   * @param {Point} point
   * @param {number} increment
   * @returns {Point}
   */
  function updatePoint(point, increment) {
    return {
      line: point.line,
      column: point.column + increment,
      offset:
        point.offset === undefined
          ? /* c8 ignore next */ undefined
          : point.offset + increment,
    }
  }
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
        /**
         * Find the abbrDefinitions - they'll be at the top level
         * @type {AbbrDefinition[]}
         */
        // @ts-ignore - typescript doesn't believe that RootContent nodes can be AbbrDefinitions
        const abbrDefinitions = tree.children.filter(
          (x) => x.type === abbrTypes.abbrDefinition,
        )
        if (abbrDefinitions.length === 0) {
          return tree
        }

        visit(tree, null, (node, index, parent) => {
          if (index === undefined || parent === undefined) {
            return CONTINUE
          }

          if (node.type === 'text') {
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
    this.enter(
      {
        type: abbrTypes.abbrDefinition,
        value: '',
        identifier: '',
      },
      token,
    )
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
    node.identifier = label
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
    /** @type {AbbrDefinition|undefined} */
    // @ts-ignore
    const node = this.stack.find(
      (node) => node.type === abbrTypes.abbrDefinition,
    )
    assert(node, 'expected to find an abbrDefinition node in the stack')
    if (node !== undefined) {
      node.value = this.resume()
    }
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  function exitAbbrDefinition(token) {
    this.exit(token)
  }
}

/**
 * Create an extension for `mdast-util-to-markdown` to enable abbreviations
 * in markdown.
 *
 * @returns {ToMarkdownExtension}
 *   Extension for `mdast-util-to-markdown`.
 */
export function abbrToMarkdown() {
  return {
    handlers: {
      abbr: handleAbbr,
      abbrDefinition: handleAbbrDefinition,
    },
  }

  /**
   * @type {ToMarkdownHandle}
   * @param {Abbr} node
   */
  function handleAbbr(node, _, state, info) {
    return state.safe(node.identifier, info)
  }

  /**
   * @type {ToMarkdownHandle}
   * @param {AbbrDefinition} node
   */
  function handleAbbrDefinition(node, _, state, info) {
    return state.safe(`*[${node.identifier}]: ${node.value}`, info)
  }
}
