export default function ProductCardSkeleton() {
  return (
    <div className="neu-card overflow-hidden animate-pulse">
      <div className="bg-muted h-[200px] rounded-t-xl" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-muted rounded w-1/3" />
          <div className="w-8 h-8 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}
