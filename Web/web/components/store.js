import { createStore } from 'vuex'
import { io as socketio} from 'socket.io-client'

// Create a new store instance.
const store = createStore({
  state () {
    return {
      socket: null
    }
  },
  mutations: {
    createSocket(state) {
      if (!state.socket) {
        state.socket = socketio('http://localhost:8080/', {
          extraHeaders: {
            "Access-Control-Allow-Origin": "*"
          }
        })
        state.socket.on('connect', () => {
          state.socket.emit('join', 'controlPanel')
        })
      }
    }
  }
})

export default store