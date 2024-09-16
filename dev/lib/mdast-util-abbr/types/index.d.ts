import type {Data, Literal} from 'mdast'

export interface AbbrDefinitionData extends Data {}

export interface AbbrDefinition extends Literal {
  type: 'abbrDefinition'
  identifier: string
  data?: AbbrDefinitionData | undefined
}

export interface AbbrData extends Data {
  hName?: 'abbr' | undefined
  hProperties?: {
    title?: string | undefined
  }
}

export interface Abbr extends Literal {
  type: 'abbr'
  identifier: string
  data?: AbbrData | undefined
}

declare module 'mdast' {
  interface DefinitionContentMap {
    abbrDefinition: AbbrDefinition
  }

  interface PhrasingContentMap {
    abbr: Abbr
  }

  interface RootContentMap {
    abbrDefinition: AbbrDefinition
    abbr: Abbr
  }
}
