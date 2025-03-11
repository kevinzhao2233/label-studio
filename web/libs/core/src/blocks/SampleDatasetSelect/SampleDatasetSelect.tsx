import { Select, SelectContent, SelectItem, SelectTrigger } from "@humansignal/shad/components/ui/select";
import { useCallback, useMemo } from "react";

type Sample = {
  title: string;
  url: string;
  description: string;
};

export function SampleDatasetSelect({
  samples,
  sample,
  onSampleApplied,
}: {
  samples: Sample[];
  sample?: Sample;
  onSampleApplied: (sample?: Sample) => void;
}) {
  const title = useMemo(() => {
    return sample?.title ?? "Select sample";
  }, [sample]);

  const onSelect = useCallback(
    (value: string) => {
      onSampleApplied(samples.find((s) => s.url === value));
    },
    [samples, onSampleApplied],
  );

  return (
    <div className="flex gap-3 items-center">
      <span>or use a sample dataset</span>
      <Select value={sample?.url} onValueChange={onSelect}>
        <SelectTrigger className="h-10 min-w-52 rounded-sm border-lsNeutralBorderBold text-lsNeutralContentSubtler bg-lsNeutralSurfaceActive">
          {title}
        </SelectTrigger>
        <SelectContent className="z-99999">
          {samples.map((sample) => (
            <SelectItem value={sample.url} key={sample.url}>
              <div className=" font-bold">{sample.title}</div>
              <div className="mt-2">{sample.description}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
