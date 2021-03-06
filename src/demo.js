import React, {Component} from 'react'
import {Set} from 'immutable'
import JSONTree from 'react-json-tree'

import {IPLDEditor, IPLDStore, IPLDStoreList} from './index'

const store = new IPLDStore()
const defaultCode = JSON.stringify(require('./default-object.json'), null, 2)

export default class Demo extends Component {
  state = {
    code: defaultCode,
    hashes: new Set(),
    path: '',
    result: null
  }

  _onAdd = (event) => {
    event.preventDefault()
    let code
    try {
      code = JSON.parse(this.state.code)
    } catch (err) {
      console.error(err)
    }

    store
      .add(code)
      .then((hash) => {
        this.setState({hashes: this.state.hashes.add(hash)})
      })
      .catch((err) => {
        console.error(err.stack)
      })
  }

  _onResolve = (event) => {
    event.preventDefault()
    store
         .resolve(this.state.path)
         .then((result) => {
           this.setState({result})
         })
         .catch((err) => {
           console.error(err.stack)
         })
  }

  _loadItem = (hash) => {
    store
         .resolve(`/ipfs/${hash}`)
         .then((result) => {
           this.refs.editor.setValue(
             JSON.stringify(result, null, 2)
           )
         })
         .catch((err) => {
           console.error(err.stack)
         })
  }

  _onCodeChange = (newCode) => {
    this.setState({code: newCode})
  }

  _onPathChange = (event) => {
    this.setState({path: event.target.value.trim()})
  }

  render () {
    let results

    if (this.state.result) {
      results = (
        <div>
          <h4><code>{this.state.path}</code></h4>
          <JSONTree hideRoot data={this.state.result} />
        </div>
      )
    }
    return (
      <div>
        <h1>React IPLD</h1>
        <div>
          <div className='left'>
            <IPLDEditor
              ref='editor'
              value={this.state.code}
              onChange={this._onCodeChange} />
          </div>
          <div className='right'>
            <button onClick={this._onAdd}>Add object</button>
            <IPLDStoreList
              list={this.state.hashes}
              onItemClick={this._loadItem} />
          </div>
        </div>
        <div>
          <h3>Resolve</h3>
          <input className='resolve-input' value={this.state.path} onChange={this._onPathChange} />
          <button onClick={this._onResolve}>Resolve Path</button>
          <div className='result'>
            {results}
          </div>
        </div>
      </div>
    )
  }
}
