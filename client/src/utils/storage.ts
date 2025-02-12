
const storage = {
  getUserData: () => {
    const data =
      JSON.parse(window.localStorage.getItem("token") as string) || null
    return data
  },
  setUserData: (token: string) => {
    const userData = { token }
    window.localStorage.setItem("token", JSON.stringify(userData))
  },
  clearUserData: () => {
    window.localStorage.removeItem("token")
  },
}

export default storage
