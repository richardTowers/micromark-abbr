import { codes, types } from "micromark-util-symbol"

function variableTokenize(effects, ok, nok) {
  function start(code) {
    effects.enter('variable')
    effects.enter('variableMarker')
    effects.consume(code)
    effects.exit('variableMarker')
    effects.enter('variableString')
    effects.enter(types.chunkString, { contentType: 'string' })
    return begin
  }
  
  function begin(code) {
    return code == codes.rightCurlyBrace ? nok(code) : inside(code)
  }

  function inside(code) {
    if ([codes.carriageReturn, codes.lineFeed, codes.carriageReturnLineFeed, codes.nul].includes(code)) {
      return nok(code)
    }
    
    if (code === codes.backslash) {
      effects.consume(code)
      return insideEscape
    }
    
    if (code === codes.rightCurlyBrace) {
      effects.exit(types.chunkString)
      effects.exit('variableString')
      effects.enter('variableMarker')
      effects.consume(code)
      effects.exit('variableMarker')
      effects.exit('variable')
      return ok
    }
    
    effects.consume(code)
    return inside
  }

  function insideEscape(code) {
    if ([codes.backslash, codes.rightCurlyBrace].includes(code)) {
      effects.consume(code)
      return inside
    }

    return inside(code)
  }

  return start
}

export function variablesHtml(data = {}) {
  function enterVariableString() {
    this.buffer()
  }
  
  function exitVariableString() {
    var id = this.resume()
    console.log(id, data, id in data, data.hasOwnProperty(id))
    if (data.hasOwnProperty(id)) {
      this.raw(this.encode(data[id]))
    }
  }
  
  return {
    enter: { variableString: enterVariableString },
    exit: { variableString: exitVariableString },
  }
}

export const variables = {
  text: {
    [codes.leftCurlyBrace]: {
      name: 'variable',
      tokenize: variableTokenize
    }
  }
}

