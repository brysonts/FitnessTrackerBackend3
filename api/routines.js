const express = require('express')
const routinesRouter = express.Router()
const jwt = require('jsonwebtoken')
const { JWT_SECRET = 'neverTell' } = process.env

const {
  getAllRoutines,
  createRoutine,
  updateRoutine,
  destroyRoutine,
  getRoutineById,
} = require('../db/routines')

const {
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
} = require('../db/routine_activities')
// GET /api/routines
routinesRouter.get('/', async (req, res) => {
  try {
    const routines = await getAllRoutines()
    res.send(routines)
  } catch (e) {
    console.log('error', e)
    throw console.error('404')
  }
})

// POST /api/routines
routinesRouter.post('/', async (req, res) => {
  try {
    let loggedInUserId
    if (req.headers?.authorization) {
      const token = req.headers?.authorization?.split(' ')[1]
      if (token) {
        const parsedToken = jwt.verify(token, JWT_SECRET)

        loggedInUserId = parsedToken.id
      }
    }

    if (!loggedInUserId) {
      return res.status(401).send({
        message: 'You must be logged in to perform this action',
        name: 'name',
        error: 'error',
      })
    }

    const routine = await createRoutine({
      creatorId: loggedInUserId,
      ...req.body,
    })
    res.send(routine)
  } catch (e) {
    console.log('created routine error', e)
    throw console.error('404')
  }
})

// PATCH /api/routines/:routineId
routinesRouter.patch('/:routineId', async (req, res) => {
  try {
    let loggedInUserId
    let parsedToken
    if (req.headers?.authorization) {
      const token = req.headers?.authorization?.split(' ')[1]
      if (token) {
        parsedToken = jwt.verify(token, JWT_SECRET)

        loggedInUserId = parsedToken.id
      }
    }

    if (!loggedInUserId) {
      return res.status(401).send({
        message: 'You must be logged in to perform this action',
        name: 'name',
        error: 'error',
      })
    }
    const foundRoutine = await getRoutineById(req.params.routineId)

    if (foundRoutine.creatorId == loggedInUserId) {
      const routine = await updateRoutine({
        id: req.params.routineId,
        ...req.body,
      })
      res.send(routine)
    } else {
      return res.status(403).send({
        message: `User ${parsedToken.username} is not allowed to update ${foundRoutine.name}`,
        name: 'name',
        error: 'error',
      })
    }
  } catch (e) {
    console.log('updates routine error', e)
    throw console.error('404')
  }
})
// DELETE /api/routines/:routineId
routinesRouter.delete('/:routineId', async (req, res) => {
  try {
    let loggedInUserId
    let parsedToken
    if (req.headers?.authorization) {
      const token = req.headers?.authorization?.split(' ')[1]
      if (token) {
        parsedToken = jwt.verify(token, JWT_SECRET)

        loggedInUserId = parsedToken.id
      }
    }

    const foundRoutine = await getRoutineById(req.params.routineId)

    if (foundRoutine.creatorId == loggedInUserId) {
      const routine = await destroyRoutine(req.params.routineId)
      res.send(routine)
    } else {
      return res.status(403).send({
        message: `User ${parsedToken.username} is not allowed to delete ${foundRoutine.name}`,
        name: 'name',
        error: 'error',
      })
    }
  } catch (e) {
    console.log('delete routine error', e)
    throw console.error('404')
  }
})
// POST /api/routines/:routineId/activities
routinesRouter.post('/:routineId/activities', async (req, res) => {
  try {
    const routineActivities = await getRoutineActivitiesByRoutine({
      id: req.params.routineId,
    })
    let duplicate = false
    for (let routineActivity of routineActivities) {
      if (
        routineActivity.activityId == req.body.activityId &&
        routineActivity.routineId == req.params.routineId
      ) {
        duplicate = true
        break
      }
    }
    console.log('duplicate', duplicate)
    if (!duplicate) {
      const foundRoutineActivity = await addActivityToRoutine(req.body)

      res.send(foundRoutineActivity)
    } else {
      res.send({
        message: `Activity ID ${req.body.activityId} already exists in Routine ID ${req.params.routineId}`,
        name: 'name',
        error: 'error',
      })
    }
  } catch (e) {
    console.log('add activity failed', e)
    throw new Error('error')
  }
})
module.exports = routinesRouter
