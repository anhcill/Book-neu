import { useState, useContext, createContext, useEffect, useRef } from "react"

const UserLoginContext = createContext()

let UserLoginContextProvider = ({children}) => {
    const isMounted = useRef(true)
    const [userLoggedIn, setUserLoggedIn] = useState(() => !!localStorage.getItem('token'))
    const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'user')
    const [userInfo, setUserInfo] = useState(() => {
        try {
            const raw = localStorage.getItem('userInfo')
            return raw ? JSON.parse(raw) : null
        } catch (e) {
            return null
        }
    })

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    // Persist user role and info to localStorage when they change
    useEffect(() => {
        if (!isMounted.current) return
        if(userRole) {
            localStorage.setItem('userRole', userRole)
        } else {
            localStorage.removeItem('userRole')
        }
    }, [userRole])

    useEffect(() => {
        if (!isMounted.current) return
        if(userInfo) {
            try {
                localStorage.setItem('userInfo', JSON.stringify(userInfo))
            } catch (e) {
                // ignore
            }
        } else {
            localStorage.removeItem('userInfo')
        }
    }, [userInfo])

    useEffect(() => {
        if (!isMounted.current) return
        if(!userLoggedIn) {
            // if user logs out, remove token and stored info
            localStorage.removeItem('token')
            localStorage.removeItem('userRole')
            localStorage.removeItem('userInfo')
        }
    }, [userLoggedIn])

    return (
        <UserLoginContext.Provider value={{
            userLoggedIn, 
            setUserLoggedIn,
            userRole,
            setUserRole,
            userInfo,
            setUserInfo
        }}>
            {children}
        </UserLoginContext.Provider>
    )
}

const useUserLogin = () => useContext(UserLoginContext)

export { UserLoginContextProvider, useUserLogin }