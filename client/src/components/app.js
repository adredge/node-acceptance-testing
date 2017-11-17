import React, { Component } from 'react'
import './app.css'
import client from '../client'
// import ToDoListSelector from './to-do-list-selector'
import ToDoList from './to-do-list'
import { Switch, Route } from 'react-router-dom'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasAuthenticated: false
    }
  }

  componentWillMount() {
    client.authenticateUser().then(() => {
      this.setState({
        hasAuthenticated: true
      })
    })
  }

  render() {
    let appBody
    if (this.state.hasAuthenticated) {
      appBody =
        <Switch>
          <Route exact path='/' component={ToDoList} />
           {/* <Route exact path='/' component={ToDoListSelector} /> */}
          {/* <Route exact path='/lists' component={ToDoListSelector} />  */}
          {/* <Route exact path='/list' component={ToDoList} /> */}
          {/* <Route path='/list/:listId' component={ToDoList} /> */}
        </Switch>
    }

    return (
      <div className='app'>
        {appBody}
      </div>
    )
  }
}

export default App
