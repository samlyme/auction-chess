import type { Outcome } from "shared/types";

export function OutcomeModal({ outcome }: { outcome: Outcome }) {
  const winnerText = outcome.winner
    ? `${outcome.winner.charAt(0).toUpperCase() + outcome.winner.slice(1)} wins!`
    : "Draw!";

  const messageMap = {
    mate: "Checkmate",
    ff: "Forfeit",
    stalemate: "Stalemate",
    draw: "Draw",
    timeout: "Timeout",
  } as const;

  const messageText = messageMap[outcome.message];

  return (
    // Can use inset-0 instead of mt-115
    <div className="fixed mt-115 flex items-center justify-center bg-black/50 rounded-2xl">
      <div className="rounded-xl bg-neutral-800 p-8 text-center">
        <div className="mb-4 text-5xl font-bold text-white">{winnerText}</div>
        <div className="text-2xl text-neutral-400">{messageText}</div>
      </div>
    </div>
  );
}
