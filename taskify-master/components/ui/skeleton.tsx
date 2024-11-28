import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
    </div>
  );
}

export { Skeleton };
