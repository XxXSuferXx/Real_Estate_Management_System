import { Link, useNavigate } from "@tanstack/react-router"
import { Button } from "./Button"
import { useAuth } from "../context/AuthContext"

export const NavBar = () =>{

    const {logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate({ to: "/"});
    };

    return (
        <div className = "flex items-center gap-6">
            <Link to={"/Dashboard"}> Agent Dashboard</Link>
            <Link to= {"/Login"}> Login</Link>
            <Link to={"/AdminPanel"}> AdminPanel</Link>
            <Button label = "Logout" onClick={handleLogout}/>
        </div>
    )
}