import { Server } from 'socket.io'

class SocketService {
  public io: Server | null = null

  setIO(io: Server) {
    this.io = io
  }

  getIO() {
    return this.io
  }
}

export default new SocketService()