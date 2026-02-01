import { useMakeBidMutationOptions } from "@/queries/game";
import {
  skipToken,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useState, useEffect, useContext, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui";
import { LobbyContext } from "@/contexts/Lobby";
import { createGame } from "shared/game/utils";
import { useMyProfileOptions, useProfileOptions } from "@/queries/profiles";
import { type AuctionChessState, type Color } from "shared/types/game";
import { GameContext } from "@/contexts/Game";
import bootImage from "@/assets/images/shoes.png";

// Animation timing constants (in seconds for framer-motion durations, milliseconds for timeouts)
const FLASH_ANIMATION_DURATION = 0.5;
const FALLING_NUMBER_CLEANUP_TIMEOUT = 1200;
const FALLING_NUMBER_ANIMATION_DURATION = 0.6;
const BOOT_ANIMATION_DURATION = 0.8;
const BOOT_CLEANUP_TIMEOUT = 1000;
// Total duration for balance change animations (max of flash and falling number cleanup)
// const BALANCE_CHANGE_ANIMATION_DURATION = FALLING_NUMBER_CLEANUP_TIMEOUT;

interface PlayerInfoCardProps {
  username: string;
  color: Color;
  setBid?: React.Dispatch<React.SetStateAction<number>>;
}

export interface PlayerInfoCardRef {
  animateBalanceChange: (amount: number) => Promise<void>;
  syncBalance: () => void;
  animateBoot: () => Promise<void>;
}

const PlayerInfoCard = forwardRef<PlayerInfoCardRef, PlayerInfoCardProps>(
  ({ username, color, setBid }, ref) => {
  const { gameData, timers } = useContext(GameContext);

  // Stuff for timers
  const remainingMs = timers ? timers[color].remainingMs : 0;
  const totalSeconds = remainingMs / 1000;
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, "0");

  const controls = useAnimation();
  const [fallingNumber, setFallingNumber] = useState<{
    amount: number;
    key: number;
    xOffset: number;
    rotation: number;
  } | null>(null);

  const [bootAnimation, setBootAnimation] = useState<{
    key: number;
  } | null>(null);

  const [displayBalance, setDisplayBalance] = useState(
    gameData?.gameState.auctionState.balance[color] || 0
  );
  const { lobby } = useContext(LobbyContext);
  useEffect(() => {
    if (gameData) return;
    setDisplayBalance(lobby.config.gameConfig.auctionConfig.initBalance[color]);
  }, [lobby, gameData])

  const green = "#4ade80";
  const red = "#f87171";
  const flashColor = (color: string) =>
    controls.start({
      backgroundColor: [color, "#404040"],
      transition: { duration: FLASH_ANIMATION_DURATION, ease: "easeOut" },
    });
  const dropNumber = async (diff: number) => {
    const xOffset = Math.random() * 50 + 30; // Random horizontal offset 30 to 80 (tends right)
    const rotation = Math.random() * 30 + 10; // Random rotation 10 to 40 degrees (tends clockwise)
    setFallingNumber({ amount: diff, key: Date.now(), xOffset, rotation });
    await setTimeout(
      () => setFallingNumber(null),
      FALLING_NUMBER_CLEANUP_TIMEOUT
    );
  };
  const animateBalanceChange = async (amount: number) => {
    setDisplayBalance((prev) => {
      console.log("new animated balance " + color, prev + amount);
      return prev + amount;
    });
    await Promise.all([
      flashColor(amount > 0 ? green : red),
      dropNumber(amount),
    ]);
  };

  const syncBalance = () => {
    if (gameData) {
      setDisplayBalance(gameData.gameState.auctionState.balance[color]);
    }
  };

  const animateBoot = async () => {
    setBootAnimation({ key: Date.now() });
    await setTimeout(() => setBootAnimation(null), BOOT_CLEANUP_TIMEOUT);
  };

  // Expose animation methods to parent via ref
  useImperativeHandle(ref, () => ({
    animateBalanceChange,
    syncBalance,
    animateBoot,
  }));

  // Initialize display balance on mount
  useEffect(() => {
    if (gameData) {
      setDisplayBalance(gameData.gameState.auctionState.balance[color]);
    }
  }, []);

  return (
    <div
      className={`rounded-lg ${gameData?.gameState.turn === color ? "bg-green-800" : "bg-neutral-800"} relative p-4 ${fallingNumber || bootAnimation ? "z-50" : ""}`}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="rounded bg-neutral-700">
          <div className="flex gap-2">
            <div
              className={`m-2 w-22 p-2 ${timers && timers[color].isRunning ? "bg-green-600" : "bg-neutral-600"} ${timers || "opacity-30"}`}
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
        <motion.div
          animate={controls}
          onClick={() => {
            if (setBid)
              setBid(gameData?.gameState.auctionState.balance[color] || 0);
          }}
          className="relative flex-1 rounded bg-neutral-700"
        >
          <p className="mt-3 text-center text-7xl">${displayBalance}</p>
          {fallingNumber && (
            <motion.div
              key={fallingNumber.key}
              initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
              animate={{
                y: 120,
                x: fallingNumber.xOffset,
                opacity: 0,
                rotate: fallingNumber.rotation,
              }}
              transition={{
                duration: FALLING_NUMBER_ANIMATION_DURATION,
                ease: "easeIn",
              }}
              className={`pointer-events-none absolute top-1/2 left-3/4 -translate-x-1/2 text-3xl font-bold ${
                fallingNumber.amount > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {fallingNumber.amount > 0 ? "+" : "-"}$
              {Math.abs(fallingNumber.amount)}
            </motion.div>
          )}
          {bootAnimation && (
            <motion.img
              key={bootAnimation.key}
              src={bootImage}
              initial={{ x: -200, y: 20, rotate: -45, opacity: 0, scale: 0.8 }}
              animate={{
                x: 100,
                y: 20,
                rotate: 15,
                opacity: [0, 1, 1, 0],
                scale: 1.2,
              }}
              transition={{
                duration: BOOT_ANIMATION_DURATION,
                ease: "easeOut",
              }}
              className="pointer-events-none absolute top-1/2 left-0 h-24 w-24 -translate-y-1/2"
              alt="boot"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
});

interface BidComparisonProps {
  setBid: React.Dispatch<React.SetStateAction<number>>;
}

function BidInfo({ setBid }: BidComparisonProps) {
  const { gameData } = useContext(GameContext);
  const bidHistory = gameData?.gameState.auctionState.bidHistory || [];
  // TODO: fix this jank
  const bidStack = bidHistory[bidHistory.length - 1] ?? [];
  const lastBid = bidStack.at(-1) || { fold: true };
  const prevBid = lastBid.fold ? 0 : lastBid.amount;
  const minBid = gameData?.gameState.auctionState.minBid || 0;
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
  const {
    // whatever, forgot the naming convention. either playerColor or userColor works.
    playerColor: userColor,
    lobby,
    isHost,
  } = useContext(LobbyContext);

  const { gameData } = useContext(GameContext);

  const gameState = gameData
    ? gameData.gameState
    : createGame(lobby.config.gameConfig);

  const { data: userProfile } = useSuspenseQuery(useMyProfileOptions());
  if (!userProfile) throw new Error("failed to get my profile!");

  const oppId = isHost ? lobby.guestUid : lobby.hostUid;
  const { data: oppProfile } = useQuery(
    oppId
      ? useProfileOptions({ id: oppId })
      : { queryKey: [], queryFn: skipToken }
  );
  const oppColor = userColor === "white" ? "black" : "white";

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

  // Refs for coordinating animations between player cards
  const userCardRef = useRef<PlayerInfoCardRef>(null);
  const oppCardRef = useRef<PlayerInfoCardRef>(null);
  const lastProcessedGame = useRef<AuctionChessState | null>(null);

  // Process transient logs and coordinate animations
  useEffect(() => {
    if (!gameData) return;

    // Initialize on first render
    const curr = lastProcessedGame.current;
    if (curr === null) {
      lastProcessedGame.current = gameData.gameState;
      userCardRef.current?.syncBalance();
      oppCardRef.current?.syncBalance();
      return;
    }

    // If no log (e.g., from GET query or mutation), check if we need to sync
    if (gameData.log.length === 0) {
      // Skip if game state hasn't actually changed
      if (
        gameData.gameState.turn === curr.turn &&
        gameData.gameState.phase === curr.phase
      ) {
        return;
      }
      lastProcessedGame.current = gameData.gameState;
      userCardRef.current?.syncBalance();
      oppCardRef.current?.syncBalance();
      return;
    }

    // We have logs to process - update the last processed game state
    lastProcessedGame.current = gameData.gameState;

    // Build animation timeline from transient logs
    const userAnimations: { type: string; amount?: number }[] = [];
    const oppAnimations: { type: string; amount?: number }[] = [];

    for (const transient of gameData.log) {
      switch (transient.type) {
        case "deductFee": {
          const userFee = transient.amounts[userColor];
          const oppFee = transient.amounts[oppColor];
          if (userFee && userFee > 0) {
            userAnimations.push({ type: "fee", amount: -userFee });
          }
          if (oppFee && oppFee > 0) {
            oppAnimations.push({ type: "fee", amount: -oppFee });
          }
          break;
        }
        case "addIncome": {
          const userIncome = transient.amounts[userColor];
          const oppIncome = transient.amounts[oppColor];
          if (userIncome && userIncome > 0) {
            userAnimations.push({ type: "income", amount: userIncome });
          }
          if (oppIncome && oppIncome > 0) {
            oppAnimations.push({ type: "income", amount: oppIncome });
          }
          break;
        }
        case "earnInterest": {
          const userInterest = transient.amounts[userColor];
          const oppInterest = transient.amounts[oppColor];
          if (userInterest && userInterest > 0) {
            userAnimations.push({ type: "interest", amount: userInterest });
          }
          if (oppInterest && oppInterest > 0) {
            oppAnimations.push({ type: "interest", amount: oppInterest });
          }
          break;
        }
        case "autoFold": {
          if (transient.color === userColor) {
            userAnimations.push({ type: "boot" });
          } else {
            oppAnimations.push({ type: "boot" });
          }
          break;
        }
      }
    }

    // Execute synchronized animation timeline
    (async () => {
      // Phase 0: Boot animations (for autoFold - play first)
      const userBoots = userAnimations.filter(a => a.type === "boot");
      const oppBoots = oppAnimations.filter(a => a.type === "boot");

      if (userBoots.length > 0 || oppBoots.length > 0) {
        const bootPromises: Promise<void>[] = [];

        for (const _boot of userBoots) {
          bootPromises.push(userCardRef.current?.animateBoot() || Promise.resolve());
        }
        for (const _boot of oppBoots) {
          bootPromises.push(oppCardRef.current?.animateBoot() || Promise.resolve());
        }

        // Wait for ALL boot animations to complete before proceeding
        await Promise.all(bootPromises);
      }

      // Phase 1: Play all fee deductions (synchronized - wait for both to finish)
      // This includes bid payments, piece fees, etc - all come from server as deductFee logs
      const userFees = userAnimations.filter(a => a.type === "fee");
      const oppFees = oppAnimations.filter(a => a.type === "fee");

      if (userFees.length > 0 || oppFees.length > 0) {
        const feePromises: Promise<void>[] = [];

        for (const fee of userFees) {
          feePromises.push(userCardRef.current?.animateBalanceChange(fee.amount!) || Promise.resolve());
        }
        for (const fee of oppFees) {
          feePromises.push(oppCardRef.current?.animateBalanceChange(fee.amount!) || Promise.resolve());
        }

        // Wait for ALL fee animations to complete before proceeding
        await Promise.all(feePromises);
      }

      // Phase 2: Play all income/interest animations (synchronized - start at the same time)
      const userIncomes = userAnimations.filter(a => a.type === "income" || a.type === "interest");
      const oppIncomes = oppAnimations.filter(a => a.type === "income" || a.type === "interest");

      if (userIncomes.length > 0 || oppIncomes.length > 0) {
        const incomePromises: Promise<void>[] = [];

        for (const income of userIncomes) {
          incomePromises.push(userCardRef.current?.animateBalanceChange(income.amount!) || Promise.resolve());
        }
        for (const income of oppIncomes) {
          incomePromises.push(oppCardRef.current?.animateBalanceChange(income.amount!) || Promise.resolve());
        }

        // Wait for all income animations to complete
        await Promise.all(incomePromises);
      }
    })();
  }, [gameData, userColor, oppColor]);

  return (
    <>
      <div
        className={`h-full w-full rounded-2xl ${gameData && gameData.gameState.phase === "bid" ? "bg-green-900" : "bg-neutral-900"} p-4`}
      >
        <div className="flex h-full w-full flex-col gap-4">
          <PlayerInfoCard
            ref={oppCardRef}
            color={oppColor}
            username={oppProfile?.username || "waiting..."}
            setBid={setBid}
          />

          <div className="flex-1 rounded-lg bg-neutral-800 p-4">
            <div className="flex h-full flex-col gap-4">
              <BidInfo setBid={setBid} />
              <div className="flex-1 rounded-md bg-neutral-700 p-4">
                <div className="flex h-full gap-2">
                  <BidControls
                    bid={bid}
                    setBid={setBid}
                    minBid={gameState.auctionState.minBid}
                    maxBid={gameState.auctionState.balance[userColor]}
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
            ref={userCardRef}
            color={userColor}
            username={userProfile.username}
          />
        </div>
      </div>
    </>
  );
}
