import { useState } from "react";

export const LoginPage = () => {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // stops the page from reloading
    console.log({email, password});
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className = " bg-slate-800 min-h-dvh text-white flex flex-col">
      <div className = " bg-black flex justify-center p-3">
          NavBar
      </div>
      <main className=" flex-1 flex items-center justify-center p-4">
        {/* The green box */}
        <form onSubmit = {handleSubmit} className=" bg-green-600 w-full max-w-sm rounded-lg p-6 flex flex-col gap-4 shadow-lg">
          <h1 className = " text-2xl font-semibold text-center">Login</h1>
          <div className = " flex flex-col gap-1">
            <label htmlFor = "email" className = "text-sm font-medium">
              Email
            </label>
            <input
            id = "email"
            type = "email"
            value = {email}
            onChange = {(e) => setEmail(e.target.value)}
            placeholder = "you@gmail.com"
            required
            autoComplete = "email"
            className = " w-full rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-slate-800 text-black"
             />
          </div>

          <div className=" flex flex-col gap-1">
            <label htmlFor=" password" className=" text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className=" text-black w-full rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

        <button 
          type= "submit"
          className = " w-full rounded-md bg-slate-800 text-white py-2 font-medium hover:bg-slate-700 transition-colors"
          >
          Sign in
        </button>

        </form>
        
      </main>
    </div>
  )
}