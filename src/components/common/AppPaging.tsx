import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "../ui/button";
import type { Dispatch, SetStateAction } from "react";


interface Props
{
    currentPage: number ;
    setCurrentPage : Dispatch<SetStateAction<number>>;
    totalPages : number; 
}

function AppPaging({ currentPage, totalPages, setCurrentPage }: Props) {
  // 페이지가 0이거나 없을 때를 대비한 방어 코드
  if (totalPages <= 0) return null;

  // 한번에 보여줄 페이지 버튼 개수 설정
  const PAGE_GROUP_SIZE = 5;

  // 💡 [수정 포인트] 시작 번호와 끝 번호 계산 로직
  // 현재 페이지를 기준으로 앞뒤로 배분하거나, 단순히 5개씩 끊어서 보여줍니다.
  let startPage = Math.max(1, currentPage - Math.floor(PAGE_GROUP_SIZE /2 ));
  let endPage = Math.min(totalPages, startPage + PAGE_GROUP_SIZE - 1);

  // 만약 끝 페이지가 마지막에 걸리면 시작 페이지를 거꾸로 계산해서 5개를 맞춤
  if (endPage - startPage + 1 < PAGE_GROUP_SIZE) {
    startPage = Math.max(1, endPage - PAGE_GROUP_SIZE + 1);
  }

  // 계산된 범위를 바탕으로 배열 생성
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-0 md:gap-2 mt-1 mb-5">
      {/* 1. 맨 처음으로 이동 */}
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(1)}
      >
        <ChevronsLeft className="w-1 h-1 md:w-4 md:h-4" />
      </Button>

      {/* 2. 이전 페이지 */}
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
      >
        <ChevronLeft className="w-1 h-1 md:w-4 md:h-4" />
      </Button>

      {/* 3. 페이지 번호들 */}
      <div className="flex items-center gap-1 mx-2">
        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "ghost"}
            className="w-2 h-2 md:w-10 md:h-10 font-medium"
            onClick={() => setCurrentPage(pageNum)}
          >
            {pageNum}
          </Button>
        ))}
      </div>

      {/* 4. 다음 페이지 */}
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
      >
        <ChevronRight className="w-1 h-1 md:w-4 md:h-4" />
      </Button>

      {/* 5. 맨 끝으로 이동 */}
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(totalPages)}
      >
        <ChevronsRight className="w-1 h-1 md:w-4 md:h-4" />
      </Button>
    </div>
  );
}

export { AppPaging };