'use client'

import type { FC } from 'react'

type UserRow = {
  id: string
  name: string
  email: string
  role: 'admin' | 'customer'
}

const mockUsers: UserRow[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@store.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'John Customer',
    email: 'john@example.com',
    role: 'customer',
  },
]

const roleBadge = (role: string) =>
  role === 'admin'
    ? 'bg-[#66b07a]/10 text-[#06603a] border border-[#66b07a]/40'
    : 'bg-slate-100 text-slate-700 border border-slate-200'

const UsersPage: FC = () => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
          Users
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          View users of your store. This demo data can be wired to your auth
          system later.
        </p>
      </div>

      <div className="rounded-2xl border border-[#d8eedf] bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#e6f4ec] text-left text-xs font-semibold text-slate-700">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((u, i) => (
              <tr
                key={u.id}
                className={`border-t border-slate-100 ${
                  i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                }`}
              >
                <td className="px-4 py-2 text-slate-900">{u.name}</td>
                <td className="px-4 py-2 text-slate-700">{u.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${roleBadge(
                      u.role,
                    )}`}
                  >
                    {u.role === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default UsersPage






