interface Props {
  progress: number;
}

export function Progress({ progress }: Props) {
  return (
    <div
      role="progress"
      aria-valuemax={100}
      aria-valuenow={progress}
      className="h-2 rounded-sm bg-gray/30"
    >
      <div className="h-2 rounded-sm bg-green" style={{ width: progress }} />
    </div>
  );
}
