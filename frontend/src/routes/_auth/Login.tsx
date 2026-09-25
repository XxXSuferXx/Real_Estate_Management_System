import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import { Login } from '../../api/authapi';
import { useAuth } from '../../context/AuthContext';

export const Route = createFileRoute('/_auth/Login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const {login: authLogin} = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) =>{
    e.preventDefault();
    if(!username || !password) {
      console.log("Both username and password are required");
      return;
    }

    const response = await Login(username, password);
    
    if(response?.success) {
       authLogin(response.accessToken, response.user);
        navigate({ to: "/AdminPanel" });
    } else {
    console.log(response?.message ?? "Login failed");
  }

  };

  return (
    <div className = " flex flex-col items-center p-10">
      <form onSubmit = {handleSubmit} className = " w-full max-w-sm">
        <div>
           <label className = " username">UserName</label>
          <input placeholder = "Username" className = " rounded py-2 px-3" type = "text" value = {username}
          onChange = {(e) => {setUsername(e.target.value)}} 
          />
          <label className = " Password">Password</label>
          <input placeholder = "Password" className = " rounded py-2 px-3" type = "text" value = {password}
          onChange = {(e) => {setPassword(e.target.value)}}
          />
        </div>
        <div className= "md-flex">
          <button type = "submit" className = " bg-blue-400 border rounded text-white p-2">Login </button>
        </div>
      </form>

    </div>
  )
}
