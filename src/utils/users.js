const users = []

//addUser, removeUser,getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    //clean the date
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    if (!(room && username)) {
        return {
            error: "Username and room are required."
        }
    }
    // check for existing user
    const existingUser = users.find((user) => {
        return (user.username === username && user.room === room)
    })
    if (existingUser) {
        return {
            error: "Username exist."
        }
    }

    // store user
    const user = { id, username, room }
    users.push(user)
    return { user }

}

const removeUser = (id) => {
    const index = users.findIndex((user) => id == user.id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((element) => element.room === room)
}

module.exports = {
    addUser,
    getUser,
    removeUser,
    getUsersInRoom
}