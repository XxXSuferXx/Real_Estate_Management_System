import { useNavigate } from "@tanstack/react-router";
import { Button } from "../components/Button"
import { NavBar } from "../components/NavBar";


export const HomePage = ()=> {
    const navigate = useNavigate();

    const handleSignInClick = () => {
        navigate({to: "/Login"});
    }

    return (
         <div className = " bg-slate-800 min-h-screen text-slate-100">
            <NavBar />
            <div className = " flex flex-wrap justify-end px-5 py-2 border border-blue-50">
        
                <Button label = "Login" onClick = {handleSignInClick}/>

            </div>
        </div>
    )
}