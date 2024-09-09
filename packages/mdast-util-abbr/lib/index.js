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

import { normalizeIdentifier } from "micromark-util-normalize-identifier"
import { SKIP, CONTINUE, visit } from "unist-util-visit"

/**
 * 
 * @param {Literal} textNode 
 * @param {{label: string, children: [Literal]}[]} abbreviations 
 * @returns {Node[]}
 */
function splitTextByAbbr(textNode, abbreviations) {
  const { value, position } = textNode;
  const nodes = [];
  let currentIndex = 0;

  // Create a regex to match the abbreviations
  const abbrRegex = new RegExp(`\\b(${abbreviations.map(x => x.label).join('|')})\\b`, 'g');

  let match;
  while ((match = abbrRegex.exec(value)) !== null) {
    const [abbr] = match;
    const abbrStart = match.index;
    const abbrEnd = abbrStart + abbr.length;

    // Add the text before the abbreviation
    if (abbrStart > currentIndex) {
      nodes.push({
        type: 'text',
        value: value.slice(currentIndex, abbrStart),
        position: {
          start: {
            ...position.start,
            column: position.start.column + currentIndex,
            offset: position.start.offset + currentIndex,
          },
          end: {
            ...position.end,
            column: position.start.column + abbrStart,
            offset: position.start.offset + abbrStart,
          }
        }
      });
    }

    // Find the abbrDefinition for this match
    const definition = abbreviations.find(x => x.label === abbr)

    // Add the abbrCall node
    const abbrPosition = {
      start: {
        ...position.start,
        column: position.start.column + abbrStart,
        offset: position.start.offset + abbrStart,
      },
      end: {
        ...position.end,
        column: position.start.column + abbrEnd,
        offset: position.start.offset + abbrEnd,
      }
    }
    nodes.push({
      type: 'abbr',
      abbr,
      reference: definition.title,
      children: [
        { type: 'text', value: abbr, position: abbrPosition }
      ],
      data: {
        hName: 'abbr',
        hProperties: {
          title: definition.title,
        },
      },
      position: abbrPosition
    });

    // Move the current index forward
    currentIndex = abbrEnd;
  }

  // Add the remaining text after the last abbreviation
  if (currentIndex < value.length) {
    nodes.push({
      type: 'text',
      value: value.slice(currentIndex),
      position: {
        start: {
          ...position.start,
          column: position.start.column + currentIndex,
          offset: position.start.offset + currentIndex,
        },
        end: {
          ...position.end,
          column: position.end.column,
          offset: position.end.offset
        }
      }
    });
  }

  return nodes;
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
      abbrDefinitionLabelString: enterAbbrDefinitionLabelString,
      abbrDefinitionValueString: enterAbbrDefinitionValueString,
    },
    exit: {
      abbrDefinition: exitAbbrDefinition,
      abbrDefinitionLabelString: exitAbbrDefinitionLabelString,
      abbrDefinitionValueString: exitAbbrDefinitionValueString,
    },
    transforms: [
      (tree) => {
        // Find the abbrDefinitions - they'll be at the top level
        const abbrDefinitions = tree.children.filter(x => x.type === 'abbrDefinition')
        if (abbrDefinitions.length === 0) { return tree }

        visit(tree, null, (node, index, parent) => {
          // Don't recurse into abbrDefinitions
          if (node.type === 'abbrDefinition') {
            return SKIP
          }
          if (node.type === 'text' && parent.type !== 'abbr') {
            const newNodes = splitTextByAbbr(node, abbrDefinitions)
            parent.children.splice(index, 1, ...newNodes)
            return SKIP
          }
          return CONTINUE
        })
      }
    ]
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  function enterAbbrDefinition(token) {
    this.enter(
      {type: 'abbrDefinition', identifier: '', label: '', children: []},
      token
    )
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  function enterAbbrDefinitionLabelString() {
    this.buffer()
  }

  /**
   * @this {CompileContext}
   * @type {FromMarkdownHandle}
   */
  function exitAbbrDefinitionLabelString(token) {
    const label = this.resume()
    const node = this.stack[this.stack.length - 1]
    // TODO assert(node.type === 'abbrDefinition')
    node.label = label
    node.identifier = normalizeIdentifier(
      this.sliceSerialize(token)
    ).toLowerCase()
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
  function exitAbbrDefinitionValueString(token) {
    const node = this.stack.find(node => node.type === 'abbrDefinition')
    // TODO assert(node is found)
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