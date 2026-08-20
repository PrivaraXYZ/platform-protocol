#!/usr/bin/env bash
set -euo pipefail

# E2E orchestrator: anvil + plain stack deploy + SDK smoke tests.
#
# Steps:
#   1. Build SDK
#   2. Start anvil (background, deterministic accounts)
#   3. Deploy MockUSDC via forge create
#   4. Run plain Deploy.s.sol for escrow, capture addresses
#   5. Mint USDC to deployer + approve plainEscrow
#   6. Write e2e/.addresses.local.json + run vitest (e2e/flows/*.test.ts)
#   7. Stop anvil

E2E_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$E2E_DIR/.." && pwd)"

# Anvil deterministic account #0
ANVIL_PK="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
ANVIL_ADDR="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
ANVIL_RPC="${ANVIL_RPC:-http://127.0.0.1:8545}"

ANVIL_PID=""
cleanup() {
  if [ -n "${ANVIL_PID:-}" ] && kill -0 "$ANVIL_PID" 2>/dev/null; then
    echo "Stopping anvil (pid=$ANVIL_PID)..."
    kill "$ANVIL_PID" 2>/dev/null || true
    wait "$ANVIL_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Error: '$1' not found. Please install it."
    exit 1
  }
}
require_cmd anvil
require_cmd forge
require_cmd cast
require_cmd pnpm

cd "$ROOT"

echo "[1/6] Building SDK..."
pnpm --filter @reineira-os/sdk run build > /dev/null

echo "[2/6] Starting anvil..."
anvil --silent &
ANVIL_PID=$!

# Wait for anvil to respond
for i in {1..40}; do
  if cast chain-id --rpc-url "$ANVIL_RPC" > /dev/null 2>&1; then
    break
  fi
  sleep 0.25
done
cast chain-id --rpc-url "$ANVIL_RPC" > /dev/null

echo "[3/6] Deploying MockUSDC..."
USDC_OUT=$(cd "$ROOT/packages/shared" && forge create \
  contracts/mocks/MockUSDC.sol:MockUSDC \
  --rpc-url "$ANVIL_RPC" \
  --private-key "$ANVIL_PK" \
  --broadcast 2>&1)
USDC_ADDRESS=$(echo "$USDC_OUT" | awk '/Deployed to:/ {print $3}')
if [ -z "$USDC_ADDRESS" ]; then
  echo "Failed to capture MockUSDC address. Output:"
  echo "$USDC_OUT"
  exit 1
fi
echo "  MockUSDC: $USDC_ADDRESS"

echo "[4/6] Deploying plain escrow stack..."
ESCROW_OUT=$(cd "$ROOT/packages/escrow" && \
  PRIVATE_KEY="$ANVIL_PK" \
  USDC_ADDRESS="$USDC_ADDRESS" \
  CCTP_TRANSMITTER_ADDRESS="0x000000000000000000000000000000000000dEaD" \
  forge script script/Deploy.s.sol --rpc-url "$ANVIL_RPC" --broadcast 2>&1)
ESCROW_ADDR=$(echo "$ESCROW_OUT" | awk '/^  Escrow:/ {print $2}' | tail -1)
ESCROW_RECEIVER=$(echo "$ESCROW_OUT" | awk '/^  CCTPV2EscrowReceiver:/ {print $2}' | tail -1)
if [ -z "$ESCROW_ADDR" ] || [ -z "$ESCROW_RECEIVER" ]; then
  echo "Failed to parse escrow deploy output. Last 30 lines:"
  echo "$ESCROW_OUT" | tail -30
  exit 1
fi
echo "  Escrow: $ESCROW_ADDR"
echo "  CCTPV2EscrowReceiver: $ESCROW_RECEIVER"

echo "[5/6] Minting USDC to deployer..."
# Mint 1M USDC (6 decimals) to deployer
cast send "$USDC_ADDRESS" \
  "mint(address,uint256)" "$ANVIL_ADDR" "1000000000000" \
  --rpc-url "$ANVIL_RPC" --private-key "$ANVIL_PK" > /dev/null
echo "  USDC minted to deployer"

# Write addresses
cat > "$E2E_DIR/.addresses.local.json" <<EOF
{
  "rpcUrl": "$ANVIL_RPC",
  "chainId": 31337,
  "privateKey": "$ANVIL_PK",
  "deployer": "$ANVIL_ADDR",
  "addresses": {
    "usdc": "$USDC_ADDRESS",
    "plainEscrow": "$ESCROW_ADDR",
    "plainEscrowReceiver": "$ESCROW_RECEIVER"
  }
}
EOF
echo "  Wrote $E2E_DIR/.addresses.local.json"

echo "[6/6] Running e2e flows..."
cd "$E2E_DIR" && pnpm run test

echo ""
echo "✓ E2E suite complete"
