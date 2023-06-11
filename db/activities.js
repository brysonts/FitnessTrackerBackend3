const client = require('./client')

// database functions
async function createActivity({ name, description }) {
  const res = await client.query(
    `INSERT INTO activities (name, description) VALUES ($1, $2) RETURNING *;`,
    [name, description],
  )
  return res.rows[0]
}

async function getAllActivities() {
  try {
    const res = await client.query('SELECT * FROM activities')
    return res.rows
  } catch (error) {
    console.error('Error retrieving activities:', error)
    throw error
  }
}

async function getActivityById(id) {
  try {
    const res = await client.query('SELECT * FROM activities WHERE id = $1', [
      id,
    ])

    return res.rows[0]
  } catch (error) {
    console.error('Error retrieving activity:', error)
    throw error
  }
}

async function getActivityByName(name) {
  try {
    const res = await client.query('SELECT * FROM activities WHERE name = $1', [
      name,
    ])

    return res.rows[0]
  } catch (error) {
    console.error('Error retrieving activity by name:', error)
    throw error
  }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
  const finalRoutines = []
  for (let routine of routines) {
    const result = await client.query(
      `
    SELECT *, ra.id as "routineActivityId" FROM routine_activities ra 
      LEFT OUTER JOIN activities a ON a.id = ra."activityId"
    WHERE "routineId"=$1
    `,
      [routine.id],
    )

    const activities = result.rows
    routine.activities = activities.map((a) => {
      a.routineId = routine.id
      return a
    })
    finalRoutines.push(routine)
  }
  return finalRoutines
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
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
      UPDATE activities 
      SET ${fieldString.join(', ')}
      WHERE id=$1
      RETURNING *
      `,
      [id],
    )
    return result.rows[0]
  } catch (error) {
    console.error('updating activity:', error)
    throw error
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
}
