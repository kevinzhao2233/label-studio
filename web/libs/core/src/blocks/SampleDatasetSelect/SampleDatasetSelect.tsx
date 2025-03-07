import { Select, SelectContent, SelectItem, SelectTrigger } from "@humansignal/shad/components/ui/select";
import { Button } from "@humansignal/shad/components/ui/button";
import { useMemo, useState } from "react";

type Sample = {
  title: string;
  description: string;
  id: string;
};
export function SampleDatasetSelect({
  samples,
}: {
  samples: Sample[];
}) {
  const [value, setValue] = useState<string | undefined>();
  const title = useMemo(() => {
    return samples.find((s) => s.id === value)?.title ?? "Select sample data";
  }, [value, samples]);
  return (
    <div className="flex gap-3 items-center">
      <span>or use a sample dataset</span>
      <Select value={value} onValueChange={(value) => setValue(value)}>
        <SelectTrigger className="h-10 min-w-52 rounded-sm border-lsNeutralBorderBold text-lsNeutralContentSubtler bg-lsNeutralSurfaceActive">
          {title}
        </SelectTrigger>
        <SelectContent className="z-99999">
          {samples.map((sample) => (
            <SelectItem value={sample.id} key={sample.id}>
              <div className=" font-bold">{sample.title}</div>
              <div className="mt-2">{sample.description}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button>Use Sample</Button>
    </div>
  );
}
