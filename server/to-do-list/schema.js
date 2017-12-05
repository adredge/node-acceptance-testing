'use strict'

const mongoose = require('mongoose')

const itemSchema = mongoose.Schema(
    {
        name: String,
        complete: Boolean,
        completedAt: Date
    },
    { collection: 'items' }
)

const Item = mongoose.model('Item', itemSchema)

const listSchema = mongoose.Schema(
    {
        name: String,
        userId: String,
        items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    },
    { collection: 'lists' }
)

const ToDoList = mongoose.model('ToDoList', listSchema)

module.exports = {
    Item,
    ToDoList
}