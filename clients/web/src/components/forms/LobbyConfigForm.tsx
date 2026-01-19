import {
  useCreateLobbyMutationOptions,
  useUpdateLobbyConfigMutationOptions,
} from "@/queries/lobbies";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { Color } from "shared/types/game";
import type { LobbyConfig } from "shared/types/lobbies";

// NOTE: this is currently tightly coupled to my mutations
// TODO: decouple this from page logic LOL!!
export default function LobbyConfigForm({
  isCreate,
  initConfig,
}: {
  isCreate: boolean;
  initConfig?: LobbyConfig;
}) {
  const [hostColor, setHostColor] = useState<Color>(
    initConfig ? initConfig.gameConfig.hostColor : "white"
  );
  const [timeEnabled, setTimeEnabled] = useState(
    initConfig ? initConfig.gameConfig.timeConfig.enabled : false
  );

  //   TODO: separate inputs for white and black initTime in config.
  const initTime = initConfig
    ? initConfig.gameConfig.timeConfig.enabled
      ? Math.floor(
          initConfig.gameConfig.timeConfig.initTime.white / (1000 * 60)
        )
      : 5
    : 5;
  const [timeMinutes, setTimeMinutes] = useState(initTime);

  const [interestEnabled, setInterestEnabled] = useState(
    initConfig ? initConfig.gameConfig.interestConfig.enabled : false
  );

  const initRate = initConfig
    ? initConfig.gameConfig.interestConfig.enabled
      ? initConfig.gameConfig.interestConfig.rate
      : 0.05
    : 0.05;
  const [interestRate, setInterestRate] = useState(initRate);

  const [isModified, setIsModified] = useState(isCreate);

  const navigate = useNavigate();

  const configureLobbyMutation = useMutation(
    isCreate
      ? useCreateLobbyMutationOptions()
      : useUpdateLobbyConfigMutationOptions()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await configureLobbyMutation.mutateAsync({
      gameConfig: {
        hostColor,
        timeConfig: timeEnabled
          ? {
              enabled: true,
              initTime: {
                white: timeMinutes * 60 * 1000,
                black: timeMinutes * 60 * 1000,
              },
            }
          : { enabled: false },
        interestConfig: interestEnabled
          ? {
              enabled: true,
              rate: interestRate,
            }
          : { enabled: false },
      },
    });

    setIsModified(false);

    // this is tightly coupled to my page logic. I am sure there is a better
    // way to do this.
    if (isCreate) navigate({ to: "/lobbies" });
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();

    if (initConfig) {
      setHostColor(initConfig.gameConfig.hostColor);
      setTimeEnabled(initConfig.gameConfig.timeConfig.enabled);
      if (initConfig.gameConfig.timeConfig.enabled) {
        const timeMs = initConfig.gameConfig.timeConfig.initTime.white;
        setTimeMinutes(Math.floor(timeMs / (1000 * 60)));
      }
      setInterestEnabled(initConfig.gameConfig.interestConfig.enabled);
      if (initConfig.gameConfig.interestConfig.enabled) {
        setInterestRate(initConfig.gameConfig.interestConfig.rate);
      }
    }
    setIsModified(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={() => setIsModified(true)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-row justify-between">
        <h3 className="text-lg font-semibold">Configure Lobby</h3>

        {isCreate || (
          <button
            disabled={!isModified}
            className={`h-8 w-8 rounded border p-1 opacity-50 enabled:hover:bg-neutral-400 disabled:opacity-20`}
            onClick={handleReset}
          >
            ↩
          </button>
        )}
      </div>
      <div>
        <label htmlFor="hostColor" className="mb-2 block text-sm">
          Your Color
        </label>
        <select
          id="hostColor"
          value={hostColor}
          onChange={(e) => setHostColor(e.target.value as Color)}
          className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-base text-neutral-900"
        >
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="timeEnabled"
          className="flex cursor-pointer items-center gap-2"
        >
          <input
            id="timeEnabled"
            type="checkbox"
            checked={timeEnabled}
            onChange={(e) => setTimeEnabled(e.target.checked)}
            className="h-5 w-5 rounded border-neutral-300 bg-neutral-50 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm">Enable Timer</span>
        </label>
      </div>
      {timeEnabled && (
        <div>
          <label htmlFor="timeMinutes" className="mb-2 block text-sm">
            Time (minutes)
          </label>
          <input
            id="timeMinutes"
            type="number"
            min="1"
            max="60"
            value={timeMinutes}
            onChange={(e) => setTimeMinutes(Number(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-base text-neutral-900"
          />
        </div>
      )}
      <div>
        <label
          htmlFor="interestEnabled"
          className="flex cursor-pointer items-center gap-2"
        >
          <input
            id="interestEnabled"
            type="checkbox"
            checked={interestEnabled}
            onChange={(e) => setInterestEnabled(e.target.checked)}
            className="h-5 w-5 rounded border-neutral-300 bg-neutral-50 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm">Enable Interest</span>
        </label>
      </div>
      {interestEnabled && (
        <div>
          <label htmlFor="interestRate" className="mb-2 block text-sm">
            Interest Rate
          </label>
          <input
            id="interestRate"
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-base text-neutral-900"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!isModified}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base text-white transition-colors hover:bg-blue-400 disabled:bg-neutral-400"
      >
        {configureLobbyMutation.isPending ? "Pending..." : (isCreate? "Create" : "Submit")}
      </button>
    </form>
  );
}
