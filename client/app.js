const { app, BrowserWindow, ipcMain } = require('electron')
const { v4: uuidv4 } = require('uuid');
const screenshot = require('screenshot-desktop');
var { mouse, Point, keyboard } = require("@nut-tree/nut-js");

var socket = require('socket.io-client')('http://192.168.0.106:4000');
var interval;

function createWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 150,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.removeMenu();
    win.loadFile('index.html')

    socket.on("mouse-move", function (data) {
        var obj = JSON.parse(data);
        var x = obj.x;
        var y = obj.y;

        mouse.move(new Point(x,y))
    })

    socket.on("mouse-click", function (data) {
        mouse.leftClick()
    })

    socket.on("type", function (data) {
        var obj = JSON.parse(data);
        var key = obj.key;

        // robot.keyTap(key);
        keyboard.pressKey(key)
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.on("start-share", function (event, arg) {

    var uuid = "test";//uuidv4();
    socket.emit("join-message", uuid);
    event.reply("uuid", uuid);

    interval = setInterval(function () {
        screenshot().then((img) => {
            var imgStr = new Buffer(img).toString('base64');

            var obj = {};
            obj.room = uuid;
            obj.image = imgStr;

            socket.emit("screen-data", JSON.stringify(obj));
        })
    }, 500)
})

ipcMain.on("stop-share", function (event, arg) {

    clearInterval(interval);
})




// socket.on("mouse-move", function (data) {
//     var obj = JSON.parse(data);
//     var x = obj.x;
//     var y = obj.y;

//     mouse.move(new Point(x,y))
// })

// socket.on("mouse-click", function (data) {
//     mouse.click()
// })

// socket.on("type", function (data) {
//     var obj = JSON.parse(data);
//     var key = obj.key;

//     // robot.keyTap(key);
//     keyboard.pressKey(key)
// })

// var uuid = "test";//uuidv4();
// socket.emit("join-message", uuid);
// // event.reply("uuid", uuid);

// interval = setInterval(function () {
//     screenshot().then((img) => {
//         var imgStr = new Buffer(img).toString('base64');

//         var obj = {};
//         obj.room = uuid;
//         obj.image = imgStr;

//         socket.emit("screen-data", JSON.stringify(obj));
//     })
// }, 500)

// process.stdin.resume();

