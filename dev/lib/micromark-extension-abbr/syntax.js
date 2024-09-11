/**
 * @import {
 *   ConstructRecord,
 *   Extension,
 *   Tokenizer
 * } from 'micromark-util-types'
 */
import { codes, types } from "micromark-util-symbol"
import { factoryWhitespace } from 'micromark-factory-whitespace'
import { factoryLabel } from "micromark-factory-label"
import { ok as assert } from 'devlop'
import { markdownLineEnding, markdownLineEndingOrSpace } from 'micromark-util-character'

export const abbrTypes = {
  abbrDefinition: 'abbrDefinition',
  abbrDefinitionLabel: 'abbrDefinitionLabel',
  abbrDefinitionMarker: 'abbrDefinitionMarker',
  abbrDefinitionString: 'abbrDefinitionString',
  abbrDefinitionValueString: 'abbrDefinitionValueString',
}

/**
 * @type {Tokenizer}
 */
function abbrDefinitionTokenize(effects, ok, nok) {
  const self = this

  return start

  // *[HTML]: Hyper Text Markup Language
  // ^
  function start(code) {
    assert(code === codes.asterisk, 'expected `*`')
    effects.enter(abbrTypes.abbrDefinition)
    effects.consume(code)
    return abbrKeyDefinition
  }

  // *[HTML]: Hyper Text Markup Language
  //  ^
  function abbrKeyDefinition(code) {
    if (code == codes.leftSquareBracket) {
      return factoryLabel.call(
        self,
        effects,
        abbrKeyValueSeparator,
        nok,
        abbrTypes.abbrDefinitionLabel,
        abbrTypes.abbrDefinitionMarker,
        abbrTypes.abbrDefinitionString,
      )(code)
    }
    else {
      return nok(code)
    }
  }

  // *[HTML]: Hyper Text Markup Language
  //        ^ 
  function abbrKeyValueSeparator(code) {
    if (code === codes.colon) {
      effects.enter(abbrTypes.abbrDefinitionMarker)
      effects.consume(code)
      effects.exit(abbrTypes.abbrDefinitionMarker)
      return abbrKeyValueSeparatorAfter
    }
    else {
      return nok(code)
    }
  }

  function abbrKeyValueSeparatorAfter(code) {
    // Note: whitespace is optional.
    const isSpace = markdownLineEndingOrSpace(code)
    return isSpace
      ? factoryWhitespace(effects, abbrValueStart)(code)
      : abbrValueStart(code)
  }

  // *[HTML]: Hyper Text Markup Language
  //          ^
  function abbrValueStart(code) {
    effects.enter(abbrTypes.abbrDefinitionValueString)
    effects.enter(types.chunkString, { contentType: 'string' })
    return abbrValue(code)
  }

  // *[HTML]: Hyper Text Markup Language
  //          ^^^^^^^^^^^^^^^^^^^^^^^^^^
  function abbrValue(code) {
    if (markdownLineEnding(code) || code === codes.eof) {
      effects.exit(types.chunkString)
      effects.exit(abbrTypes.abbrDefinitionValueString)
      effects.exit(abbrTypes.abbrDefinition)
      return ok(code)
    }

    effects.consume(code)
    return abbrValue
  }
}

/**
 * @type {ConstructRecord}
 */
const contentInitial = {
  [codes.asterisk]: {
    name: 'abbrDefinition',
    tokenize: abbrDefinitionTokenize,
  }
}

/**
 * @type {Extension}
 */
export const abbr = {
  contentInitial
}