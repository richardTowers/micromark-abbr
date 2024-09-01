const charCodes = {
  CR: -5,
  LF: -4,
  CRLF: -3,
  BACKSLASH: '\\'.charCodeAt(0),
  LEFT_CURLY_BRACE: '{'.charCodeAt(0),
  RIGHT_CURLY_BRACE: '}'.charCodeAt(0)
}

function variableTokenize(effects, ok, nok) {
  function start(code) {
    effects.enter('variable')
    effects.enter('variableMarker')
    effects.consume(code)
    effects.exit('variableMarker')
    effects.enter('variableString')
    effects.enter('chunkString', { contentType: 'string' })
    return begin
  }
  
  function begin(code) {
    return code == charCodes.RIGHT_CURLY_BRACE ? nok(code) : inside(code)
  }

  function inside(code) {
    if ([charCodes.CR, charCodes.LF, charCodes.CRLF, null].includes(code)) {
      return nok(code)
    }
    
    if (code === charCodes.BACKSLASH) {
      effects.consume(code)
      return insideEscape
    }
    
    if (code === charCodes.RIGHT_CURLY_BRACE) {
      effects.exit('chunkString')
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
    if ([charCodes.BACKSLASH, charCodes.RIGHT_CURLY_BRACE].includes(code)) {
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
    [charCodes.LEFT_CURLY_BRACE]: {
      name: 'variable',
      tokenize: variableTokenize
    }
  }
}

