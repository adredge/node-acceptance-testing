'use strict'

const uuid = require('uuid')
const mongoose = require('mongoose')

const toDoListRepository = require('./repository')
const { Item } = require('./schema')

describe('toDoListRepository', () => {
  let userId

  beforeEach(() => {
    userId = uuid.v4()
  })

  context('when creating and getting a list', () => {
    let createdList, returnedList

    beforeEach(() => {
      return toDoListRepository.createEmptyList(userId, 'Default')
        .then(l => createdList = l)
        .then(() => toDoListRepository.getList(userId))
        .then(l => returnedList = l)
    })

    afterEach(() => {
      return toDoListRepository.deleteList(userId, createdList._id)
    })

    it('should create an empty list', () => {
      expect(createdList._id.toString().length).to.be.above(10)
      expect(createdList.userId).to.equal(userId)
      expect(createdList.name).to.equal('Default')
      expect(createdList.items).to.eql([])
    })

    it('should return the users list', () => {
      expect(returnedList._id).to.eql(createdList._id)
      expect(returnedList.name).to.eql(createdList.name)
    })
  })

  context('when adding items to a todo list', () => {
    context('when creating and adding one item to a list', () => {
      let savedList
      const listName = "My Test List"
      const itemName = "New Item"

      beforeEach(() => {
        return toDoListRepository.createEmptyList(userId, listName)
          .then(l => savedList = l)
          .then(() => toDoListRepository.addItem(userId, savedList._id, itemName))
          .then(l => savedList = l)
      })

      afterEach(() => {
        return toDoListRepository.deleteList(userId, savedList._id)
      })

      it('should create the list', () => {
        expect(savedList.userId).to.equal(userId)
        expect(savedList.name).to.eql(listName)
      })

      it('should have the item', () => {
        expect(savedList.items.length).to.equal(1)
        expect(savedList.items[0].name).to.equal(itemName)
      })
    })

    context('when adding multiple items to a list', () => {
      let savedList
      const listName = "My Test List"
      const item1Name = "New Item 1"
      const item2Name = "New Item 2"
      const item3Name = "New Item 3"

      beforeEach(() => {
        return toDoListRepository.createEmptyList(userId, listName)
          .then(l => savedList = l)
          .then(() => toDoListRepository.addItem(userId, savedList._id, item1Name))
          .then(() => toDoListRepository.addItem(userId, savedList._id, item2Name))
          .then(() => toDoListRepository.addItem(userId, savedList._id, item3Name))
          .then(l => savedList = l)
      })

      afterEach(() => {
        return toDoListRepository.deleteList(userId, savedList._id)
      })

      it('should have all 3 items in the list', () => {
        expect(savedList.items.length).to.equal(3)
      })

      it('should keep the order of the items', () => {
        expect(savedList.items[0].name).to.equal(item1Name)
        expect(savedList.items[1].name).to.equal(item2Name)
        expect(savedList.items[2].name).to.equal(item3Name)
      })

      it('should mark items as incomplete by default', () => {
        expect(savedList.items[0].complete).to.be.false
        expect(savedList.items[1].complete).to.be.false
        expect(savedList.items[2].complete).to.be.false
      })
    })

    context('when the list does not exist', () => {
      let savedList
      const listId = mongoose.Types.ObjectId()
      const itemName = "New Item 1"

      beforeEach(() => {
        return toDoListRepository.addItem(userId, listId, itemName)
          .then(l => savedList = l)
      })

      it('should NOT save a list', () => {
        expect(savedList).to.eql({})
      })

      it('should NOT save the item', () => {
        return Item.findOne({ 'name': itemName }).then(item => {
          expect(item).to.be.null
        })
      })
    })

    context('when the user does not own the list', () => {
      let createdList, updatedList, error
      let otherUserId = uuid.v4()

      beforeEach(() => {
        return toDoListRepository.createEmptyList(userId, "My Test List")
          .then(l => createdList = l)
          .then(() => toDoListRepository.addItem(otherUserId, createdList._id, "New Item"))
          .catch(err => error = err)
          .then(() => toDoListRepository.getList(userId, createdList._id))
          .then(l => updatedList = l)
      })

      afterEach(() => {
        return toDoListRepository.deleteList(userId, createdList._id)
      })

      it('should NOT add an item', () => {
        expect(updatedList.items.length).to.equal(0)
      })

      it('should throw an error', () => {
        expect(error).to.exist
        expect(error).to.contain('Unable to find the list for that user')
      })
    })
  })

  context('when checking an item as complete', () => {
    context('when the item exists', () => {
      let listId, savedList, item1Id, response, updatedItem
      const item1Name = "Item 1"
      const item2Name = "Item 2"
      const expectedCompletedAt = new Date().toLocaleString()

      beforeEach(() => {
        return toDoListRepository.createEmptyList(userId, "My Test List")
          .then(l => listId = l._id)
          .then(() => toDoListRepository.addItem(userId, listId, item1Name))
          .then(list => item1Id = list.items[0]._id)
          .then(() => toDoListRepository.addItem(userId, listId, item2Name))
          .then(() => toDoListRepository.checkItem(item1Id, expectedCompletedAt))
          .then(r => response = r)
          .then(() => toDoListRepository.getList(userId))
          .then(l => {
            savedList = l
            updatedItem = savedList.items[0]
          })
      })

      afterEach(() => {
        return toDoListRepository.deleteList(userId, listId)
      })

      it('should not return anything but should succeed', () => {
        expect(response).to.be.undefined
      })

      it('should update the first item', () => {
        expect(updatedItem._id).to.eql(item1Id)
        expect(updatedItem.name).to.eql(item1Name)
      })

      it('should mark the completed item as complete', () => {
        expect(savedList.items.length).to.equal(2)
        expect(updatedItem.complete).to.be.true
        let actualCompletedAt = new Date(updatedItem.completedAt).toLocaleString()
        expect(actualCompletedAt).to.equal(expectedCompletedAt)
      })

      it('should NOT mark the other item as complete', () => {
        expect(savedList.items[1].complete).to.be.false
      })
    })

    context('when the item DOES NOT exist', () => {
      let error
      const itemId = mongoose.Types.ObjectId()

      beforeEach(() => {
        return toDoListRepository.checkItem(itemId, new Date().toLocaleString())
          .catch(err => error = err)
      })

      it('should NOT save an item', () => {
        return Item.findOne({ '_id': itemId }).then(item => {
          expect(item).to.be.null
        })
      })

      it('should throw an error', () => {
        expect(error).to.exist
        expect(error).to.contain('Unable to find item with id ' + itemId)
      })
    })
  })

  context('when UNchecking an item', () => {
    context('when the item exists', () => {
      let listId, savedList, item1Id, item2Id, response, updatedItem
      const item1Name = "Item 1"
      const item2Name = "Item 2"
      const expectedCompletedAt1 = new Date().toLocaleString()
      const expectedCompletedAt2 = new Date(2016).toLocaleString()

      beforeEach(() => {
        return toDoListRepository.createEmptyList(userId, "My Test List")
          .then(l => listId = l._id)
          .then(() => toDoListRepository.addItem(userId, listId, item1Name))
          .then(list => item1Id = list.items[0]._id)
          .then(() => toDoListRepository.addItem(userId, listId, item2Name))
          .then(list => item2Id = list.items[1]._id)
          .then(() => toDoListRepository.checkItem(item1Id, expectedCompletedAt1))
          .then(() => toDoListRepository.checkItem(item2Id, expectedCompletedAt2))
          .then(() => toDoListRepository.uncheckItem(item2Id))
          .then(r => response = r)
          .then(() => toDoListRepository.getList(userId))
          .then(l => {
            savedList = l
            updatedItem = savedList.items[1]
          })
      })

      afterEach(() => {
        return toDoListRepository.deleteList(userId, listId)
      })

      it('should not return anything but should succeed', () => {
        expect(response).to.be.undefined
      })

      it('should update the item as unchecked', () => {
        expect(savedList.items.length).to.equal(2)
        expect(updatedItem._id).to.eql(item2Id)
        expect(updatedItem.completedAt).to.be.null
        expect(updatedItem.complete).to.be.false
        expect(updatedItem.name).to.eql(item2Name)
      })

      it('should NOT mark the other item as incomplete', () => {
        expect(savedList.items[0]._id).to.eql(item1Id)
        expect(savedList.items[0].complete).to.be.true
        let returnedDate = new Date(savedList.items[0].completedAt).toLocaleString()
        expect(returnedDate).to.equal(expectedCompletedAt1)
      })
    })

    context('when the item DOES NOT exist', () => {
      let error
      const itemId = mongoose.Types.ObjectId()

      beforeEach(() => {
        return toDoListRepository.uncheckItem(itemId)
          .catch(err => error = err)
      })

      it('should NOT save an item', () => {
        return Item.findOne({ 'id': itemId }).then(item => {
          expect(item).to.be.null
        })
      })

      it('should throw a meaningful error', () => {
        expect(error).to.exist
        expect(error).to.contain('Unable to find item with id ' + itemId)
      })
    })
  })

  context('when removing an item', () => {
    context('when the item exists', () => {
      let listId, item1Id, item2Id, response, savedList
      const item1Name = "Item 1"
      const item2Name = "Item 2"

      beforeEach(() => {
        return toDoListRepository.createEmptyList(userId, "My Test List")
          .then(l => listId = l._id)
          .then(() => toDoListRepository.addItem(userId, listId, item1Name))
          .then(list => item1Id = list.items[0]._id)
          .then(() => toDoListRepository.addItem(userId, listId, item2Name))
          .then(list => item2Id = list.items[1]._id)
          .then(() => toDoListRepository.getList(userId))
          .then(() => toDoListRepository.removeItem(userId, listId, item1Id)
            .then(r => response = r)
            .then(() => toDoListRepository.getList(userId))
            .then(list => savedList = list))
      })

      afterEach(() => {
        return toDoListRepository.deleteList(userId, listId)
      })

      it('should not return anything but should succeed', () => {
        expect(response).to.be.undefined
      })

      it('should effectively remove the item from the list', () => {
        expect(savedList.items.indexOf(item1Id)).to.equal(-1)
      })

      it('should delete the removed item', () => {
        return Item.findOne({ '_id': item1Id }).then(item => {
          expect(item).to.be.null
        })
      })

      it('should NOT delete the other item', () => {
        return Item.findOne({'_id':item2Id}).then(item => {
           expect(item.name).to.eql(item2Name)
        })
      })
    })

    context('when the item DOES NOT exist', () => {
      let listId, error
      const itemId = mongoose.Types.ObjectId()

      beforeEach(() => {
        return toDoListRepository.createEmptyList(userId, "My Test List")
          .then(l => listId = l._id)
          .then(() => toDoListRepository.removeItem(userId, listId, itemId))
          .catch(err => error = err)
      })

      afterEach(() => {
        return toDoListRepository.deleteList(userId, listId)
      })

      it('should NOT throw an error', () => {
        expect(error).to.be.undefined
      })
    })

    context('when the list DOES NOT exist', () => {
      let error
      const listId = mongoose.Types.ObjectId()

      beforeEach(() => {
        return toDoListRepository.removeItem(userId, listId, 'foo')
          .catch(err => error = err)
      })

      it('should NOT throw an error', () => {
        expect(error).to.be.undefined
      })
    })
  })

  context('when removing a list', () => {
    let listId, list

    beforeEach(() => {
      return toDoListRepository.createEmptyList(userId, "List To Delete")
        .then(l => listId = l._id)
        .then(() => toDoListRepository.deleteList(userId, listId))
        .then(() => toDoListRepository.getList(userId))
        .then(l => list = l)
    })

    it('should delete the list', () => {
      expect(list).to.be.null
    })
  })
})