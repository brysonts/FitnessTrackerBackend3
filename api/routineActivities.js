const express = require('express')
const routineActivitiesRouter = express.Router()

const {
  updateRoutineActivity,
  destroyRoutineActivity,
} = require('../db/routine_activities')
// PATCH /api/routine_activities/:routineActivityId
routineActivitiesRouter.patch('/:routineActivityId', async (req, res) => {
  try {
    const routineActivity = await updateRoutineActivity({
      id: req.params.routineActivityId,
      ...req.body,
    })
    res.send(routineActivity)
  } catch (e) {
    console.log('update routine activity error', e)
    throw console.error('404')
  }
})

// DELETE /api/routine_activities/:routineActivityId
routineActivitiesRouter.delete('/:routineActivityId', async (req, res) => {
  try {
    const routineActivity = await destroyRoutineActivity(
      req.params.routineActivityId,
    )
    res.send(routineActivity)
  } catch (e) {
    console.log('delete routine activity error', e)
    throw console.error('404')
  }
})

module.exports = routineActivitiesRouter
