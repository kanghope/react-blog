import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";
import { string, z } from "zod";

const formSchema = z.object({
  email: z.email( {
    error: "올바른양식으로 이메일을 입력해주세요.",
  }),
  password: z.string().min(8, {
    error: "비밀번호는 최소 8자 이상이어야 합니다.",
  }),
})



export default function SignIn() {
        const navigate = useNavigate();
        // 1. form 객체 생성: 폼의 상태(데이터, 에러 등)를 총괄하는 관리자를 선언합니다.
        const form = useForm<z.infer<typeof formSchema>>({

            // 2. resolver: '검증기'를 지정합니다. 
            // 입력값이 우리가 정한 규칙(formSchema)에 맞는지 Zod라는 도구로 체크하겠다는 뜻입니다.
            resolver: zodResolver(formSchema),

            // 3. defaultValues: 폼이 처음 나타날 때 입력창에 채워져 있을 초기값입니다.
            // C#에서 클래스 생성 시 프로퍼티를 빈 문자열로 초기화하는 것과 같습니다.
            defaultValues: {
              email: "",
              password: "",
            },
        });

        const setUser = useAuthStore((state) => state.setUser);//zustand 방식 상태 저장

        useEffect(() => {
            const checkSession = async () => {
                const { data: { session }, } = await supabase.auth.getSession();
                
                if(session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email as string,
                        role: session.user.role as string,
                    });
                    toast.success("로그인 되었습니다."); 
                    navigate("/");
                }
            };
            checkSession();//로그인시에 소셜로그인을 체크하여 있으면 자동으로 로그인처리 아니면 일반로그인으로 로그인해야함
        },[]);
       
        //구글로그인
        const handleGoogleSignIn = async () => {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options : {
                    queryParams: { access_type : "offline", prompt: "consent"},
                    redirectTo: `${import.meta.env.VITE_SUPABASE_BASE_URL}/auth/callback`,//window.location.origin,//로그인 후 돌아올 url정보(https://my-service.com)
                }
            });

            if (error) {
            toast.error(error.message);
        }
        };
        //일반로그인
        const onSubmit = async (dataforms: z.infer<typeof formSchema>) => {
              
          try{
                const { data :{user, session}, error } = await supabase.auth.signInWithPassword({
                email: dataforms.email,
                password: dataforms.password,
              })

              // 로그인 실패
              if(error)
              {
                // 에러 메세지 - Toast UI 발생
                toast.error(error.message);
                return;
              }
              // 로그인 성공
              if(user && session)
              {
                setUser({
                  id: user.id,
                  email: user.email as string,
                  role: user.role as string
                });
                toast.success("로그인 되었습니다."); 
                navigate("/");
              }
          }
          catch(error)
          {
              // 에러 메세지 - Toast UI 발생
              console.log(error);
              throw error;
              return;
          }
  }

  return (
    <main className="w-full h-full min-h-[720px] flex items-center justify-center p-6 gap-6 ">
        <div className="w-100 max-w-100 flex flex-col px-6 gap-6">
            <div className="flex flex-col">
              {/* 
              1. 왜 scroll-m-20이 필요한가요? (고정 헤더 문제)9din님의 프로젝트처럼 **상단 헤더가 고정(fixed)**되어 있는 경우에 발생합니다.
              문제: 메뉴를 클릭해서 '핫 토픽' 섹션으로 이동하면, 브라우저는 섹션의 맨 꼭대기를 화면 맨 위에 맞춥니다. 
              그런데 헤더가 그 위를 덮고 있어서 제목이 헤더 뒤로 숨겨져 안 보이게 됩니다.
              해결: scroll-m-20을 주면, 스크롤이 멈출 때 헤더의 두께만큼 위쪽에 마진(Scroll Margin)을 두고 멈춥니다. 
              덕분에 제목이 가려지지 않고 헤더 바로 아래에 예쁘게 보이게 됩니다.

              2. 수치 계산 (Tailwind 규칙)scroll-m: Scroll Margin의 약자입니다.
              20: 테일윈드에서 숫자 1은 4px입니다. 따라서 $20 \times 4 = 80$px가 됩니다.
              의미: "스크롤 멈춤 지점을 80px만큼 아래로 보정해줘!"
              */}
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">로그인</h4>
              <p className="text-muted-foreground">로그인을 위한 정보를 입력해주세요.</p>
            </div>
            <div className="grid gap-3">
            {/* 소셜 로그인 */}
            <Button type="button" variant={"secondary"} onClick={handleGoogleSignIn}>
                <img src="/assets/icons/social/google.svg" alt="@GOOGLE-LOGO" className="w-[18px] h-[18px] mr-1" />
                구글 로그인
            </Button>
            {/* 경계선 
            1. relative의 진짜 역할: "내가 기준이다!"단독으로 쓰일 때는 제자리에 가만히 있는 것처럼 보이지만, 
            사실은 자식 요소들에게 이렇게 말하는 것과 같습니다.
            "얘들아, 이제부터 absolute(절대 위치)로 움직일 때는 내 왼쪽 위 모서리($0,0$)를 기준으로 움직여라!"
            2. 왜 relative를 써야 하나요?만약 부모에게 relative를 주지 않고 자식에게 absolute를 주면, 
            자식은 부모를 무시하고 **브라우저 화면 전체(Body)**를 기준으로 날아가 버립니다.
            relative가 없을 때: 자식이 화면 밖으로 가출함.relative가 있을 때: 자식이 부모 박스 안에서만 움직임.

            1. 코드 상세 분석
            absolute (절대 위치): 문서의 일반적인 흐름에서 벗어나 공중에 띄웁니다. 
            가장 가까운 relative 부모를 기준으로 좌표를 잡습니다.
            inset-0 (상하좌우 0): top: 0, right: 0, bottom: 0, left: 0을 한 방에 선언한 것입니다. 
            즉, 부모의 모든 모서리에 딱 붙여서 크기를 똑같이 맞추라는 뜻입니다.
            flex items-center: 그렇게 부모를 꽉 채운 레이어 안에서 
            자식 요소(아이콘이나 글자)를 세로 중앙에 배치하겠다는 뜻입니다.
            */}
            <div className="relative">
                <div className="relative flex justify-center text-xs">
                    <span className="px-2 text-muted-foreground bg-black uppercase">OR CONTINUE WITH</span>
                </div>
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
            </div>
            {/* 로그인 폼 
              1. space-y-3의 핵심 의미space-y: "세로(Y축) 방향으로 간격을 띄우겠다"는 선언입니다.
              3: 테일윈드 수치 규칙에 따라 $3 \times 4 = 12$px의 간격을 의미합니다.
              작동 원리: 이 속성을 부모 박스에 주면, **첫 번째 자식을 제외한 나머지 자식들의 위쪽(top)**에 자동으로 마진을 추가합니다.
              
              2. 왜 gap-3 대신 space-y-3을 쓰나요?선배님이 보시기에 gap-3과 비슷해 보일 수 있는데, 
              결정적인 차이가 있습니다.gap-3: 반드시 flex나 grid 모드일 때만 작동합니다.
              space-y-3: flex 모드가 아닌 일반적인 block 요소들(단락, 단순 div 등) 
              사이의 간격을 띄울 때도 아주 잘 작동합니다.
            */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input placeholder="이메일을 입력하세요." {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="비밀번호를 입력하세요." {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <div className="w-full flex flex-col gap-3">
                    <Button type="submit" variant={"outline"} className="flex-1 !bg-blue-500/50 hover:scale-105 transition-all duration-300">
                      로그인
                    </Button>
                    <div className="text-center">
                      계정이 없으신가요?
                      <NavLink to={"/sign-up"} className="ml-1 text-blue-400 hover:underline">
                        회원가입
                      </NavLink>
                    </div>
                </div>
              </form>
            </Form>
        </div>
      </div>
        
    </main>
  )
}

