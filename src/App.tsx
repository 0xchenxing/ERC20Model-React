import { Routes, Route } from "react-router-dom"
import { Web3Provider } from "./lib/web3-provider"
import { Toaster } from "./components/ui/toaster"
import HomePage from "./pages/home"
import AdminPage from "./pages/admin"

function App() {
  return (
    <Web3Provider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <Toaster />
    </Web3Provider>
  )
}

export default App
