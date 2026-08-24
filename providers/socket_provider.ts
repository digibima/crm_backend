import type { ApplicationService } from '@adonisjs/core/types'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import SocketService from '#services/socket_service'

let io: Server | null = null
let httpServer: ReturnType<typeof createServer> | null = null

export default class SocketProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    if (io) {
      return
    }

    httpServer = createServer()

    io = new Server(httpServer, {
      cors: {
        origin: '*',
      },
    })

    SocketService.setIO(io)

    io.on('connection', (socket) => {
      console.log('Connected:', socket.id)

      socket.on('disconnect', () => {
        console.log('Disconnected:', socket.id)
      })
    })

    httpServer.listen(4000, () => {
      //console.log('Socket.IO running on port 4000')
    })
  }
}