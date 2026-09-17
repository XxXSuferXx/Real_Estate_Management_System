import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button"


export const HomePage = ()=> {
    const navigate = useNavigate();

    const handleSignInClick = () => {
        navigate('/login');
    }

    return (
         <div className = " bg-slate-800 min-h-screen text-slate-100">
            <div className = " flex flex-wrap justify-end px-5 py-2 border border-blue-50">
        
                <Button label = "SignIn" onClick = {handleSignInClick}/>

            </div>
        </div>
    )
}