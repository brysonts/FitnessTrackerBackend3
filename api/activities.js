const express = require('express')
const activitiesRouter = express.Router()
const { getPublicRoutinesByActivity } = require('../db/routines')
const {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
} = require('../db/activities')
// GET /api/activities/:activityId/routines
activitiesRouter.get('/:activityId/routines', async (req, res, next) => {
  try {
    const existingActivity = await getActivityById(req.params.activityId)
    if (!existingActivity) {
      return res.status(404).json({
        message: `Activity ${req.params.activityId} not found`,
        name: 'name',
        error: 'error',
      })
    }

    const routines = await getPublicRoutinesByActivity({
      id: req.params.activityId,
    })
    res.send(routines)
  } catch {
    throw console.error('404')
  }
})

// GET /api/activities
activitiesRouter.get('/', async (req, res, next) => {
  try {
    const activities = await getAllActivities()
    res.send(activities)
  } catch {
    throw console.error('404')
  }
})
// POST /api/activities
activitiesRouter.post('/', async (req, res, next) => {
  try {
    const existingActivity = await getActivityByName(req.body.name)
    if (existingActivity) {
      return res.status(404).json({
        message: `An activity with name ${req.body.name} already exists`,
        name: 'name',
        error: 'error',
      })
    }

    const activity = await createActivity(req.body)
    res.send(activity)
  } catch (error) {
    console.error(error)
    next(new Error('Error posting activity'))
  }
})

// PATCH /api/activities/:activityId
activitiesRouter.patch('/:activityId', async (req, res, next) => {
  try {
    const existingActivity = await getActivityById(req.params.activityId)
    if (!existingActivity) {
      return res.send({
        message: `Activity ${req.params.activityId} not found`,
        name: 'name',
        error: 'error',
      })
    }

    const existingActivityByName = await getActivityByName(req.body.name)
    if (existingActivityByName) {
      return res.send({
        message: `An activity with name ${req.body.name} already exists`,
        name: 'name',
        error: 'error',
      })
    }
    const activity = await updateActivity({
      id: req.params.activityId,
      ...req.body,
    })
    res.send(activity)
  } catch (error) {
    console.error(error)
    next(new Error('Error patching activity'))
  }
})

module.exports = activitiesRouter
