import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'

type OrderItem = {
  name?: string
  qty?: number
  price?: number
}

export type NewOrderPayload = {
  orderId: string
  customerName?: string
  status: string
  items?: OrderItem[]
}

export type OrderUpdatePayload = {
  orderId: string
  status: string
  items?: OrderItem[]
}

type Options = {
  customerId?: string
  onNewOrder?: (data: NewOrderPayload) => void
  onOrderUpdate?: (data: OrderUpdatePayload) => void
  joinAdminRoom?: boolean
}

export function useSocket(options: Options = {}) {
  const { customerId, onNewOrder, onOrderUpdate, joinAdminRoom = false } = options
  const socketRef = useRef< typeof Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (socketRef.current) return

    let active = true

    const setup = async () => {
      const socketIO = await import('socket.io-client')
      if (!active || socketRef.current) return

      const socket = socketIO.default('/', {
        path: '/api/socket',
      })

      socketRef.current = socket

      socket.on('connect', () => setConnected(true))
      socket.on('disconnect', () => setConnected(false))

      if (joinAdminRoom) {
        socket.emit('joinRoom', 'admin')
      }

      if (customerId) {
        socket.emit('joinRoom', customerId)
      }

      if (onNewOrder) {
        socket.on('newOrder', onNewOrder)
      }

      if (customerId && onOrderUpdate) {
        const channel = `orderUpdate:${customerId}`
        socket.on(channel, onOrderUpdate)
      }
    }

    void setup()

    return () => {
      active = false
      if (!socketRef.current) return
      if (onNewOrder) socketRef.current.off('newOrder', onNewOrder)
      if (customerId && onOrderUpdate) {
        socketRef.current.off(`orderUpdate:${customerId}`, onOrderUpdate)
      }
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [customerId, joinAdminRoom, onNewOrder, onOrderUpdate])

  return { socket: socketRef.current, connected }
}

export default useSocket
