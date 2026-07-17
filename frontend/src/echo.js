import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

let echo = null
let echoFailed = false

export function getEcho() {
  if (echo) return echo
  if (echoFailed) return null

  echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => {
      return {
        authorize: (socketId, callback) => {
          import('./api').then(({ default: api }) => {
            api.post('/broadcasting/auth', {
              socket_id: socketId,
              channel_name: channel.name,
            })
              .then(response => callback(null, response.data))
              .catch(error => callback(error))
          })
        },
      }
    },
  })

  if (echo.connector?.pusher) {
    echo.connector.pusher.connection.bind('error', () => {
      echoFailed = true
      try { echo.disconnect() } catch {}
      echo = null
    })
    echo.connector.pusher.connection.bind('failed', () => {
      echoFailed = true
      try { echo.disconnect() } catch {}
      echo = null
    })
  }

  return echo
}

export function disconnectEcho() {
  if (echo) {
    echo.disconnect()
    echo = null
  }
}
