/**
 * @typedef {import('mdast').FootnoteDefinition} FootnoteDefinition
 * @typedef {import('mdast').FootnoteReference} FootnoteReference
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 * @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
 * @typedef {import('mdast-util-to-markdown').Map} Map
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
 */

import { normalizeIdentifier } from "micromark-util-normalize-identifier"

/**
 * Create an extension for `mdast-util-from-markdown` to enable abbreviations
 * in markdown.
 *
 * @returns {FromMarkdownExtension}
 *   Extension for `mdast-util-from-markdown`.
 */
export function abbrFromMarkdown() {
  // TODO - how to do abbrCalls :thinking:

  return {
    enter: {
      abbrDefinition: enterAbbrDefinition,
      abbrDefinitionLabelString: enterAbbrDefinitionLabelString,
    },
    exit: {
      abbrDefinition: exitAbbrDefinition,
      abbrDefinitionLabelString: exitAbbrDefinitionLabelString,
    }
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
  function exitAbbrDefinition(token) {
    this.exit(token)
  }

}