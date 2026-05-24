import { TangerineHeader } from "../layout/TangerineHeader";

interface PlaceholderScreenProps {
  title: string;
}

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#f7f7f7]">
      <TangerineHeader title={title} />
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-500 text-center">
          Coming soon
        </p>
      </div>
    </div>
  );
}
