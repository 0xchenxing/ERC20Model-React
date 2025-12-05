export const BASE_TOKEN_ABI = [
  "function getPendingVesting(address user) external view returns (uint256)",
  "function claimAllVesting() external",
  "function vestings(string category, address user) external view returns (uint256 totalAmount, uint256 released, uint256 start, uint256 duration)",
  "function claimAirdrop() external",
  "function lastClaimTime(address user) external view returns (uint256)",
  "function airdropPool() external view returns (uint256)",
  "function stake(uint256 amount, uint256 lockPeriodDays, address referrer) external",
  "function unstake(uint256 index) external",
  "function claimAllRewards() external",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function stakes(address user, uint256 index) external view returns (uint256 amount, uint256 startTime, uint256 lockPeriod, uint256 rewardDebt, address referrer)",
  "function getStakesCount(address user) external view returns (uint256)",
  "function totalStaked() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  // Admin functions
  "function addVesting(string category, address beneficiary, uint256 amount) external",
  "function setOracle(address oracle) external",
  "function claimStrategic(uint256 amount) external",
  "function depositStrategic(uint256 amount) external",
  "function burnStrategic(uint256 amount) external",
  "function strategicPool() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function remainingAlloc(string category) external view returns (uint256)",
] as const

export const PUMPER_ABI = [
  "function receiveDataAndAct(uint256 actionAmount) external",
  "function withdrawUSDT(uint256 amount) external",
  "function baseTokenAddress() external view returns (address)",
  "function usdtAddress() external view returns (address)",
  "function owner() external view returns (address)",
] as const

export const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
] as const
