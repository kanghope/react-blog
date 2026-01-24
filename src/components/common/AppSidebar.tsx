import { CLASS_CATEGORY } from "@/constants/category.constant";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";

/*
이 소스는 TypeScript의 **인터페이스(Interface)**나 타입(Type) 정의에서 **"선택적 프로퍼티(Optional Property)"**를 나타내는 전형적인 함수 타입 정의입니다.
*/
interface Props{
    category: string ;
    setCategory : (value : string) => void;
}

function AppSidebar({category, setCategory} : Props) {
  return (
    
    <aside className="min-w-60 w-60 flex flex-col gap-6">
                    {/*Shadcn UI의 typography h4 컴포넌트 그대로 사용*/}
                    <div className="flex items-center gap-2">
                        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">카테고리</h4>
                        <ChevronDown className="mt-1" />
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        {/*
                        1. variant={"ghost"} (유령 버튼)
                        해석: 평소에는 배경색이나 테두리가 없는 투명한 상태로 있어줘!
                        왜 쓰나요? 메뉴 리스트가 너무 화려하면 지저분해 보이기 때문에, 
                        마우스를 올리기 전에는 글자만 깔끔하게 보여주기 위해서입니다.

                        2. justify-start (왼쪽 정렬)
                        해석: 버튼 안의 내용물(아이콘과 글자)을 왼쪽 끝에서부터 채워줘!
                        왜 쓰나요? 기본 버튼은 보통 내용물을 가운데(center)에 배치합니다. 
                        하지만 사이드바 메뉴는 아이콘과 글자가 왼쪽 줄에 딱 맞춰져 있어야 정돈된 느낌을 줍니다.

                        3. hover:pl-6 (🌟 하이라이트 효과)
                        해석: 마우스를 올리면 왼쪽 여백(padding-left)을 **1.5rem(24px)**만큼 줘!
                        실제 효과: 마우스를 갖다 대면 메뉴가 오른쪽으로 스윽~ 하고 밀려 들어가는 애니메이션이 생깁니다.
                        왜 쓰나요? "지금 네가 이 메뉴를 선택하려고 해!"라는 반응을 아주 역동적이고 세련되게 전달하기 위해서입니다.

                        4. hover:text-white & transition-all
                        아까 배우신 대로, 회색 글자가 0.5초 동안(duration-500) 
                        부드럽게 흰색으로 변하면서 동시에 옆으로 이동합니다.

                        */}
                        {CLASS_CATEGORY.map((menu) => {
                            return (
                                
                            <Button key={menu.id} variant={"ghost"} className={`justify-start text-muted-foreground hover:text-amber-200 hover:pl-6 transition-all duration-500 ${category === menu.category && "text-foreground !pl-6 bg-accent/50"} `}
                            onClick={() => setCategory(menu.category)}>
                                {menu.icon} 
                                {menu.label}
                            </Button>
                            );
                        })} 
                    </div>
                </aside>
  );
}

export { AppSidebar };
