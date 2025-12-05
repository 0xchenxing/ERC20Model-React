"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { useWeb3 } from "../lib/web3-provider"
import { useToast } from "../hooks/use-toast"
import { BASE_TOKEN_ABI } from "../lib/contracts"
import { Gift, Clock } from "lucide-react"

interface AirdropCardProps {
  contractAddress: string
}

export function AirdropCard({ contractAddress }: AirdropCardProps) {
  const { signer, account } = useWeb3()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [lastClaimTime, setLastClaimTime] = useState(0)
  const [canClaim, setCanClaim] = useState(false)
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState("")

  const fetchAirdropData = async () => {
    if (!signer || !account) return

    try {
      const cleanAccount = account.trim().replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, "")
      console.log("[v0] Fetching airdrop for:", cleanAccount)

      if (!ethers.isAddress(cleanAccount)) {
        console.error("[v0] Invalid address format:", cleanAccount)
        return
      }

      const contract = new ethers.Contract(contractAddress, BASE_TOKEN_ABI, signer)
      const lastClaim = await contract.lastClaimTime(cleanAccount)
      setLastClaimTime(Number(lastClaim))

      const now = Math.floor(Date.now() / 1000)
      const nextClaimTime = Number(lastClaim) + 86400 // 24 hours
      setCanClaim(now >= nextClaimTime)

      if (now < nextClaimTime) {
        const remainingSeconds = nextClaimTime - now
        const hours = Math.floor(remainingSeconds / 3600)
        const minutes = Math.floor((remainingSeconds % 3600) / 60)
        setTimeUntilNextClaim(`${hours}h ${minutes}m`)
      }
      console.log("[v0] Airdrop data fetched successfully")
    } catch (error) {
      console.error("Error fetching airdrop data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAirdropData()
    const interval = setInterval(fetchAirdropData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [signer, account])

  const handleClaim = async () => {
    if (!signer) return

    try {
      setClaiming(true)
      const contract = new ethers.Contract(contractAddress, BASE_TOKEN_ABI, signer)
      const tx = await contract.claimAirdrop()

      toast({
        title: "交易已提交",
        description: "正在领取您的空投...",
      })

      await tx.wait()

      toast({
        title: "成功！",
        description: "空投领取成功",
      })

      fetchAirdropData()
    } catch (error: any) {
      console.error("Error claiming airdrop:", error)
      toast({
        title: "交易失败",
        description: error.message || "空投领取失败",
        variant: "destructive",
      })
    } finally {
      setClaiming(false)
    }
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            每日空投
          </CardTitle>
          <CardDescription>连接钱包以领取每日空投</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          每日空投
        </CardTitle>
        <CardDescription>每日领取 100 BASE 代币</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            {!canClaim && lastClaimTime > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  下次领取：<span className="font-mono font-semibold">{timeUntilNextClaim}</span>
                </div>
              </div>
            )}

            <Button onClick={handleClaim} disabled={claiming || !canClaim} className="w-full gap-2" size="lg">
              <Gift className="h-4 w-4" />
              {claiming ? "领取中..." : canClaim ? "领取 100 BASE" : "明天再来"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
