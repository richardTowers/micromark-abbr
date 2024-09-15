import type * as _ from 'micromark-util-types'

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    abbrDefinition: 'abbrDefinition'
    abbrDefinitionLabel: 'abbrDefinitionLabel'
    abbrDefinitionMarker: 'abbrDefinitionMarker'
    abbrDefinitionString: 'abbrDefinitionString'
    abbrDefinitionValueString: 'abbrDefinitionValueString'
  }
}
