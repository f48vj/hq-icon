import React, { Component } from 'react'
import Result from './Result'
import {
  expandShortLink,
  searchAppById,
  searchIosApp,
  searchMacApp
 } from './iTunes'
import search from './search.svg'
import './App.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      input: '',
      results: []
    }
    this.search = this.search.bind(this)
  }

  async search () {
    let { input } = this.state
    input = input.trim()
    let url = input
    const itunesReg = /^(http|https):\/\/itunes/
    const idReg = /\/id(\d+)/i
    const shortReg = /^(http|https):\/\/appsto/

    try {
      if (shortReg.test(input)) {
        url = await expandShortLink(input)
      }
      if (itunesReg.test(url) && idReg.test(url)) {
        const id = idReg.exec(url)[1]
        const data = await searchAppById(id)
        this.setState({ results: data.results })
      } else {
        const data = await Promise.all([searchIosApp(input), searchMacApp(input)])
        this.setState({ results: data[0].results.concat(data[1].results) })
      }
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { input, results } = this.state
    return (
      <div className='app'>
        <header>
          <div className='center'>
            <div className='logo'>HQ ICON</div>
            <div className='description'>Get high quality icons from App Store</div>
            <div className='search'>
              <input
                className='search-input'
                placeholder='iTunes url or App name'
                value={input}
                onChange={(e) => this.setState({ input: e.target.value })}
                onKeyDown={(e) => e.keyCode === 13 ? this.search() : ''}
              />
              <div className='search-button' onClick={this.search}>
                <img src={search} className='search-icon' alt='search' />
              </div>
            </div>
          </div>
        </header>
        <main className='results'>
          {
            results.map(result => <Result key={result.trackId} data={result} />)
          }
        </main>
        <footer className='footer'>Created by @<a href='https://github.com/zhangweijie-cn'>zhangweijie-cn</a></footer>
      </div>
    )
  }
}

export default App
