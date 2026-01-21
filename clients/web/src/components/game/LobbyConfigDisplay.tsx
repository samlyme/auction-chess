import type { LobbyConfig } from "shared/types/lobbies";
import type {
  TimeConfig,
  InterestConfig,
  PieceIncomeConfig,
  PieceFeeConfig,
  Role,
} from "shared/types/game";

interface LobbyConfigDisplayProps {
  config: LobbyConfig;
}

function HostColorSection({ hostColor }: { hostColor: string }) {
  return (
    <div className="rounded bg-neutral-700 p-3">
      <p className="text-sm text-neutral-400">Host Color</p>
      <p className="text-xl font-semibold capitalize">{hostColor}</p>
    </div>
  );
}

function TimeConfigSection({ timeConfig }: { timeConfig: TimeConfig }) {
  return (
    <div className="rounded bg-neutral-700 p-3">
      <p className="text-sm text-neutral-400">Time Control</p>
      {timeConfig.enabled ? (
        <p className="text-xl font-semibold">
          {Math.floor(timeConfig.initTime.white / (1000 * 60))} minutes
        </p>
      ) : (
        <p className="text-xl text-neutral-400">Disabled</p>
      )}
    </div>
  );
}

function InterestConfigSection({
  interestConfig,
}: {
  interestConfig: InterestConfig;
}) {
  return (
    <div className="rounded bg-neutral-700 p-3">
      <p className="text-sm text-neutral-400">Interest Rate</p>
      {interestConfig.enabled ? (
        <p className="text-xl font-semibold">
          {Math.round(interestConfig.rate * 100)}%
        </p>
      ) : (
        <p className="text-xl text-neutral-400">Disabled</p>
      )}
    </div>
  );
}

function PieceValuesSection({
  title,
  pieceValues,
}: {
  title: string;
  pieceValues: Record<Role, number>;
}) {
  const pieces: readonly Role[] = [
    "pawn",
    "knight",
    "bishop",
    "rook",
    "queen",
    "king",
  ];

  return (
    <div className="rounded bg-neutral-700 p-3">
      <p className="mb-3 text-sm text-neutral-400">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {pieces.map((piece) => (
          <div key={piece} className="rounded bg-neutral-600 p-3">
            <p className="text-sm text-neutral-400 capitalize">{piece}</p>
            <p className="text-xl font-semibold">{pieceValues[piece]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieceConfigSection({
  title,
  config,
}: {
  title: string;
  config: PieceIncomeConfig | PieceFeeConfig;
}) {
  return (
    <div className="rounded bg-neutral-700 p-3">
      <p className="text-sm text-neutral-400">{title}</p>
      {config.enabled ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(
            [
              "pawn",
              "knight",
              "bishop",
              "rook",
              "queen",
              "king",
            ] as const
          ).map((piece) => (
            <div key={piece} className="rounded bg-neutral-600 p-3">
              <p className="text-sm text-neutral-400 capitalize">{piece}</p>
              <p className="text-xl font-semibold">
                {config.enabled
                  ? title === "Piece Income"
                    ? (config as Extract<PieceIncomeConfig, { enabled: true }>)
                        .pieceIncome[piece]
                    : (config as Extract<PieceFeeConfig, { enabled: true }>)
                        .pieceFee[piece]
                  : 0}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-xl text-neutral-400">Disabled</p>
      )}
    </div>
  );
}

export default function LobbyConfigDisplay({
  config,
}: LobbyConfigDisplayProps) {
  const { gameConfig } = config;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Game Configuration</h3>

      <HostColorSection hostColor={gameConfig.hostColor} />
      <TimeConfigSection timeConfig={gameConfig.timeConfig} />
      <InterestConfigSection interestConfig={gameConfig.interestConfig} />
      <PieceConfigSection
        title="Piece Income"
        config={gameConfig.pieceIncomeConfig}
      />
      <PieceConfigSection
        title="Piece Fee"
        config={gameConfig.pieceFeeConfig}
      />
    </div>
  );
}
