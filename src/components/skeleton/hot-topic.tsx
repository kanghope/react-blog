import { Skeleton } from "../ui/skeleton";

function SkeletonHotTopic() {
  return (
    <div className="w-full h-full flex flex-col min-w-58 bg-card rounded-xl overflow-hidden ">
      {/* 1. 상단 스켈레톤: 부모의 gap을 무시하도록 위쪽에 배치 */}
      <Skeleton className="w-full h-70 rounded-none" />
      <div className="flex items-center gap-20 p-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex flex-col gap-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-20 h-[14px]" />   
        </div>
      </div>
    </div>
  )
}

export { SkeletonHotTopic}
