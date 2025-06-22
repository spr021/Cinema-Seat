import { useRouter } from "next/navigation"

export function useAuth() {
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    router.push("/auth/login")
  }

  return {
    logout,
  }
}
