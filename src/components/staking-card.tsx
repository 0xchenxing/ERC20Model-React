"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Skeleton } from "./ui/skeleton"
import { useWeb3 } from "../lib/web3-provider"
import { useToast } from "../hooks/use-toast"
import { BASE_TOKEN_ABI } from "../lib/contracts"
import { Coins, Wallet } from "lucide-react"

interface StakingCardProps {
  contractAddress: string
}

const LOCK_PERIODS = [
  { days: 7, apy: "3%" },
  { days: 30, apy: "6%" },
  { days: 90, apy: "10%" },
  { days: 180, apy: "15%" },
  { days: 360, apy: "20%" },
]

export function StakingCard({ contractAddress }: StakingCardProps) {
  const { signer, account } = useWeb3()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [staking, setStaking] = useState(false)
  const [amount, setAmount] = useState("")
  const [lockPeriod, setLockPeriod] = useState("30")
  const [referrer, setReferrer] = useState("")
  const [balance, setBalance] = useState("0")
  const [pendingRewards, setPendingRewards] = useState("0")
  const [totalStaked, setTotalStaked] = useState("0")

  const fetchStakingData = async () => {
    if (!signer || !account) return

    try {
      const cleanAccount = account.trim().replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, "")
      console.log("[v0] Fetching staking for:", cleanAccount)

      if (!ethers.isAddress(cleanAccount)) {
        console.error("[v0] Invalid address format:", cleanAccount)
        return
      }

      const contract = new ethers.Contract(contractAddress, BASE_TOKEN_ABI, signer)
      const userBalance = await contract.balanceOf(cleanAccount)
      const rewards = await contract.getPendingRewards(cleanAccount)
      const staked = await contract.totalStaked()

      setBalance(ethers.formatEther(userBalance))
      setPendingRewards(ethers.formatEther(rewards))
      setTotalStaked(ethers.formatEther(staked))
      console.log("[v0] Staking data fetched successfully")
    } catch (error) {
      console.error("Error fetching staking data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStakingData()
  }, [signer, account])

  const handleStake = async () => {
    if (!signer || !amount) return

    try {
      setStaking(true)
      const cleanAccount = account!.trim().replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, "")

      const contract = new ethers.Contract(contractAddress, BASE_TOKEN_ABI, signer)

      // Check allowance
      const amountWei = ethers.parseEther(amount)
      const allowance = await contract.allowance(cleanAccount, contractAddress)

      if (allowance < amountWei) {
        const approveTx = await contract.approve(contractAddress, amountWei)
        toast({
          title: "等待授权",
          description: "正在授权代币使用...",
        })
        await approveTx.wait()
      }

      const refAddress = referrer || ethers.ZeroAddress
      const tx = await contract.stake(amountWei, Number.parseInt(lockPeriod), refAddress)

      toast({
        title: "交易已提交",
        description: "正在质押您的代币...",
      })

      await tx.wait()

      toast({
        title: "成功！",
        description: "代币质押成功",
      })

      setAmount("")
      setReferrer("")
      fetchStakingData()
    } catch (error: any) {
      console.error("Error staking:", error)
      toast({
        title: "交易失败",
        description: error.message || "代币质押失败",
        variant: "destructive",
      })
    } finally {
      setStaking(false)
    }
  }

  const handleClaimRewards = async () => {
    if (!signer) return

    try {
      const contract = new ethers.Contract(contractAddress, BASE_TOKEN_ABI, signer)
      const tx = await contract.claimAllRewards()

      toast({
        title: "交易已提交",
        description: "正在领取您的奖励...",
      })

      await tx.wait()

      toast({
        title: "成功！",
        description: "奖励领取成功",
      })

      fetchStakingData()
    } catch (error: any) {
      console.error("Error claiming rewards:", error)
      toast({
        title: "交易失败",
        description: error.message || "奖励领取失败",
        variant: "destructive",
      })
    }
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            质押
          </CardTitle>
          <CardDescription>连接钱包以开始质押</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          质押
        </CardTitle>
        <CardDescription>质押您的代币并赚取奖励</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <Tabs defaultValue="stake" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stake">质押</TabsTrigger>
              <TabsTrigger value="rewards">奖励</TabsTrigger>
            </TabsList>

            <TabsContent value="stake" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs text-muted-foreground">您的余额</div>
                  <div className="mt-1 font-mono text-lg font-semibold">
                    {Number.parseFloat(balance).toFixed(2)} BASE
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs text-muted-foreground">总质押量</div>
                  <div className="mt-1 font-mono text-lg font-semibold">
                    {Number.parseFloat(totalStaked).toFixed(2)} BASE
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="amount">数量</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockPeriod">锁定期</Label>
                  <Select value={lockPeriod} onValueChange={setLockPeriod}>
                    <SelectTrigger id="lockPeriod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCK_PERIODS.map((period) => (
                        <SelectItem key={period.days} value={period.days.toString()}>
                          {period.days} 天 - {period.apy} 年化收益
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referrer">推荐人地址（可选）</Label>
                  <Input
                    id="referrer"
                    placeholder="0x..."
                    value={referrer}
                    onChange={(e) => setReferrer(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleStake}
                  disabled={staking || !amount || Number.parseFloat(amount) === 0}
                  className="w-full"
                  size="lg"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {staking ? "质押中..." : "质押代币"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="text-sm text-muted-foreground">待领取奖励</div>
                <div className="mt-1 text-3xl font-bold">{Number.parseFloat(pendingRewards).toFixed(4)} BASE</div>
              </div>

              <Button
                onClick={handleClaimRewards}
                disabled={Number.parseFloat(pendingRewards) === 0}
                className="w-full"
                size="lg"
              >
                领取奖励
              </Button>

              <p className="text-xs text-muted-foreground">
                推荐人可获得奖励的 10% 佣金。提前解除质押将收取 20% 罚金。
              </p>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
