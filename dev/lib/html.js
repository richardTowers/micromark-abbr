export const abbrHtml = {
  enter: {
    abbr() {
      const definitions = this.getData('definitions')
      this.setData('definitions', definitions || {})
    },
    abbrKey() {
      this.buffer()
    },
    abbrValue() {
      this.buffer()
    },
    abbrCall() {
      this.buffer()
    }
  },
  exit: {
    abbr() {
      const definitions = this.getData('definitions')
      definitions[this.getData('key')] = this.getData('value')
    },
    abbrKey() {
      const key = this.resume()
      this.setData('key', key)
    },
    abbrValue() {
      const value = this.resume()
      this.setData('value', value)
    },
    abbrCall() {
      const abbr = this.resume()
      console.log(`'${abbr}'`)
      this.tag(`<abbr title="{{${abbr}}}">${abbr}</abbr>`)
    },
    null() {
      console.log(this)
    }
  }
}