import useAuthListener from "@/components/hooks/use-auth";
import { AppFooter, AppHeader } from "../components/common";
import { Outlet } from "react-router";
export default function Rootlayout() {

  useAuthListener();//레이아웃의 함수를 호출함으로써 지속적인 로그인정보 상태관리 

  return (
    /*
    Outlet의 역할: "치환권"
    Rootlayout 안에 적어두신 <Outlet /> 태그는 일종의 **"빈 박스"**입니다. 
    사용자가 브라우저 주소창에 입력하는 URL에 따라, 
    그 빈 박스 자리에 자식 라우트들이 갈아 끼워지는(Swap) 방식입니다.
    / 접속 시: <Outlet /> 자리에 <App />이 들어감.
    /sign-up 접속 시: <Outlet /> 자리에 <SignUp />이 들어감.
 */
    <div className="page">
          <AppHeader />
          <div className="container">
            <Outlet />
          </div>
          <AppFooter />
      </div>
  )
}
