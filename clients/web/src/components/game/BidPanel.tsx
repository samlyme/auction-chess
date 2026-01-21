import type { UseCountdownTimerResult } from "@/hooks/useCountdownTimer";
import { useMakeBidMutationOptions } from "@/queries/game";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, useContext } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui";
import { GameContext } from "@/contexts/Game";
import usePrevious from "@/hooks/usePrevious";

interface PlayerInfoCardProps {
  username: string;
  balance: number;
  timer: UseCountdownTimerResult;
  enableTimer: boolean;
  isTurn: boolean;
  setBid?: React.Dispatch<React.SetStateAction<number>>;
}

function PlayerInfoCard({
  username,
  balance,
  timer,
  enableTimer,
  isTurn,
  setBid,
}: PlayerInfoCardProps) {
  const { remainingMs } = timer;

  const totalSeconds = remainingMs / 1000;

  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, "0");

const prevBalance = usePrevious(balance);
const controls = useAnimation();
const [fallingNumber, setFallingNumber] = useState<{amount: number, key: number, xOffset: number, rotation: number} | null>(null);

useEffect(() => {
    // Prevent flashing on the very first render
    if (prevBalance === null) return;

    const isIncrease = balance > prevBalance;
    const isDecrease = balance < prevBalance;

    // 2. Define colors (Green for up, Red for down)
    const flashColor = isIncrease
      ? "#4ade80" // Emerald green
      : "#f87171"; // Red

    if (isIncrease || isDecrease) {
      // 3. Trigger the animation sequence
      controls.start({
        backgroundColor: [flashColor, "#404040"],
        transition: { duration: 0.5, ease: "easeOut" },
      });

      // Trigger falling number animation with random trajectory
      const diff = balance - prevBalance;
      const xOffset = Math.random() * 50 + 30; // Random horizontal offset 30 to 80 (tends right)
      const rotation = Math.random() * 30 + 10; // Random rotation 10 to 40 degrees (tends clockwise)
      setFallingNumber({ amount: diff, key: Date.now(), xOffset, rotation });
      setTimeout(() => setFallingNumber(null), 1200);
    }
  }, [balance, prevBalance, controls]);

  return (
    <div
      className={`rounded-lg ${isTurn ? "bg-green-800" : "bg-neutral-800"} p-4 relative ${fallingNumber ? "z-50" : ""}`}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="rounded bg-neutral-700">
          <div className="flex gap-2">
            <div
              className={`m-2 w-22 p-2 ${timer.isRunning ? "bg-green-600" : "bg-neutral-600"} ${enableTimer || "opacity-30"}`}
            >
              <p className="text-2xl">
                {minutes}:{seconds}
              </p>
            </div>
            <div className="m-2 bg-neutral-600 p-2">
              <p className="text-lg">{username}</p>
            </div>
          </div>
        </div>
        <motion.div animate={controls} onClick={() => {if(setBid) setBid(balance)}}
        className="relative flex-1 rounded bg-neutral-700">
          <p className="mt-3 text-center text-7xl">${balance}</p>
          {fallingNumber && (
            <motion.div
              key={fallingNumber.key}
              initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
              animate={{
                y: 120,
                x: fallingNumber.xOffset,
                opacity: 0,
                rotate: fallingNumber.rotation
              }}
              transition={{
                duration: .6,
                ease: "easeIn"
              }}
              className={`absolute left-3/4 top-1/2 -translate-x-1/2 text-3xl font-bold pointer-events-none ${
                fallingNumber.amount > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {fallingNumber.amount > 0 ? "+" : "-"}${fallingNumber.amount}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

interface BidComparisonProps {
  prevBid: number;
  minBid: number;
  setBid: React.Dispatch<React.SetStateAction<number>>;
}

function BidInfo({ prevBid, minBid, setBid }: BidComparisonProps) {
  return (
    <div className="rounded-md bg-neutral-700 p-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex-1 rounded-sm bg-blue-500 p-2">
          <h3 className="text-center text-sm">Previous Bid</h3>
          <h2 className="text-center text-4xl">${prevBid}</h2>
        </div>
        <div
          onClick={() => setBid(minBid)}
          className="flex-1 rounded-sm bg-neutral-500 p-2"
        >
          <h3 className="text-center text-sm">Min Raise</h3>
          <h2 className="text-center text-4xl">+${minBid - prevBid}</h2>
        </div>
      </div>
    </div>
  );
}

interface BidControlsProps {
  bid: number;
  setBid: React.Dispatch<React.SetStateAction<number>>;
  minBid: number;
  maxBid: number;
  onBid: (amount: number) => void;
  onFold: () => void;
  isBidPending: boolean;
}

function BidControls({
  bid,
  setBid,
  minBid,
  maxBid,
  onBid,
  onFold,
  isBidPending,
}: BidControlsProps) {
  const canBid = bid >= minBid && bid <= maxBid;

  const [inputValue, setInputValue] = useState<string>(bid.toString());
  useEffect(() => {
    setInputValue(bid.toString());
  }, [bid]);
  const [isValidInput, setIsValidInput] = useState<boolean>(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    const i = parseInt(e.target.value, 10);
    if (isNaN(i)) {
      setIsValidInput(false);
    } else {
      if (i <= maxBid && i >= minBid) {
        setIsValidInput(true);
        setBid(i);
      } else {
        setIsValidInput(false);
      }
    }
  };

  return (
    <div className="flex flex-2 flex-col gap-2">
      <div className="flex flex-col rounded-sm bg-neutral-600 p-2">
        <h3 className="text-center">Current Bid</h3>
        <div className="flex-1 bg-neutral-500">
          <input
            type="text"
            placeholder={minBid.toString()}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.code === "Enter") {
                if (isValidInput) onBid(bid);
                else if (inputValue.toLowerCase() === "fold") onFold();
              }
            }}
            onFocus={(e) => e.target.select()}
            onBlur={() => {
              if (!isValidInput) {
                setInputValue(bid.toString());
                setIsValidInput(true);
              }
            }}
            className={`w-full bg-transparent p-2 text-center text-5xl outline-none ${!isValidInput ? "text-red-500" : "text-white"}`}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-2 gap-2">
          <Button
            onClick={() => onBid(bid)}
            disabled={!canBid || isBidPending}
            variant="green"
            className="flex-1 px-4 py-2 text-xl"
            loading={isBidPending}
            loadingText="Bidding..."
          >
            BID
          </Button>
          <Button
            onClick={onFold}
            disabled={isBidPending}
            variant="red"
            className="flex-1 px-4 py-2 text-xl"
            loading={isBidPending}
            loadingText="Folding..."
          >
            FOLD
          </Button>
        </div>
        {/* Technically, this is slightly sub optimal but its fine. */}
        <Button
          onClick={() => setBid(maxBid)}
          variant="yellow"
          className="flex-1 px-4 py-2 text-xl"
          fullWidth
        >
          Max
        </Button>
      </div>
    </div>
  );
}

function BidAdjustmentControls({
  bid,
  setBid,
  minBid,
  maxBid,
}: {
  bid: number;
  setBid: React.Dispatch<React.SetStateAction<number>>;
  minBid: number;
  maxBid: number;
}) {
  const stepSmall = 1;
  const stepLarge = 5;

  const r = maxBid - minBid;
  const n = 15; // no. of large steps to cover.
  const idealScale = r / (stepLarge * n);

  const defaultScale = Math.pow(10, Math.floor(Math.log10(idealScale)));
  const [scale, setScale] = useState<number>(Math.max(defaultScale, 1));

  const incLarge = () =>
    setBid((curr) => Math.min(curr + stepLarge * scale, maxBid));
  const incSmall = () =>
    setBid((curr) => Math.min(curr + stepSmall * scale, maxBid));
  const onReset = () => setBid(minBid);
  const decSmall = () =>
    setBid((curr) => Math.max(curr - stepSmall * scale, minBid));
  const decLarge = () =>
    setBid((curr) => Math.max(curr - stepLarge * scale, minBid));

  const incScale = () =>
    setScale((curr) => {
      const next = curr * 10;
      if (stepSmall * next > r) return curr;
      return next;
    });
  const decScale = () => setScale((curr) => Math.max(curr / 10, 1));

  const canInc = bid < maxBid;
  const canDec = bid > minBid;

  // TODO: implement this properly
  const canIncScale = stepSmall * scale * 10 <= r;
  const canDecScale = scale > 1;

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-col items-center gap-1">
        <Button
          onClick={incScale}
          disabled={!canIncScale}
          variant="purple"
          className="flex w-full flex-1 items-center justify-center rounded-md p-0 text-purple-700"
        >
          <span className="rotate-270">»</span>
        </Button>

        <Button
          onClick={incLarge}
          disabled={!canInc}
          variant="green"
          className="flex w-full flex-1 items-center justify-center rounded-md p-0"
        >
          +{stepLarge * scale}
        </Button>

        <Button
          onClick={incSmall}
          disabled={!canInc}
          variant="green"
          className="flex w-full flex-1 items-center justify-center rounded-md p-0"
        >
          +{stepSmall * scale}
        </Button>

        <Button
          onClick={onReset}
          variant="yellow"
          className="flex w-full flex-1 items-center justify-center rounded-md border border-yellow-500 bg-yellow-300 p-0 text-yellow-700 hover:bg-yellow-200"
        >
          Reset
        </Button>

        <Button
          onClick={decSmall}
          disabled={!canDec}
          variant="red"
          className="flex w-full flex-1 items-center justify-center rounded-md p-0"
        >
          -{stepSmall * scale}
        </Button>
        <Button
          onClick={decLarge}
          disabled={!canDec}
          variant="red"
          className="flex w-full flex-1 items-center justify-center rounded-md p-0"
        >
          -{stepLarge * scale}
        </Button>

        <Button
          onClick={decScale}
          disabled={!canDecScale}
          variant="purple"
          className="flex w-full flex-1 items-center justify-center rounded-md p-0 text-purple-700"
        >
          <span className="rotate-90">»</span>
        </Button>
      </div>
    </div>
  );
}

export default function BidPanel() {
  const {gameState: game, defaultGameState, timers, playerColor, userProfile, oppProfile} = useContext(GameContext);
  const gameState = game || defaultGameState;

  const showTurn = !!game

  const [bid, setBid] = useState<number>(gameState.auctionState.minBid);
  useEffect(() => {
    setBid(gameState.auctionState.minBid);
  }, [gameState.auctionState.minBid]);
  const makeBidMutation = useMutation(useMakeBidMutationOptions());

  const handleBid = (amount: number) => {
    makeBidMutation.mutate({ amount, fold: false });
  };

  const handleFold = () => {
    makeBidMutation.mutate({ fold: true });
  };
  const { bidHistory } = gameState.auctionState;
  const opponentColor = playerColor === "white" ? "black" : "white";

  // TODO: fix this jank
  const bidStack = bidHistory[bidHistory.length - 1] ?? [];
  const lastBid = bidStack.at(-1) || { fold: true };
  const prevBidAmount = lastBid.fold ? 0 : lastBid.amount;

  const isPlayerTurn = gameState.turn === playerColor;

  return (
    <>
      <div className="flex h-full w-full flex-col gap-4">
        <PlayerInfoCard
          username={oppProfile?.username || "waiting..."}
          balance={gameState.auctionState.balance[opponentColor]}
          timer={timers[opponentColor]}
          enableTimer={!!game?.timeState}
          isTurn={showTurn && !isPlayerTurn}
          setBid={setBid}
        />

        <div className="flex-1 rounded-lg bg-neutral-800 p-4">
          <div className="flex h-full flex-col gap-4">
            <BidInfo
              setBid={setBid}
              prevBid={prevBidAmount}
              minBid={gameState.auctionState.minBid}
            />
            <div className="flex-1 rounded-md bg-neutral-700 p-4">
              <div className="flex h-full gap-2">
                <BidControls
                  bid={bid}
                  setBid={setBid}
                  minBid={gameState.auctionState.minBid}
                  maxBid={gameState.auctionState.balance[playerColor]}
                  onBid={handleBid}
                  onFold={handleFold}
                  isBidPending={makeBidMutation.isPending}
                />
                {/* <BidAdjustmentControls
                  bid={bid}
                  setBid={setBid}
                  minBid={gameState.auctionState.minBid}
                  maxBid={gameState.auctionState.balance[playerColor]}
                /> */}
              </div>
            </div>
          </div>
        </div>

        <PlayerInfoCard
          username={userProfile.username}
          balance={gameState.auctionState.balance[playerColor]}
          timer={timers[playerColor]}
          enableTimer={!!gameState?.timeState}
          isTurn={showTurn && isPlayerTurn}
        />
      </div>
    </>
  );
}
