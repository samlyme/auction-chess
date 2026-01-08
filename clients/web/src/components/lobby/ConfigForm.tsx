import { useState } from "react";
import type { LobbyConfig, Color } from "shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface LobbyConfigFormProps {
  onSubmit: (config: LobbyConfig) => void;
  onCancel?: () => void;
}

export default function LobbyConfigForm({
  onSubmit,
  onCancel,
}: LobbyConfigFormProps) {
  const MIN_TO_MS = 60 * 1000;
  const [hostColor, setHostColor] = useState<Color>("white");
  const [whiteTime, setWhiteTime] = useState<number>(5);
  const [blackTime, setBlackTime] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: LobbyConfig = {
      gameConfig: {
        hostColor,
        initTime: {
          white: whiteTime * MIN_TO_MS,
          black: blackTime * MIN_TO_MS,
        },
      },
    };

    onSubmit(config);
  };

  const timePresets = [
    { label: "1 min", value: "1" },
    { label: "3 min", value: "3" },
    { label: "5 min", value: "5" },
    { label: "10 min", value: "10" },
    { label: "15 min", value: "15" },
  ];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Lobby Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hostColor">Host Color</Label>
            <Select
              value={hostColor}
              onValueChange={(value) => setHostColor(value as Color)}
            >
              <SelectTrigger id="hostColor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="white">White</SelectItem>
                <SelectItem value="black">Black</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>White Time</Label>
            <ToggleGroup
              type="single"
              value={String(whiteTime)}
              onValueChange={(value) => value && setWhiteTime(Number(value))}
              className="grid grid-cols-5 gap-2"
            >
              {timePresets.map((preset) => (
                <ToggleGroupItem
                  key={preset.value}
                  value={preset.value}
                  className="text-sm"
                >
                  {preset.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label>Black Time</Label>
            <ToggleGroup
              type="single"
              value={String(blackTime)}
              onValueChange={(value) => value && setBlackTime(Number(value))}
              className="grid grid-cols-5 gap-2"
            >
              {timePresets.map((preset) => (
                <ToggleGroupItem
                  key={preset.value}
                  value={preset.value}
                  className="text-sm"
                >
                  {preset.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Create Lobby
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
