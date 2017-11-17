import React, { Component } from 'react'
import client from '../client'
import './to-do-list-selector.css'
import { Link } from 'react-router-dom'

class ToDoListSelector extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lists: [{
        _id: "",
        name: ""
      }],
      createListName: ""
    }
  }

  componentWillMount() {
    this.getLists()
  }

  getLists = () => {
    client.getLists()
      .then((userLists) => {
        this.setState({
          lists: userLists.lists
        })
      })
  }

  renderListNames = () => {
    if (!this.state.lists || this.state.lists.length <= 0) return
    return this.state.lists.map(list =>
      <li key={list._id} className="list">
        <Link to={`/list/${list._id}`}>{list.name}</Link>
      </li>)
  }

  createList = () => {
    client.createList(this.state.createListName)
      .then(() => {
        this.getLists()
        this.setState({...this.state.lists, createListName: ""})
      })
  }

  handleChange = (event) => {
    this.setState({ createListName: event.target.value })
  }

  onKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.createList()
    }
  }

  render() {
    return (
      <div>
        <div className="header">
          <h2>Your Lists </h2>
        </div>

        <div>
          <ul className="lists">
            {this.renderListNames()}
          </ul>
          <div className="create-list">
            <input type="text" className="create-list-input" name="create-list-input"
              placeholder="New List Name" value={this.state.createListName} onChange={this.handleChange} onKeyPress={this.onKeyPress} />
            <button className="create-list-button" onClick={this.createList}>Create List</button>
          </div>
        </div>
      </div>
    )
  }
}

export default ToDoListSelector
