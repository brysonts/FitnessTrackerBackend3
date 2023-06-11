const client = require('./client')

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const routineActivity = await client.query(
      `
      INSERT INTO routine_activities ("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [routineId, activityId, count, duration],
    )
    return routineActivity.rows[0]
  } catch (error) {
    console.error('XYZXYZ', error)
    throw error
  }
}
async function getRoutineActivityById(id) {
  try {
    const routine = await client.query(
      'SELECT * FROM routine_activities WHERE id=$1',
      [id],
    )

    return routine.rows[0]
  } catch (error) {
    console.error('Error creating routine:', error)
    throw error
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const routine = await client.query(
      'SELECT * FROM routine_activities WHERE "routineId"=$1',
      [id],
    )

    return routine.rows
  } catch (error) {
    console.error('Error creating routine:', error)
    throw error
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try {
    let fieldString = []
    for (let field in fields) {
      if (typeof fields[field] === 'string') {
        fieldString.push(`${field} = '${fields[field]}'`)
      } else {
        fieldString.push(`${field} = ${fields[field]}`)
      }
    }
    const result = await client.query(
      `
      UPDATE routine_activities
      SET ${fieldString.join(', ')}
      WHERE id=$1
      RETURNING *
      `,
      [id],
    )
    return result.rows[0]
  } catch (error) {
    console.error('updating routine_activities:', error)
    throw error
  }
}

async function destroyRoutineActivity(id) {
  try {
    const deletedActivity = await client.query(
      `
      DELETE FROM routine_activities
      WHERE id=$1
      RETURNING *
      `,
      [id],
    )
    if (deletedActivity.rowCount === 0) {
      throw new Error('Routine activity not found')
    }
    return deletedActivity.rows[0]
  } catch (error) {
    console.error('Error destroying routine:', error)
    throw error
  }
}
async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const result = await client.query(
      `SELECT * FROM routine_activities
        LEFT OUTER JOIN routines ON routines.id = routine_activities."routineId" 
        LEFT OUTER JOIN users ON routines."creatorId" = users.id
        WHERE users.id = $1 AND routine_activities.id = $2`,
      [userId, routineActivityId],
    )

    return result.rows.length > 0
  } catch (error) {
    console.error('Error creating routine:', error)
    throw error
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
}
