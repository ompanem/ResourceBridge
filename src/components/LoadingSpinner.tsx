export function LoadingSpinner() {
  return (
    <div className="flex justify-start">
      <div className="px-6 py-4 rounded-2xl rounded-bl-sm bg-parchment">
        <div className="flex gap-1.5 items-center">
          <div className="size-2 rounded-full bg-muted-foreground animate-pulse-soft" style={{ animationDelay: "0ms" }} />
          <div className="size-2 rounded-full bg-muted-foreground animate-pulse-soft" style={{ animationDelay: "300ms" }} />
          <div className="size-2 rounded-full bg-muted-foreground animate-pulse-soft" style={{ animationDelay: "600ms" }} />
        </div>
      </div>
    </div>
  );
}
