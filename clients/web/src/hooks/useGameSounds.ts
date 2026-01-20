import useSound from "use-sound";

// Chess game sounds
import moveSound from "@/assets/sounds/standard/Move.mp3";
import captureSound from "@/assets/sounds/standard/Capture.mp3";
import checkSound from "@/assets/sounds/standard/Check.mp3";
import checkmateSound from "@/assets/sounds/standard/Checkmate.mp3";
import selectSound from "@/assets/sounds/standard/Select.mp3";
import errorSound from "@/assets/sounds/standard/Error.mp3";
import victorySound from "@/assets/sounds/standard/Victory.mp3";
import defeatSound from "@/assets/sounds/standard/Defeat.mp3";
import drawSound from "@/assets/sounds/standard/Draw.mp3";
import confirmationSound from "@/assets/sounds/standard/Confirmation.mp3";
import genericNotifySound from "@/assets/sounds/standard/GenericNotify.mp3";
import lowTimeSound from "@/assets/sounds/standard/LowTime.mp3";

export function useGameSounds() {
  const [playMove] = useSound(moveSound);
  const [playCapture] = useSound(captureSound);
  const [playCheck] = useSound(checkSound);
  const [playCheckmate] = useSound(checkmateSound);
  const [playSelect] = useSound(selectSound);
  const [playError] = useSound(errorSound);
  const [playVictory] = useSound(victorySound);
  const [playDefeat] = useSound(defeatSound);
  const [playDraw] = useSound(drawSound);
  const [playConfirmation] = useSound(confirmationSound);
  const [playNotify] = useSound(genericNotifySound);
  const [playLowTime] = useSound(lowTimeSound);

  return {
    playMove,
    playCapture,
    playCheck,
    playCheckmate,
    playSelect,
    playError,
    playVictory,
    playDefeat,
    playDraw,
    playConfirmation,
    playNotify,
    playLowTime,
  };
}
