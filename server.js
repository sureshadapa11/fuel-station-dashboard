const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

let pumpState = {};
let locks = {}; // { pumpName: socketId }

function loadState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      pumpState = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load state, starting empty', err);
    pumpState = {};
  }
}

function saveState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(pumpState, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save state:', err);
  }
}

function broadcastState() {
  io.emit('stateUpdate', { pumpState, locks });
}

io.on('connection', (socket) => {
  socket.emit('init', { pumpState, locks });

  socket.on('requestState', () => {
    socket.emit('stateUpdate', { pumpState, locks });
  });

  socket.on('updateStatus', (payload) => {
    // Accept both per-pump updates and batch updates
    if (payload?.batch && typeof payload.batch === 'object') {
      pumpState = { ...pumpState, ...payload.batch };
      saveState();
      io.emit('stateUpdate', { pumpState, locks });
      return;
    }

    const { pump, state, reason } = payload || {};
    if (!pump) return;
    pumpState[pump] = { state, reason };
    saveState();
    io.emit('statusUpdate', { pump, state, reason });
  });

  socket.on('startEdit', ({ pump }) => {
    if (!pump) return;
    locks[pump] = socket.id;
    io.emit('lockUpdate', { pump, locked: true, socketId: socket.id });
  });

  socket.on('stopEdit', ({ pump }) => {
    if (!pump) return;
    if (locks[pump] === socket.id) {
      delete locks[pump];
    }
    io.emit('lockUpdate', { pump, locked: false, socketId: socket.id });
  });

  socket.on('disconnect', () => {
    const released = [];
    for (const [pump, locker] of Object.entries(locks)) {
      if (locker === socket.id) {
        delete locks[pump];
        released.push(pump);
      }
    }
    if (released.length) {
      io.emit('locksReleased', { pumps: released });
    }
  });
});

loadState();
server.listen(PORT, () => {
  console.log(`Fuel Station Dashboard server is running on http://localhost:${PORT}`);
});
