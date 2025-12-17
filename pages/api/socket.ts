import type { NextApiRequest, NextApiResponse } from 'next'
import { Server } from 'socket.io'
import type { Server as HTTPServer } from 'http'
import type { Socket } from 'net'

type SocketServer = HTTPServer & {
  io?: Server}

type NextApiResponseWithSocket = NextApiResponse & {
  socket: Socket & {
    server: SocketServer
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket,
) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: '*',
      },
    })

    io.on('connection', (socket) => {
      socket.on('joinRoom', (roomId: string) => {
        if (roomId) socket.join(roomId)
      })

      socket.on('disconnect', () => {
        // optional cleanup
      })
    })

    res.socket.server.io = io
  }

  res.end()
}
