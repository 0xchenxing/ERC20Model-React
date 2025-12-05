"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { useWeb3 } from "../lib/web3-provider"
import { useToast } from "../hooks/use-toast"
import { BASE_TOKEN_ABI } from "../lib/contracts"
import { Lock, TrendingUp } from "lucide-react"

interface VestingCardProps {
  contractAddress: string
}

export function VestingCard({ contractAddress }: VestingCardProps) {
  const { signer, account } = useWeb3()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [pendingVesting, setPendingVesting] = useState("0")

  const fetchVestingData = async () => {
    if (!signer || !account) return

    try {
      const cleanAccount = account.trim().replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, "")
      console.log("[v0] Fetching vesting for:", cleanAccount)

      if (!ethers.isAddress(cleanAccount)) {
        console.error("[v0] Invalid address format:", cleanAccount)
        return
      }

      const contract = new ethers.Contract(contractAddress, BASE_TOKEN_ABI, signer)
      const pending = await contract.getPendingVesting(cleanAccount)
      setPendingVesting(ethers.formatEther(pending))
      console.log("[v0] Vesting data fetched successfully")
    } catch (error) {
      console.error("Error fetching vesting data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVestingData()
  }, [signer, account])

  const handleClaim = async () => {
    if (!signer) return

    try {
      setClaiming(true)
      const contract = new ethers.Contract(contractAddress, BASE_TOKEN_ABI, signer)
      const tx = await contract.claimAllVesting()

      toast({
        title: "交易已提交",
        description: "正在领取您的归属代币...",
      })

      await tx.wait()

      toast({
        title: "成功！",
        description: "代币领取成功",
      })

      fetchVestingData()
    } catch (error: any) {
      console.error("Error claiming vesting:", error)
      toast({
        title: "交易失败",
        description: error.message || "代币领取失败",
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
            <Lock className="h-5 w-5" />
            代币归属
          </CardTitle>
          <CardDescription>连接钱包以查看您的归属计划</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          代币归属
        </CardTitle>
        <CardDescription>领取您的归属代币</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm text-muted-foreground">可领取</div>
              <div className="mt-1 text-3xl font-bold">{Number.parseFloat(pendingVesting).toFixed(2)} BASE</div>
            </div>

            <Button
              onClick={handleClaim}
              disabled={claiming || Number.parseFloat(pendingVesting) === 0}
              className="w-full gap-2"
              size="lg"
            >
              <TrendingUp className="h-4 w-4" />
              {claiming ? "领取中..." : "领取代币"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
