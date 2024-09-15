import type {Position} from 'unist'
import type {Parent, Text} from 'mdast'

interface AbbrDefinition extends Parent {
  label: string
  title: string
}

interface Abbr extends Parent {
  type: 'abbr'
  abbr: string
  reference: string
  children: Text[]
  data: {
    hName: 'abbr'
    hProperties: {
      title: string
    }
  }
  position: Position | undefined
}

declare module 'mdast' {
  interface RootContentMap {
    abbr: Abbr
    abbrDefinition: AbbrDefinition
  }
}
