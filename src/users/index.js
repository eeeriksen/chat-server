const users = []

const addUser = (id, username) => {
  const user = { id, username }
  users.push(user)
}

const removeUser = id => {
  const index = users.findIndex(user => user.id === id)
  return users.splice(index, 1)
}

const getUser = id => {
  return users.find(user => user.id === id)
}

const getUsers = () => {
  return users
}

module.exports = { addUser, getUser, getUsers, removeUser }
