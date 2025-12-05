  "use client"
  
  import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
  import { ethers } from "ethers"
  import { useToast } from "../hooks/use-toast"
  import { useAppKitAccount, useAppKitProvider, useDisconnect, useAppKitNetwork } from "@reown/appkit/react"
  
  type WalletType = "appkit" | null
  
  interface Web3ContextType {
    provider: ethers.BrowserProvider | null
    signer: ethers.Signer | null
    account: string | null
    chainId: number | null
    isConnecting: boolean
    connect: () => Promise<void>
    disconnect: () => Promise<void>
  }
  
  const Web3Context = createContext<Web3ContextType | undefined>(undefined)
  
  export function Web3Provider({ children }: { children: ReactNode }) {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
    const [signer, setSigner] = useState<ethers.Signer | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const { toast } = useToast()
  
    const { address, isConnected } = useAppKitAccount()
    const { chainId } = useAppKitNetwork()
    const { walletProvider } = useAppKitProvider("eip155")
    const { disconnect: appKitDisconnect } = useDisconnect()
  
    console.log("[v0] AppKit status:", { address, isConnected, chainId, hasProvider: !!walletProvider })
  
    // 规范化 chainId，兼容 number | bigint | string（含 CAIP，如 "eip155:1"）
    const normalizedChainId: number | null = (() => {
      if (chainId === undefined || chainId === null) return null
      if (typeof chainId === "number") return chainId
      if (typeof chainId === "bigint") return Number(chainId)
      if (typeof chainId === "string") {
        const raw = chainId.includes(":") ? chainId.split(":").pop()! : chainId
        const n = Number(raw)
        return Number.isFinite(n) ? n : null
      }
      return null
    })()
  
    const connect = async () => {
      setIsConnecting(true)
      // AppKit modal will handle the connection
      setIsConnecting(false)
    }
  
    useEffect(() => {
      if (isConnected && address && walletProvider) {
        const setupProvider = async () => {
          try {
            console.log("[v0] Setting up provider for address:", address)
            const ethersProvider = new ethers.BrowserProvider(walletProvider as any)
            const ethersSigner = await ethersProvider.getSigner()
  
            setProvider(ethersProvider)
            setSigner(ethersSigner)
  
            console.log("[v0] Provider setup complete")
  
            toast({
              title: "钱包已连接",
              description: `地址: ${address.slice(0, 6)}...${address.slice(-4)}`,
            })
          } catch (error) {
            console.error("[v0] Error setting up provider:", error)
            toast({
              title: "连接失败",
              description: "无法设置钱包提供者",
              variant: "destructive",
            })
          }
        }
  
        setupProvider()
      } else if (!isConnected) {
        if (provider) {
          console.log("[v0] Clearing provider due to disconnection")
          setProvider(null)
          setSigner(null)
        }
      }
    }, [isConnected, address, walletProvider])
  
    const disconnect = async () => {
      try {
        await appKitDisconnect()
        setProvider(null)
        setSigner(null)
  
        toast({
          title: "钱包已断开",
          description: "您的钱包已断开连接",
        })
      } catch (error) {
        console.error("Error disconnecting:", error)
        toast({
          title: "断开失败",
          description: "无法断开钱包连接",
          variant: "destructive",
        })
      }
    }
  
    return (
      <Web3Context.Provider
        value={{
          provider,
          signer,
          account: address || null,
            chainId: normalizedChainId,
          isConnecting,
          connect,
          disconnect,
        }}
      >
        {children}
      </Web3Context.Provider>
    )
  }
  
  export function useWeb3() {
    const context = useContext(Web3Context)
    if (context === undefined) {
      throw new Error("useWeb3 must be used within a Web3Provider")
    }
    return context
  }