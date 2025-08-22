import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const {user, loading} = useAuth()

    if(loading) {
        return(
            <div className="h-screen w-screen flex justify-center items-center">
                Loading
            </div>
        )
    }

    if(!user) {
        return <Navigate to='/login' replace />
    }

    return <Outlet/>
}

export default ProtectedRoute