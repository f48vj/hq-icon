import React, { Component } from 'react'
import PropTypes from 'prop-types'
import drawOutline from './drawOutline'
import './Result.css'

class Result extends Component {
  constructor (props) {
    super(props)
    this.state = {
      base64: ''
    }
  }

  async componentDidMount () {
    const { data } = this.props
    const base64 = await drawOutline(data)
    this.setState({
      base64
    })
  }

  render () {
    const { data } = this.props
    const { trackName, kind } = data
    const { base64 } = this.state
    const platform = kind.startsWith('mac') ? 'mac' : 'iOS'
    return (
      <div className='result'>
        <a href={base64} download={`${trackName}-${platform}.png`}>
          <img className='icon' src={base64} alt='icon' />
        </a>
        <div className='kind'>{platform}</div>
        {trackName}
      </div>
    )
  }
}

Result.propTypes = {
  data: PropTypes.object.isRequired
}

export default Result
