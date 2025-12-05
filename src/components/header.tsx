"use client"

import { Wallet, LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { useWeb3 } from "../lib/web3-provider"
import { useAppKit } from "@reown/appkit/react"

export function Header() {
  const { account, isConnecting, disconnect } = useWeb3()
  const { open } = useAppKit()

  const handleConnect = async () => {
    await open()
  }

  const handleDisconnect = async () => {
    await disconnect()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="font-mono text-xl font-bold">BASE</span>
        </div>

        {account ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block rounded-lg bg-muted px-4 py-2 font-mono text-sm">
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
            <Button onClick={handleDisconnect} variant="outline" size="sm" className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">断开连接</span>
            </Button>
          </div>
        ) : (
          <Button onClick={handleConnect} disabled={isConnecting} className="gap-2">
            <Wallet className="h-4 w-4" />
            {isConnecting ? "连接中..." : "连接钱包"}
          </Button>
        )}
      </div>
    </header>
  )
}
