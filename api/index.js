const express = require('express')
const router = express.Router()
// const usersRouter = require('./users')
// const activitiesRouter = require('./activities')
// const routinesRouter = require('./routines')
// const routineActivitiesRouter = require('./routineActivities')

// GET /api/health
router.get('/health', async (req, res, next) => {})

// ROUTER: /api/users
const usersRouter = require('./users')
router.use('/users', usersRouter)

// ROUTER: /api/activities
const activitiesRouter = require('./activities')
router.use('/activities', activitiesRouter)

// ROUTER: /api/routines
const routinesRouter = require('./routines')
router.use('/routines', routinesRouter)

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities')
router.use('/routine_activities', routineActivitiesRouter)

module.exports = router
