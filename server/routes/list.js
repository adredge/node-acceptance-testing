'use strict'

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const config = require('../config/config')[env]

const express = require('express')
const toDoListFacade = require('../to-do-list/facade.js')

const router = express.Router()

router.post('/auth', (req, res) => {
  res.cookie(config.userCookieName, req.body.userId, { maxAge: 900000, httpOnly: true })
  res.send()
})

router.get('/list', (req, res) => {
  return toDoListFacade.getDefaultToDoList(req.userId).then(vm => res.json(vm))
})

router.post('/createList', (req, res) => {
  return toDoListFacade.createList(req.userId).then(vm => res.json(vm))
})

router.put('/checkItem', (req,res) => {
  const itemId = req.body.itemId
  const completedAt = req.body.completedAt
  return toDoListFacade.checkItem(itemId, completedAt).then(vm => res.json(vm))
})

router.put('/uncheckItem', (req,res) => {
  const itemId = req.body.itemId
  return toDoListFacade.uncheckItem(itemId).then(() => res.status(200).end())
})

router.post('/addItem', (req, res) => {
  return toDoListFacade.addItem(req.userId, req.body).then(vm => res.json(vm))
})

router.delete('/removeItem/:listId/:itemId', (req, res) => {
  return toDoListFacade.removeItem(req.userId, req.params.listId, req.params.itemId).then(res.status(200).end())
})

router.delete('/deleteList/:listId', (req,res) => {
  return toDoListFacade.deleteList(req.userId, req.params.listId).then(() => res.status(200).end())
})

module.exports = router