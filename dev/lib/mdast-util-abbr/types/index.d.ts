import type {Parent} from 'mdast'

interface AbbrDefinition extends Parent {
  label: string
}

declare module 'mdast' {
  interface RootContentMap {
    abbrDefinition: AbbrDefinition
  }
}
