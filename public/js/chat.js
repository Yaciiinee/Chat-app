const socket = io()

// elements
const $form = document.querySelector("form")
const $btnMsg = $form.querySelector("button")
const $BTN_SEND_LOCATION = document.querySelector("#loc")
const $messages = document.querySelector("#messages")
    //templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector("#location-template").innerHTML
const $sideBarTemplate = document.querySelector("#sidebar-template").innerHTML
    // options

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on("getLocation", (coords) => {
    const html = Mustache.render($locationTemplate, {
        username: coords.username,
        url: coords.url,
        time: moment(coords.createdAt).format("HH:mm") + "h"
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()

})

socket.on("message", (message) => {
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        text: message.text,
        createdAt: moment(message.createdAt).format("HH:mm") + "h"
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on("roomData", (data) => {
    const html = Mustache.render($sideBarTemplate, {
        room: data.room,
        users: data.users
    })
    document.querySelector("#sidebar").innerHTML = html
})

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault()
    const message = e.target.elements.message.value
    socket.emit("sendMessage", message, () => {
        console.log("Message sent.")
    })
})

document.querySelector("#loc").addEventListener("click", (e) => {
    e.preventDefault()
    $BTN_SEND_LOCATION.setAttribute("disabled", "true")
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        socket.emit("sendLocation", { lat, lon }, () => {
            $BTN_SEND_LOCATION.removeAttribute("disabled")
            console.log("Location shared!")
        })
    })
})

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})