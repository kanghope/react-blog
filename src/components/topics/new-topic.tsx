import { CaseSensitive, Eye, MessageSquare } from "lucide-react";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import type { Topic } from "@/types/topic.type";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko"; // 한국어로 출력하려면
import supabase from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("ko"); // 한국어로 설정

interface Props{
    props: Topic
}

const extractTextFromContent = (content: string | any[], maxChars = 200 ) => {
    try {
        /*
        typeof content === "string": "데이터(content)의 타입이 글자(string)니?"라고 물어봅니다.
        JSON.parse(content): "응, 글자야"라고 하면, 그 글자를 자바스크립트가 읽을 수 있는 **객체(Object)**로 변환합니다. (포장지를 뜯는 과정)
        : content: "아니, 이미 객체야"라고 하면, 변환하지 않고 그대로 사용합니다.
        */
        const parsed = typeof content === "string" ? JSON.parse(content) : content;

        if (!Array.isArray(parsed)) {
            console.warn("content 데이터 타입이 배열이 아닙니다.");
            return "";
        }

        let result = "";
        /*
        for (const block of parsed):
        "전체 본문에서 큰 덩어리(문단, 이미지, 리스트 등)를 하나씩 꺼내보자."
        if (Array.isArray(block.content)):
        "이 덩어리 안에 실제 내용(content)이 배열 형태로 들어있니?" (글자가 들어있는 바구니인지 확인)
        for (const child of block.content):
        "바구니 안에 있는 작은 알맹이들을 하나씩 꺼내서, 만약 **text**가 들어있다면 result라는 변수에 차곡차곡 이어 붙여!"
        */
        for (const block of parsed) {
            if (Array.isArray(block.content)) {
                for (const child of block.content) {
                    if (child?.text) {
                        result += child.text + " ";

                        if (result.length >= maxChars) {
                            return result.slice(0, maxChars) + "...";
                        }
                    }
                }
            }
        }
        return result.trim();
    } catch (error) {
        console.log("콘텐츠 파싱 실패: ", error);
        return "";
    }
}
//이메일정보를 앞만 짤라서 닉네임으로 표시
const findUserById = async (id: string) => {
    try{
        const { data: user, error } = await supabase.from("user").select("*").eq("id", id);

        if(error)
        {
            toast.error(error.message);
            return;
        }

        if(user && user.length > 0)
        {
            return user[0].email.split("@")[0] + "님";
        }
        else{
            return "알수 없는 사용자";
        }
    }
    catch(error)
    {
        console.log(error);
        throw error;
    }
};

export function NewTopicCard({props}: Props) {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState<string>("");

    // 💡 개선 1: 본문 텍스트 추출을 useMemo로 최적화
    // props.content가 바뀌지 않는 한, 복잡한 파싱 로직을 다시 실행하지 않습니다.
    const previewText = useMemo(() => {
        return extractTextFromContent(props.content);
    }, [props.content]);

    const fetchAuthEmail = useCallback( async () => {
        const nicknameDB = await findUserById(props.author);
        setNickname(nicknameDB || "알 수 없는 사용자");
    }, [props.author]);
    //최초 한번 호출
    useEffect(() => {
        fetchAuthEmail();
    },[]);

  return (
    /*
    h-fit	height: fit-content;	콘텐츠 크기만큼만 차지 (타이트하게)
    h-full	height: 100%;	부모가 정해준 키를 꽉 채우기
    h-screen	height: 100vh;	브라우저 화면 전체 높이 차지
    h-auto	height: auto;	브라우저 기본값 (보통 콘텐츠에 맞추지만 부모 영향 많이 받음)
    w-full고정 너비 100%부모 너비를 무조건 다 쓰려고 함 (다른 요소 밀어냄)
    flex-1가변적 너비 (Fill)다른 애들 먼저 자리 잡게 해주고 남는 것만 씀

    1. border border-transparent (평소 상태)
의미: "투명한 테두리를 미리 그려놔라!"

왜 쓰나요?: 마우스를 올렸을 때 갑자기 테두리(border)가 생기면, 테두리 두께만큼 내부 콘텐츠가 1~2px씩 툭툭 밀리는 현상이 생깁니다. 이를 방지하기 위해 평소에 투명한 테두리를 미리 입혀서 자리를 잡아두는 것입니다.

2. transition-all duration-300 (애니메이션 설정)
의미: "변화가 일어날 때 0.3초 동안 부드럽게 보여줘라!"

왜 쓰나요?: 이게 없으면 마우스를 올리는 순간 테두리와 빛이 '탁!' 하고 나타납니다. 300ms(0.3초)를 주면 샤아악~ 하고 빛이 번지는 듯한 고급스러운 효과가 연출됩니다.

3. hover:border-blue-500/50 (마우스 오버 테두리)
의미: "마우스를 올리면 파란색 테두리를 50% 투명도로 보여줘라!"

디테일: blue-500은 표준 파란색이고, /50은 불투명도입니다. 너무 쨍한 파란색보다 살짝 투명한 파란색이 배경과 더 잘 어우러집니다.

4. hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] (글로우 효과의 핵심)
의미: "카드 주변에 파란색 그림자를 광선처럼 퍼뜨려라!"

수치 해석:

0 0: 그림자의 위치(X, Y)입니다. 둘 다 0이면 그림자가 어느 한쪽으로 쏠리지 않고 사방으로 일정하게 퍼집니다.

20px: 그림자의 번짐 정도(Blur)입니다. 숫자가 클수록 빛이 멀리까지 은은하게 퍼집니다.

rgba(59, 130, 246, 0.2): 파란색(59, 130, 246)을 20% 투명도로 섞은 것입니다.

    */
    <Card className="w-full h-fit p-4 gap-4 cursor-pointer
    border border-transparent
    transition-all duration-300
    hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]
    " onClick={()=>navigate(`/topics/${props.id}/detail`)}>
        <div className="flex items-start gap-4">
            <div className="flex-1 flex flex-col items-start gap-3">
                {/* 썸네일과 제목 */}
                <h3 className="h-16 text-base font-semibold tracking-tight line-clamp-2">
                    <CaseSensitive size={16} className="text-muted-foreground" />
                    <p>{props.title}</p>
                </h3>
                {/* 본문내용extractTextFromContent( props.content ) */}
                <p className="line-clamp-3 text-muted-foreground">
                    { previewText}
                </p>
            </div>
            <img src={props.thumbnail} alt="@THUMBNAIL" className="w-[140px] h-[140px] aspect-square rounded-lg object-cover" />
        </div>
        <Separator/>
        <div className="w-full flex items-center justify-between text-sm ">
            <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{nickname}</span>
                <span className="text-[10px] opacity-50">|</span>
                <span>{dayjs(props.created_at).format("YYYY. MM. DD")}</span>
            </div>
            <div className="flex items-center gap-4">
                {/* 조회수 */}
                <div className="flex items-center gap-1.5">
                    <Eye size={14} className="opacity-70" />
                    <span className="text-xs">{props.views || 0}</span>
                </div>
                {/* 댓글수 */}
                <div className="flex items-center gap-1.5">
                    <MessageSquare size={14} className="opacity-70" />
                    <span className="text-xs">{props.comment_count?.[0]?.count || 0}</span>
                </div>
            </div>
           {/*} <p>{nickname}</p>
            <p>{dayjs(props.created_at).format("YYYY. MM. DD")}</p>*/}
        </div>
    </Card>
  )
}

