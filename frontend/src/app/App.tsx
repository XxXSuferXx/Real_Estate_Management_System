import { RouterProvider } from "@tanstack/react-router"
import { router } from "../router"
import { AuthProvider } from "../context/AuthContext"

function App() {
  

  return (
   <>
   <AuthProvider>
     <RouterProvider router = {router} />
   </AuthProvider>
   </>
  )
}

export default App
