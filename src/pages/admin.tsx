import { useState, useEffect } from "react";
import { Header } from "../components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { useWeb3 } from "../lib/web3-provider";
import { ethers } from "ethers";
import { BASE_TOKEN_ABI, PUMPER_ABI } from "../lib/contracts";
import { ArrowLeft, Users, Shield, Flame, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

// Replace with your deployed contract addresses
const BASE_TOKEN_ADDRESS = "0x...";
const PUMPER_ADDRESS = "0x...";

export default function AdminPage() {
  const { account, provider } = useWeb3();
  const { toast } = useToast();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);

  // Vesting state
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [vestingType, setVestingType] = useState<"seed" | "marketing" | "team">(
    "seed"
  );

  // Oracle state
  const [oracleAddress, setOracleAddress] = useState("");

  // Strategic reserve state
  const [reserveAmount, setReserveAmount] = useState("");
  const [reserveAction, setReserveAction] = useState<
    "claim" | "deposit" | "burn"
  >("claim");

  // Pumper state
  const [usdtAmount, setUsdtAmount] = useState("");
  const [pumperAction, setPumperAction] = useState<"buyback" | "burn">(
    "buyback"
  );

  useEffect(() => {
    checkOwnership();
  }, [account, provider]);

  const checkOwnership = async () => {
    if (!account || !provider) return;

    try {
      const contract = new ethers.Contract(
        BASE_TOKEN_ADDRESS,
        BASE_TOKEN_ABI,
        provider
      );
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error("检查所有权错误:", error);
    }
  };

  const handleAddVesting = async () => {
    if (!provider || !account) {
      toast({
        title: "错误",
        description: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }

    if (!beneficiary || !amount) {
      toast({
        title: "错误",
        description: "请填写所有字段",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        BASE_TOKEN_ADDRESS,
        BASE_TOKEN_ABI,
        signer
      );

      const amountWei = ethers.parseEther(amount);
      let tx;

      if (vestingType === "seed") {
        tx = await contract.addSeedVesting(beneficiary, amountWei);
      } else if (vestingType === "marketing") {
        tx = await contract.addMarketingVesting(beneficiary, amountWei);
      } else {
        tx = await contract.addTeamVesting(beneficiary, amountWei);
      }

      await tx.wait();
      toast({ title: "成功", description: "已添加归属计划" });
      setBeneficiary("");
      setAmount("");
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetOracle = async () => {
    if (!provider || !account) {
      toast({
        title: "错误",
        description: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }

    if (!oracleAddress) {
      toast({
        title: "错误",
        description: "请输入预言机地址",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        BASE_TOKEN_ADDRESS,
        BASE_TOKEN_ABI,
        signer
      );

      const tx = await contract.setOracle(oracleAddress);
      await tx.wait();
      toast({ title: "成功", description: "预言机地址已更新" });
      setOracleAddress("");
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStrategicReserve = async () => {
    if (!provider || !account) {
      toast({
        title: "错误",
        description: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }

    if (!reserveAmount) {
      toast({
        title: "错误",
        description: "请输入金额",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        BASE_TOKEN_ADDRESS,
        BASE_TOKEN_ABI,
        signer
      );

      const amountWei = ethers.parseEther(reserveAmount);
      let tx;

      if (reserveAction === "claim") {
        tx = await contract.claimStrategicReserve(amountWei);
      } else if (reserveAction === "deposit") {
        tx = await contract.depositStrategicReserve(amountWei);
      } else {
        tx = await contract.burnStrategicReserve(amountWei);
      }

      await tx.wait();
      toast({
        title: "成功",
        description: `战略储备${
          reserveAction === "claim"
            ? "领取"
            : reserveAction === "deposit"
            ? "存入"
            : "销毁"
        }成功`,
      });
      setReserveAmount("");
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePumperAction = async () => {
    if (!provider || !account) {
      toast({
        title: "错误",
        description: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }

    if (!usdtAmount) {
      toast({
        title: "错误",
        description: "请输入 USDT 金额",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(PUMPER_ADDRESS, PUMPER_ABI, signer);

      const amountWei = ethers.parseUnits(usdtAmount, 6); // USDT 使用 6 位小数
      let tx;

      if (pumperAction === "buyback") {
        tx = await contract.buyBackAndBurn(amountWei);
      } else {
        tx = await contract.burnTokens(amountWei);
      }

      await tx.wait();
      toast({
        title: "成功",
        description: `${
          pumperAction === "buyback" ? "回购并销毁" : "销毁代币"
        }成功`,
      });
      setUsdtAmount("");
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawUsdt = async () => {
    if (!provider || !account) {
      toast({
        title: "错误",
        description: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(PUMPER_ADDRESS, PUMPER_ABI, signer);

      const tx = await contract.withdrawUSDT();
      await tx.wait();
      toast({ title: "成功", description: "USDT 提取成功" });
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container flex min-h-[calc(100vh-80px)] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>需要连接钱包</CardTitle>
              <CardDescription>
                请先连接您的钱包以访问管理员面板
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container flex min-h-[calc(100vh-80px)] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>访问被拒绝</CardTitle>
              <CardDescription>
                您不是合约所有者，无法访问管理员面板
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/">
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  返回首页
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Button>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">管理员面板</h1>
          <p className="mt-2 text-muted-foreground">
            管理代币归属、预言机和战略储备
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Vesting Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                归属管理
              </CardTitle>
              <CardDescription>为受益人添加代币归属计划</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="beneficiary">受益人地址</Label>
                <Input
                  id="beneficiary"
                  placeholder="0x..."
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">代币数量</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vesting-type">归属类型</Label>
                <Select
                  value={vestingType}
                  onValueChange={(value: any) => setVestingType(value)}
                >
                  <SelectTrigger id="vesting-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seed">种子期 (18个月解锁)</SelectItem>
                    <SelectItem value="marketing">市场 (12个月解锁)</SelectItem>
                    <SelectItem value="team">团队 (24个月解锁)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAddVesting}
                disabled={loading}
                className="w-full"
              >
                {loading ? "处理中..." : "添加归属计划"}
              </Button>
            </CardContent>
          </Card>

          {/* Oracle Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                预言机配置
              </CardTitle>
              <CardDescription>设置战略储备销毁的预言机地址</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oracle">预言机地址</Label>
                <Input
                  id="oracle"
                  placeholder="0x..."
                  value={oracleAddress}
                  onChange={(e) => setOracleAddress(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSetOracle}
                disabled={loading}
                className="w-full"
              >
                {loading ? "处理中..." : "设置预言机"}
              </Button>
            </CardContent>
          </Card>

          {/* Strategic Reserve */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                战略储备
              </CardTitle>
              <CardDescription>管理战略储备代币</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reserve-amount">代币数量</Label>
                <Input
                  id="reserve-amount"
                  type="number"
                  placeholder="1000"
                  value={reserveAmount}
                  onChange={(e) => setReserveAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reserve-action">操作</Label>
                <Select
                  value={reserveAction}
                  onValueChange={(value: any) => setReserveAction(value)}
                >
                  <SelectTrigger id="reserve-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claim">领取储备</SelectItem>
                    <SelectItem value="deposit">存入储备</SelectItem>
                    <SelectItem value="burn">销毁储备</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleStrategicReserve}
                disabled={loading}
                className="w-full"
              >
                {loading ? "处理中..." : "执行操作"}
              </Button>
            </CardContent>
          </Card>

          {/* Data Receiver & Pumper */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                数据接收器
              </CardTitle>
              <CardDescription>执行回购和销毁操作</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usdt-amount">USDT 数量</Label>
                <Input
                  id="usdt-amount"
                  type="number"
                  placeholder="100"
                  value={usdtAmount}
                  onChange={(e) => setUsdtAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pumper-action">操作</Label>
                <Select
                  value={pumperAction}
                  onValueChange={(value: any) => setPumperAction(value)}
                >
                  <SelectTrigger id="pumper-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyback">回购并销毁</SelectItem>
                    <SelectItem value="burn">直接销毁</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handlePumperAction}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "处理中..." : "执行操作"}
                </Button>
                <Button
                  onClick={handleWithdrawUsdt}
                  disabled={loading}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {loading ? "处理中..." : "提取 USDT"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
