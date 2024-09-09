/**
 * @import {
 *   ConstructRecord,
 *   Extension,
 *   Tokenizer
 * } from 'micromark-util-types'
 */
import { codes, types } from "micromark-util-symbol"
import { factorySpace } from "micromark-factory-space"

/**
 * @type {Tokenizer}
 */
function abbrDefinitionTokenize(effects, ok, nok) {
  // TODO - make this a lot closer to the built it definition tokenizer
  const self = this
  const defined = self.parser.abbrDefinitions || (self.parser.abbrDefinitions = [])

  return start

  // *[HTML]: Hyper Text Markup Language
  // ^
  function start(code) {
    // TODO - assertions
    effects.enter('abbrDefinition')
    effects.enter('abbrDefinitionLabel')
    effects.consume(code)
    return abbrKeyDefinition
  }

  // TODO - use factoryLabel for this
  // *[HTML]: Hyper Text Markup Language
  //  ^
  function abbrKeyDefinition(code) {
    if (code == codes.leftSquareBracket) {
      effects.consume(code)
      return abbrKeyStart
    }
    else {
      return nok(code)
    }
  }

  // *[HTML]: Hyper Text Markup Language
  //   ^
  function abbrKeyStart(code) {
    // definitions have to have a label, otherwise we get an error from the default definitions handlers
    effects.enter('abbrDefinitionLabelString')
    effects.enter(types.chunkString, { contentType: 'string' })
    return abbrKey
  }

  // *[HTML]: Hyper Text Markup Language
  //   ^^^^^
  function abbrKey(code) {
    if ([codes.carriageReturn, codes.lineFeed, codes.carriageReturnLineFeed, codes.nul].includes(code)) {
      return nok(code)
    }

    if (code === codes.rightSquareBracket) {
      // TODO sanitize these identifiers
      // TODO - do this in exit('abbrDefinition') instead so we can get the key and value at the same time?
      effects.exit('chunkString')
      const token = self.sliceSerialize(effects.exit('abbrDefinitionLabelString'))
      if (!defined.find(pair => pair['key'] === token)) {
        defined.push({ key: token })
      }
      effects.consume(code)
      effects.exit('abbrDefinitionLabel')
      return abbrKeyValueSeparator
    }

    effects.consume(code)
    return abbrKey
  }

  // *[HTML]: Hyper Text Markup Language
  //        ^ 
  function abbrKeyValueSeparator(code) {
    if (code === codes.colon) {
      effects.enter('abbrKeyValueSeparator')
      effects.consume(code)
      effects.exit('abbrKeyValueSeparator')
      return factorySpace(
        effects,
        abbrValueStart,
        'abbrKeyValueWhitespace'
      )
    }
    else {
      return nok(code)
    }

  }

  // *[HTML]: Hyper Text Markup Language
  //          ^
  function abbrValueStart(code) {
    effects.enter('abbrDefinitionValueString')
    effects.enter(types.chunkString, { contentType: 'string' })
    return abbrValue
  }

  // *[HTML]: Hyper Text Markup Language
  //          ^^^^^^^^^^^^^^^^^^^^^^^^^^
  function abbrValue(code) {
    // TODO - do we need both codes.nul and null here?
    if ([codes.carriageReturn, codes.lineFeed, codes.carriageReturnLineFeed, codes.nul, null].includes(code)) {
      effects.exit(types.chunkString)
      const token = self.sliceSerialize(effects.exit('abbrDefinitionValueString'))
      const lastDefined = defined[defined.length - 1]
      if (lastDefined && lastDefined['key'] && !lastDefined['value']) {
        lastDefined['value'] = token
      }
      effects.exit('abbrDefinition')
      return ok
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
    continuation: {},
    exit: function () {}
  }
}

/**
 * @type {Extension}
 */
export const abbr = {
  contentInitial
}