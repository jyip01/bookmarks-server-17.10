const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const { bookmarks } = require('../store')
const { isWebUri } = require('valid-url')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { url, title, rating, description } = req.body

        if (!url) {
            logger.error('URL is required')
            return res
                .status(400)
                .send("'url' is required")
        }

        if (!title) {
            logger.error('Title is required')
            return res
                .status(400)
                .send("'title' is required")
        }

        if (!rating) {
            logger.error('Rating is required')
            return res
                .status(400)
                .send("'rating' is required")
        }

        if (!description) {
            logger.error('Description is required')
            return res
                .status(400)
                .send("'description' is required")
        }

        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res
                .status(400)
                .send(`'rating' must be a number between 0 and 5`)
        }

        if (!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res
                .status(400)
                .send(`'url' must be a valid URL`)
        }

        const id = uuid()

        const bookmark = {
            id,
            url,
            title,
            rating,
            description
        }

        bookmarks.push(bookmark)

        logger.info(`Bookmark with id ${id} created`)

        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark)
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params
        const bookmark = bookmarks.find(b => b.id == id)

        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found.`)
            return res
                .status(404)
                .send('Bookmark not found')
        }

        res.json(bookmark)
    })
    .delete((req, res) => {
        const { id } = req.params

        const bookmarkIndex = bookmarks.findIndex(b => b.id == id)

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`)
            return res
                .status(404)
                .send('Bookmark not found')
        }

        bookmarks.splice(bookmarkIndex, 1)

        logger.info(`Bookmark with id ${id} deleted.`)

        res.status(204).end()
    })

module.exports = bookmarksRouter 