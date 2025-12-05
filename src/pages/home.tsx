import { Header } from "../components/header"
import { VestingCard } from "../components/vesting-card"
import { AirdropCard } from "../components/airdrop-card"
import { StakingCard } from "../components/staking-card"
import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"
import { Shield } from "lucide-react"

// Replace with your deployed contract addresses
const BASE_TOKEN_ADDRESS = "0x..." // Your BaseToken contract address
const PUMPER_ADDRESS = "0x..." // Your DataReceiverAndPumper contract address

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">BASE 代币仪表盘</h1>
            <p className="mt-2 text-muted-foreground">管理您的代币、质押并赚取收益</p>
          </div>

          <Link to="/admin">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Shield className="h-4 w-4" />
              管理员面板
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <VestingCard contractAddress={BASE_TOKEN_ADDRESS} />
          <AirdropCard contractAddress={BASE_TOKEN_ADDRESS} />
          <div className="md:col-span-2 lg:col-span-1">
            <StakingCard contractAddress={BASE_TOKEN_ADDRESS} />
          </div>
        </div>
      </main>
    </div>
  )
}
