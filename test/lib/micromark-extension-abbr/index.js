import {preprocess, parse, postprocess, micromark} from 'micromark'

import assert from 'node:assert/strict'
import test from 'node:test'

import {micromarkAbbr, micromarkAbbrTypes} from 'remark-abbr'

await test('micromark-extension-abbr', async (t) => {
  await t.test('parses definitions', async () => {
    const input = `*[HTML]: Hyper Text Markup Language`
    const events = postprocess(
      parse({extensions: [micromarkAbbr]})
        .document()
        .write(preprocess()(input, null, true)),
    )
    const eventTypes = events.map((e) => [e[0], e[1].type])
    assert.deepEqual(
      eventTypes,
      // prettier-ignore
      [
        [ 'enter', 'content' ],
          [ 'enter', 'abbrDefinition' ],
            [ 'enter', 'abbrDefinitionLabel' ],
              [ 'enter', 'abbrDefinitionMarker' ],
              [ 'exit', 'abbrDefinitionMarker' ],
              [ 'enter', 'abbrDefinitionString' ],
                [ 'enter', 'data' ],
                [ 'exit', 'data' ],
              [ 'exit', 'abbrDefinitionString' ],
              [ 'enter', 'abbrDefinitionMarker' ],
              [ 'exit', 'abbrDefinitionMarker' ],
            [ 'exit', 'abbrDefinitionLabel' ],
            [ 'enter', 'abbrDefinitionMarker' ],
            [ 'exit', 'abbrDefinitionMarker' ],
            [ 'enter', 'lineSuffix' ],
            [ 'exit', 'lineSuffix' ],
            [ 'enter', 'abbrDefinitionValueString' ],
              [ 'enter', 'data' ],
              [ 'exit', 'data' ],
            [ 'exit', 'abbrDefinitionValueString' ],
          [ 'exit', 'abbrDefinition' ],
        [ 'exit', 'content' ],
    ],
    )
  })

  await t.test('does not parse definitions with empty labels', async () => {
    const input = `*[]: Empty`
    const events = postprocess(
      parse({extensions: [micromarkAbbr]})
        .document()
        .write(preprocess()(input, null, true)),
    )
    const abbrDefinitions = events.filter(
      (e) => e[1].type === micromarkAbbrTypes.abbrDefinition,
    )
    assert.deepEqual(abbrDefinitions, [])
  })

  await t.test(
    'parses definitions with labels containing spaces and punctuation',
    async () => {
      const input = `*[MV(VSL) (E&W)]: Motor Vehicles (Variation of Speed Limits) (England & Wales) Regulations`
      const events = postprocess(
        parse({extensions: [micromarkAbbr]})
          .document()
          .write(preprocess()(input, null, true)),
      )
      const abbrDefinitionString = events.find(
        (e) => e[1].type === micromarkAbbrTypes.abbrDefinitionString,
      )
      const [_, token, context] = abbrDefinitionString
      assert.deepEqual(context.sliceSerialize(token), 'MV(VSL) (E&W)')
    },
  )
})
