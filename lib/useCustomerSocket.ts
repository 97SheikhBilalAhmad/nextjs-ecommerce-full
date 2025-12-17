'use client'

import { useEffect, useRef, useState } from 'react'
import type { Socket as ClientSocket } from 'socket.io-client'


type OrderItem = {
  name?: string
  qty?: number
  price?: number
}

export type CustomerOrderUpdate = {
  orderId: string
  status: string
  items?: OrderItem[]
  message?: string
}

type Options = {
  customerId: string
  onOrderUpdate?: (data: CustomerOrderUpdate) => void
}

export function useCustomerSocket(options?: Options) {
  const { customerId, onOrderUpdate } = options || {}

 const socketRef = useRef<typeof ClientSocket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!customerId) return
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

      socket.emit('joinRoom', customerId)

      if (onOrderUpdate) {
        socket.on(`orderUpdate:${customerId}`, onOrderUpdate)
      }
    }

    void setup()

    return () => {
      active = false
      if (!socketRef.current) return

      if (onOrderUpdate) {
        socketRef.current.off(`orderUpdate:${customerId}`, onOrderUpdate)
      }

      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [customerId, onOrderUpdate])

  return { socket: socketRef.current, connected }
}

export default useCustomerSocket
