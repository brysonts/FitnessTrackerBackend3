const client = require('./client')
const { attachActivitiesToRoutines } = require('./activities')
async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const routine = await client.query(
      'INSERT INTO routines ("creatorId", "isPublic", name, goal) VALUES ($1, $2, $3, $4) RETURNING *',
      [creatorId, isPublic, name, goal],
    )

    return routine.rows[0]
  } catch (error) {
    console.error('Error creating routine:', error)
    throw error
  }
}

async function getRoutineById(id) {
  try {
    const routine = await client.query('SELECT * FROM routines WHERE id=$1', [
      id,
    ])

    return routine.rows[0]
  } catch (error) {
    console.error('Error creating routine:', error)
    throw error
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const routines = await client.query('SELECT * FROM routines')

    return routines.rows
  } catch (error) {
    console.error('Error creating routines without activities:', error)
    throw error
  }
}

async function getAllRoutines() {
  try {
    const result = await client.query(`
    SELECT routines.id, name, "isPublic", "creatorId", goal, users.username as "creatorName" FROM routines LEFT OUTER JOIN users ON routines."creatorId" = users.id;
    `)

    return await attachActivitiesToRoutines(result.rows)
  } catch (error) {
    console.error('Error creating all routines:', error)
    throw error
  }
}

async function getAllPublicRoutines() {
  try {
    const result = await client.query(`
    SELECT routines.id, name, "isPublic", "creatorId", goal, users.username as "creatorName" FROM routines LEFT OUTER JOIN users ON routines."creatorId" = users.id WHERE "isPublic"=true;
    `)
    return await attachActivitiesToRoutines(result.rows)
  } catch (error) {
    console.error('Error getting all public routines:', error)
    throw error
  }
}

async function getAllRoutinesByUser({ username, id }) {
  try {
    const result = await client.query(
      `
      SELECT routines.id, name, "isPublic", "creatorId", goal, users.username as "creatorName" FROM routines LEFT OUTER JOIN users ON routines."creatorId" = users.id WHERE "creatorId"=$1;
    `,
      [id],
    )
    return await attachActivitiesToRoutines(result.rows)
  } catch (error) {
    console.error('Error getting all public routines:', error)
    throw error
  }
}

async function getPublicRoutinesByUser({ username, id }) {
  try {
    const result = await client.query(
      `
      SELECT routines.id, name, "isPublic", "creatorId", goal, users.username as "creatorName" FROM routines LEFT OUTER JOIN users ON routines."creatorId" = users.id WHERE "creatorId"=$1 AND "isPublic"=true;
    `,
      [id],
    )
    return await attachActivitiesToRoutines(result.rows)
  } catch (error) {
    console.error('Error getting all public routines:', error)
    throw error
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const result = await client.query(
      `
    SELECT *, users.username as "creatorName", routines.id as id FROM routines 
      LEFT OUTER JOIN users ON routines."creatorId" = users.id
      LEFT OUTER JOIN routine_activities ra ON routines.id = ra."routineId" 
    WHERE "isPublic"=true AND "activityId"=$1;
    `,
      [id],
    )
    return await attachActivitiesToRoutines(result.rows)
  } catch (error) {
    console.error('Error getting all public routines by activity:', error)
    throw error
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    let fieldString = []
    for (let field in fields) {
      if (typeof fields[field] === 'string') {
        fieldString.push(`"${field}" = '${fields[field]}'`)
      } else {
        fieldString.push(`"${field}" = ${fields[field]}`)
      }
    }
    const result = await client.query(
      `
      UPDATE routines 
      SET ${fieldString.join(', ')}
      WHERE id=$1
      RETURNING *
      `,
      [id],
    )

    return result.rows[0]
  } catch (error) {
    console.error('updating routine:', error)
    throw error
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(
      `
      DELETE FROM routine_activities
      WHERE "routineId"=$1
      `,
      [id],
    )
    await client.query(
      `
      DELETE FROM routines
      WHERE id=$1
      `,
      [id],
    )
  } catch (error) {
    console.error('updating routine:', error)
    throw error
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}
