
class helper_service {
  private userSocketMap = new Map<string | number, Set<string>>()

  public setSocket(userId: string | number, socketId: string) {
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set())
    }
    this.userSocketMap.get(userId)!.add(socketId)
    console.log(`[Socket Added] User: ${userId} -> Socket: ${socketId}`)
  }

  public removeSocket(userId: string | number, socketId: string) {
    if (this.userSocketMap.has(userId)) {
      const userSockets = this.userSocketMap.get(userId)!
      userSockets.delete(socketId)
      if (userSockets.size === 0) {
        this.userSocketMap.delete(userId)
      }
    }
    console.log(`[Socket Removed] User: ${userId} -> Socket: ${socketId}`)
  }

  public getSockets(userId: string | number): string[] {
    const userSockets = this.userSocketMap.get(userId)
    return userSockets ? Array.from(userSockets) : []
  }
}

export default new helper_service()