import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

const stats = [
  { name: 'Total Users', value: '2,651', icon: UsersIcon, change: '+4.75%', changeType: 'positive' },
  { name: 'Total Products', value: '593', icon: ShoppingBagIcon, change: '+2.02%', changeType: 'positive' },
  { name: 'Revenue', value: '$12,426', icon: CurrencyDollarIcon, change: '+1.39%', changeType: 'positive' },
  { name: 'Active Sessions', value: '146', icon: ChartBarIcon, change: '-3.24%', changeType: 'negative' },
]

export default function Dashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center gap-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
                <stat.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium leading-6 text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold tracking-tight text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-x-2">
                <p
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </p>
                <p className="text-sm text-gray-500">from last month</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Activity</h3>
            <div className="mt-6 flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {[1, 2, 3].map((item) => (
                  <li key={item} className="py-5">
                    <div className="flex items-center gap-x-4">
                      <div className="h-12 w-12 flex-none rounded-full bg-gray-50" />
                      <div className="flex-auto">
                        <p className="text-sm font-semibold leading-6 text-gray-900">User Activity {item}</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Quick Actions</h3>
            <div className="mt-6 grid grid-cols-1 gap-4">
              {['Add New User', 'Create Product', 'View Reports', 'System Settings'].map((action) => (
                <button
                  key={action}
                  type="button"
                  className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 