import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import supabase from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Asterisk, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z
    .object({
      email: z.email( {
        error: "올바른양식으로 이메일을 입력해주세요.",
      }),
      password: z
      .string()
      .min(8, {error: "비밀번호는 최소 8자 이상이어야 합니다.",})
      .regex(
        /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,25}$/,
        { message: "영문, 숫자, 특수문자를 모두 포함해야 합니다." }
      ), 
      confirmpassword: z.string().min(8, {
        error: "비밀번호 확인을 입력해주세요.",
      }),
    })
    .superRefine(( {password, confirmpassword}, ctx) => {
        if (password !== confirmpassword) {
          ctx.addIssue({
            code: "custom",
            message: "비밀번호와 비밀번호 확인이 일치하지 않습니다.", 
            path: ["confirmpassword"],
          })
        }
    });

export default function SignUp() {

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
          confirmpassword: "",
        },
    });

    const [ serviceAgreed, setServiceAgreed] = useState<boolean>(false);//서비스 이용약관 동의여부
    const [ privacyAgree, setPrivacyAgreed ] = useState<boolean>(false);//개인정보수집및 이용약관동의여부
    const [ marketingAgreed, setMarketingAgreed] = useState<boolean>(false);//마케팅 및 광고 수신약관 동의 여부

    const handleCheckMarketing = () => { setMarketingAgreed(!marketingAgreed); };
    const handleCheckService = () => { setServiceAgreed(!serviceAgreed); };
    const handleCheckPrivacy = () => { setPrivacyAgreed(!privacyAgree); };

    const onSubmit = async (dataform : z.infer<typeof formSchema>) => {
      

      if(serviceAgreed !== true || privacyAgree !== true)
      {
        // 경고 메세지 - Toast UI 발생
        toast.warning("필수 동의항목을 체크해주세요.");
        return;
      }

      try{
        const { data: {user, session}, error } = await supabase.auth.signUp({
          email: dataform.email,
          password: dataform.password,
        });

        // 회원가입 실패
        if(error)
        {
          // 에러 메세지 - Toast UI 발생
          toast.error(error.message);
          return;
        }

        // 회원가입 성공
        if(user && session)
        {
            const { data, error } = await supabase
            .from('user')
            .insert([
              {id: user.id, email: dataform.email,  service_agreed: serviceAgreed, maketing_agreed: marketingAgreed, privacy_agreed : privacyAgree },
            ])
            .select();

            if(data)
            {
                // 성공메세지 - Toast UI 발생
                toast.success("회원가입을 완료하였습니다.");
                // 로그인 페이지로 리다이렉트
                navigate("/sign-in");
            }

            if(error)
            {
              // 에러 메세지 - Toast UI 발생
              toast.error(error.message);
              return;
            }
        }
      } catch(error){
        console.log(error);
        throw error;
      }
      
    };
    
  
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
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">회원가입</h4>
            <p className="text-muted-foreground">회원가입을 위한 정보를 입력해주세요.</p>
          </div>
          <div className="grid gap-3">
              
          
            {/* 회원가입 폼 
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
                <FormField
                  control={form.control}
                  name="confirmpassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호 확인</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="비밀번호를 확인을 입력하세요." {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <div className="grid gap-2 ">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-1">
                            <Asterisk size={14} className="text-[#F96859]" />
                            <Label>필수 동의항목</Label>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox className="w-[18px] h-[18px]" checked={serviceAgreed} onCheckedChange={handleCheckService} />
                                서비스 이용약관 동의
                            </div>
                            <Button variant={"link"} className="!p-0 gap-1">
                                <p className="text-xs">자세히 보기</p>
                                <ChevronRight className="mt-[2px]" />
                            </Button>

                        </div>
                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox className="w-[18px] h-[18px]" checked={privacyAgree} onCheckedChange={handleCheckPrivacy} />
                                개인정보 수집 및 이용동의
                            </div>
                            <Button variant={"link"} className="!p-0 gap-1">
                                <p className="text-xs">자세히 보기</p>
                                <ChevronRight className="mt-[2px]" />
                            </Button>

                        </div>
                    </div>
                </div>
                <Separator />
                <div className="grid gap-2">
                    <Label>선택 동의항목</Label>
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox className="w-[18px] h-[18px]" checked={marketingAgreed} onCheckedChange={handleCheckMarketing} />
                            마케팅 및 광고 수신 동의
                        </div>
                        <Button variant={"link"} className="!p-0 gap-1">
                            <p className="text-xs">자세히 보기</p>
                            <ChevronRight className="mt-[2px]" />
                        </Button>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant={"outline"} size={"icon"}>
                          <ArrowLeft />
                      </Button>
                      <Button type="submit" variant={"outline"} className="flex-1 !bg-blue-500/50 hover:scale-105 transition-all duration-300">
                        회원가입
                      </Button>
                    </div>
                    <div className="text-center">
                      이미 계정이 있으신가요?
                      <NavLink to={"/sign-in"} className="ml-1 text-blue-400 hover:underline">
                        로그인
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

