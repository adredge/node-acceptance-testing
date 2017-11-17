import axios from 'axios'
import config from './config'

function authenticateUser() {
  return axios.post('/api/auth', { userId: config.defaultUserId }).then(res => res.data)
}

function getList() {
  return axios.get('/api/list')
    .then(res => {
      if (!res.data)
        return createList()
      return res.data
    })
}

function createList() {
  return axios.post('/api/createList').then(res => {
    return axios.get('/api/list').then(res => res.data)
  })
}

function addItem(listId, newItemName) {
  const data = { listId, newItemName }
  return axios.post('/api/addItem', data).then(res => res.data)
}

function removeItem(listId, itemId) {
  return axios.delete(`/api/removeItem/${listId}/${itemId}`)
}

function checkItem(itemId, completedAt) {
  const data = { itemId, completedAt }
  return axios.put('/api/checkItem', data)
}

function uncheckItem(itemId) {
  return axios.put('/api/uncheckItem', { itemId })
}

export default { authenticateUser, getList, checkItem, uncheckItem, addItem, removeItem }