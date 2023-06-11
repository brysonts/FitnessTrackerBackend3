const client = require('./client')

// database functions

// user functions
async function createUser({ username, password }) {
  const res = await client.query(
    `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username;`,
    [username, password],
  )
  return res.rows[0]
}

async function getUser({ username, password }) {
  const res = await client.query(
    `SELECT id, username FROM users WHERE username = $1 AND password = $2;`,
    [username, password],
  )
  const user = res.rows[0]
  return user
}

async function getUserById(userId) {
  try {
    const res = await client.query(
      'SELECT id, username FROM users WHERE id = $1;',
      [userId],
    )
    console.log('resid', res.rows)
    return res.rows[0]
  } catch (e) {
    console.log('Could not get user by id:', e)
  }
}

async function getUserByUsername(userName) {
  const res = await client.query(
    'SELECT id, username, password FROM users WHERE username = $1;',
    [userName],
  )
  const user = res.rows[0]

  if (user) {
    return user
  }

  throw new Error('User not found')
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
