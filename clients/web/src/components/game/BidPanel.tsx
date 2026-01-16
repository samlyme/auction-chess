import type { UseCountdownTimerResult } from "@/hooks/useCountdownTimer";
import { useMakeBidMutationOptions } from "@/queries/game";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { AuctionChessState, Color } from "shared/types";

interface PlayerInfoCardProps {
  username: string;
  balance: number;
  timer: UseCountdownTimerResult;
  enableTimer: boolean;
}

function PlayerInfoCard({ username, balance, timer, enableTimer }: PlayerInfoCardProps) {
  const { remainingMs } = timer;

  const totalSeconds = remainingMs / 1000;

  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, "0");


  return (
    <div className="rounded-lg bg-neutral-800 p-4">
      <div className="flex h-full flex-col gap-4">
        <div className="rounded bg-neutral-700">
          <div className="flex gap-2">
            <div
              className={`w-22 m-2 p-2 ${timer.isRunning ? "bg-green-600" : "bg-neutral-600"} ${enableTimer || "opacity-30"}`}
            >
              <p className="text-2xl">
                {minutes}:{seconds}
              </p>
            </div>
            <div className="m-2 bg-neutral-600 p-2">
              <p className="text-2xl">{username}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 rounded bg-neutral-700">
          <p className="mt-3 text-center text-7xl">${balance}</p>
        </div>
      </div>
    </div>
  );
}

interface BidComparisonProps {
  opponentBid: number;
  yourBid: number;
}

function BidComparison({ opponentBid, yourBid }: BidComparisonProps) {
  return (
    <div className="rounded-md bg-neutral-700 p-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex-1 rounded-sm bg-red-500 p-2">
          <h3 className="text-center text-sm">Opponent Bid</h3>
          <h2 className="text-center text-4xl">${opponentBid}</h2>
        </div>
        <div className="flex-1 rounded-sm bg-blue-500 p-2">
          <h3 className="text-center text-sm">Your Bid</h3>
          <h2 className="text-center text-4xl">${yourBid}</h2>
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
        console.log("valid bid input", i);

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
            onFocus={(e) => e.target.select()}
            onBlur={() => {
              if (!isValidInput) {
                setInputValue(bid.toString());
                setIsValidInput(true);
              }
            }}
            className={`placeholder:text-color-tertiary w-full bg-transparent p-2 text-center text-5xl outline-none ${!isValidInput ? "text-red-500" : "text-white"}`}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-2 gap-2">
          <button
            onClick={() => onBid(bid)}
            disabled={!canBid || isBidPending}
            className="flex-1 cursor-pointer rounded bg-green-400 px-4 py-2 text-2xl hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBidPending ? "Bidding..." : "BID"}
          </button>
          <button
            onClick={onFold}
            disabled={isBidPending}
            className="flex-1 cursor-pointer rounded bg-red-400 px-4 py-2 text-2xl hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBidPending ? "Folding..." : "FOLD"}
          </button>
        </div>
        <button
          onClick={() => setBid(maxBid)}
          className="w-full flex-1 cursor-pointer rounded bg-yellow-400 px-4 py-2 text-xl hover:bg-yellow-300"
        >
          Max
        </button>
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
        <button
          onClick={incScale}
          disabled={!canIncScale}
          className="flex w-full flex-1 cursor-pointer items-center justify-center rounded-md bg-purple-400 text-purple-700 hover:bg-purple-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="rotate-270">»</span>
        </button>

        <button
          onClick={incLarge}
          disabled={!canInc}
          className="flex w-full flex-1 cursor-pointer items-center justify-center rounded-md bg-green-400 hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          +{stepLarge * scale}
        </button>

        <button
          onClick={incSmall}
          disabled={!canInc}
          className="flex w-full flex-1 cursor-pointer items-center justify-center rounded-md bg-green-400 hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          +{stepSmall * scale}
        </button>

        <button
          onClick={onReset}
          className="flex w-full flex-1 cursor-pointer items-center justify-center rounded-md border border-yellow-500 bg-yellow-300 text-yellow-700 hover:bg-yellow-200"
        >
          Reset
        </button>

        <button
          onClick={decSmall}
          disabled={!canDec}
          className="flex w-full flex-1 cursor-pointer items-center justify-center rounded-md bg-red-400 hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          -{stepSmall * scale}
        </button>
        <button
          onClick={decLarge}
          disabled={!canDec}
          className="flex w-full flex-1 cursor-pointer items-center justify-center rounded-md bg-red-400 hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          -{stepLarge * scale}
        </button>

        <button
          onClick={decScale}
          disabled={!canDecScale}
          className="flex w-full flex-1 cursor-pointer items-center justify-center rounded-md bg-purple-400 text-purple-700 hover:bg-purple-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="rotate-90">»</span>
        </button>
      </div>
    </div>
  );
}

export default function BidPanel({
  username,
  oppUsername,
  playerColor,
  gameState,
  timers,
  enableTimers,
}: {
  username: string;
  oppUsername: string | undefined;
  playerColor: Color;
  gameState: AuctionChessState;
  timers: Record<Color, UseCountdownTimerResult>;
  enableTimers: boolean
}) {
  const [bid, setBid] = useState<number>(gameState.auctionState.minBid);
  useEffect(() => {
    if (gameState.turn === playerColor) setBid(gameState.auctionState.minBid);
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
  const lastBid = bidStack.at(-1) ?? { amount: 0 };
  const secondLastBid = bidStack.at(-2) ?? { amount: 0 };

  // Extract bid amounts from the last two bids
  let prevPlayerBidAmount = 0;
  let prevOppBidAmount = 0;
  if (gameState.turn !== playerColor) {
    prevPlayerBidAmount = "amount" in lastBid ? lastBid.amount : 0;
    prevOppBidAmount = "amount" in secondLastBid ? secondLastBid.amount : 0;
  } else {
    prevOppBidAmount = "amount" in lastBid ? lastBid.amount : 0;
    prevPlayerBidAmount = "amount" in secondLastBid ? secondLastBid.amount : 0;
  }

  return (
    <div className="h-full w-full rounded-2xl bg-neutral-900 p-4">
      <div className="flex h-full w-full flex-col gap-4">
        <PlayerInfoCard
          username={oppUsername || "waiting..."}
          balance={gameState.auctionState.balance[opponentColor]}
          timer={timers[opponentColor]}
          enableTimer={enableTimers}
        />

        <div className="flex-1 rounded-lg bg-neutral-800 p-4">
          <div className="flex h-full flex-col gap-4">
            <BidComparison
              opponentBid={prevOppBidAmount}
              yourBid={prevPlayerBidAmount}
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
                <BidAdjustmentControls
                  bid={bid}
                  setBid={setBid}
                  minBid={gameState.auctionState.minBid}
                  maxBid={gameState.auctionState.balance[playerColor]}
                />
              </div>
            </div>
          </div>
        </div>

        <PlayerInfoCard
          username={username}
          balance={gameState.auctionState.balance[playerColor]}
          timer={timers[playerColor]}
          enableTimer={enableTimers}
        />
      </div>
    </div>
  );
}
