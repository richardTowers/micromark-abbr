/**
 * @import {
 *   ConstructRecord,
 *   Extension,
 *   Tokenizer
 * } from 'micromark-util-types'
 */
import { codes } from "micromark-util-symbol"
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
    // TODO - it feels hacky to be using the "definition" type here. We're doing so because definitions get hoisted
    //        to the top of the events array, which means they can be referenced by events that may use the definitions in the HTML compiler.
    //        Strictly speaking though, abbr definitions are not exactly the same as link reference definitions, and reusing them is probably going to cause confusion.
    effects.enter('abbr')
    effects.enter('abbrKeyDefinition')
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
    effects.enter('abbrKey')
    effects.enter('chunkString', { contentType: 'string' })
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
      // TODO - do this in exit('abbr') instead so we can get the key and value at the same time?
      effects.exit('chunkString')
      const token = self.sliceSerialize(effects.exit('abbrKey'))
      if (!defined.find(pair => pair['key'] === token)) {
        defined.push({ key: token })
      }
      effects.consume(code)
      effects.exit('abbrKeyDefinition')
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
    effects.enter('abbrValue')
    effects.enter('chunkString', { contentType: 'string' })
    return abbrValue
  }

  // *[HTML]: Hyper Text Markup Language
  //          ^^^^^^^^^^^^^^^^^^^^^^^^^^
  function abbrValue(code) {
    // TODO - do we need both codes.nul and null here?
    if ([codes.carriageReturn, codes.lineFeed, codes.carriageReturnLineFeed, codes.nul, null].includes(code)) {
      effects.exit('chunkString')
      const token = self.sliceSerialize(effects.exit('abbrValue'))
      const lastDefined = defined[defined.length - 1]
      if (lastDefined && lastDefined['key'] && !lastDefined['value']) {
        lastDefined['value'] = token
      }
      effects.exit('abbr')
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