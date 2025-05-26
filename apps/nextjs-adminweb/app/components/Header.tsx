import { BellIcon } from '@heroicons/react/24/outline'

export default function Header() {
  return (
    <div className="flex flex-1 items-center justify-between">
      <div className="flex items-center gap-x-8">
        <div className="text-xl font-semibold text-gray-900">Dashboard</div>
      </div>
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="h-8 w-8 rounded-full bg-gray-100">
            <span className="sr-only">Your profile</span>
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              A
            </div>
          </div>
          <span className="hidden lg:flex lg:items-center">
            <span className="text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
              Admin User
            </span>
          </span>
        </div>
      </div>
    </div>
  )
} 