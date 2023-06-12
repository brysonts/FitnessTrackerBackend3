/* eslint-disable no-useless-catch */
const express = require('express')
const jwt = require('jsonwebtoken')
const usersRouter = express.Router()
const { createUser, getUserByUsername, getUserById } = require('../db/users')
const {
  getPublicRoutinesByUser,
  getAllRoutinesByUser,
} = require('../db/routines')
const { JWT_SECRET = 'neverTell' } = process.env

// POST /api/users/register
usersRouter.post('/register', async (req, res, next) => {
  try {
    if (req.body.password.length < 8) {
      return res.send({
        message: `Password Too Short!`,
        name: req.body.username,
        error: 'error',
      })
    }
    const createdUser = await createUser(req.body)
    res.send({
      message: 'Success',
      token: 'token',
      user: createdUser,
    })
  } catch (e) {
    console.log('Error User', req.body, {
      message: `User ${req.body.username} is already taken.`,
      name: req.body.username,
      error: e,
    })
    // throw `User ${req.body.username} is already taken.`

    res.send({
      message: `User ${req.body.username} is already taken.`,
      name: req.body.username,
      error: 'error',
    })
  }
})
// POST /api/users/login
usersRouter.post('/login', async (req, res, next) => {
  try {
    const user = await getUserByUsername(req.body.username)
    if (user && user.password) {
      if (user.password !== req.body.password) {
        throw new Error('Could not validate user')
      }
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1w' },
    )
    res.send({
      message: "you're logged in!",
      token,
      user,
    })
  } catch (e) {
    console.log('login user failed', e)
    throw console.error('404')
  }
})
// GET /api/users/me
usersRouter.get('/me', async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send({
        message: 'You must be logged in to perform this action',
        name: 'name',
        error: '',
      })
    }

    const token = req.headers.authorization.split(' ')[1]
    const parsedToken = jwt.verify(token, JWT_SECRET)

    // authorized the user
    if (parsedToken && parsedToken.id) {
      const user = await getUserById(parsedToken.id)
      res.send(user)
    } else {
      return res.status(401).send({
        message: 'You must be logged in to perform this action',
        name: 'name',
        error: 'error',
      })
    }
  } catch (e) {
    console.log('login user failed', e)
    throw console.error('404')
  }
})

// GET /api/users/:username/routines
usersRouter.get('/:username/routines', async (req, res, next) => {
  try {
    let isUser = false
    const token = req.headers?.authorization?.split(' ')[1]
    if (token) {
      const parsedToken = jwt.verify(token, JWT_SECRET)
      if (parsedToken) {
        isUser = parsedToken.username == req.params.username
      }
    }

    const user = await getUserByUsername(req.params.username)
    let routines
    if (isUser) {
      routines = await getAllRoutinesByUser({ id: user.id })
    } else {
      routines = await getPublicRoutinesByUser({ id: user.id })
    }

    res.send(routines)
  } catch (e) {
    console.log('get routines by user failed', e)
    throw console.error('404')
  }
})
module.exports = usersRouter
