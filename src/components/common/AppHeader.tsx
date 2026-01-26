import { NavLink, useNavigate } from "react-router";
import { Separator } from "../ui/separator";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";

/*
1. text-muted-foreground (평소 상태)
해석: 글자색을 **"차분하고 은은한 회색"**으로 만들어줘!
실무 포인트: 중요한 글자가 아닐 때, 혹은 마우스를 올리기 전에는 시선을 너무 끌지 않도록 힘을 빼는 역할을 합니다. (보통 연한 회색 계열입니다.)

2. hover:text-white (마우스를 올렸을 때)
해석: 사용자가 마우스 커서를 이 글자 위에 올리면(Hover), 색상을 **"순백색(White)"**으로 바꿔줘!
실무 포인트: "지금 이 메뉴를 선택하려고 하는구나!"라는 반응을 사용자에게 시각적으로 보여주는 것입니다.

3. transition-all (마법의 가루)
해석: 색상이 바뀔 때 "뚝딱" 바뀌지 말고 "부드럽게" 바뀌게 해줘!
비유: 형광등을 켤 때 탁! 하고 켜지는 게 아니라, 영화관 조명처럼 서서히 샤아악~ 하고 밝아지는 느낌을 주는 설정입니다.

4. duration-500 (속도 조절)
해석: 변화하는 시간을 "0.5초(500ms)" 동안 진행해줘!
실무 포인트: 숫자가 클수록 느릿하고 부드럽게 변합니다. 500이면 상당히 여유롭고 고급스러운 느낌을 줍니다. (보통은 200~300을 많이 써요.)


*/ 
function AppHeader() {

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const reset = useAuthStore((state) => state.reset);

  const handleLogout = async () => {
      try{
          await reset();//Zustand + Supabase 모두 로그아웃

          toast.success("로그아웃 되었습니다.");
          navigate("/sign-in");
      }
      catch(error){
        console.log(error);
        toast.error("로그아웃 중 오류가 발생했습니다.");
      }
  }

  return (
    
    <header className="fixed top-0 z-20 w-full flex items-center justify-center bg-[#121212]">
      {/* fixed*/}
        <div className="w-full max-w-[1328px] flex items-center  justify-between px-6 py-3">
            {/*로고 & 네이게이션 메뉴 UI*/} 
            <div className="flex items-center gap-5">
                <img src="/kim.jpg" alt="@LOGO" className="w-6 h-6" />
                <div className="flex items-center gap-5 ">                
                  <NavLink to={"/"} className="font-semibold text-[10px] md:text-sm">블로그 메인</NavLink>
                  <Separator orientation="vertical" className="!h-4" />
                  <NavLink to={"/portfolio"} className="font-semibold  text-[10px] md:text-sm">포트폴리오</NavLink>
                </div>
            </div>
            {/*로그인ui*/}
            { user ? 
            <div className="flex items-center gap-5">
              <span className=" text-[10px] md:text-sm">{user.email}</span>
              <Separator orientation="vertical" className="!h-4" />
              <span onClick={handleLogout} className=" text-[10px] md:text-sm hover:text-yellow-200 transition-all duration-500 cursor-pointer">로그아웃</span>
            </div> 
            : <NavLink to={"/sign-in"} className="font-semibold  text-[10px] md:text-sm text-muted-foreground hover:text-yellow-200 transition-all duration-500 cursor-pointer">
                로그인
            </NavLink>}
            
            {/* <div className="font-semibold text-muted-foreground hover:text-yellow-200 transition-all duration-500 cursor-pointer">로그인</div>*/}
        </div>
    </header>
  );
}   
export {AppHeader};