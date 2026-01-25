import { CaseSensitive } from "lucide-react";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import type { Topic } from "@/types/topic.type";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko"; // 한국어로 출력하려면
import supabase from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("ko"); // 한국어로 설정

interface Props{
    props: Topic
}

const extractTextFromContent = (content: string | any[], maxChars = 200 ) => {
    try {
        const parsed = typeof content === "string" ? JSON.parse(content) : content;

        if (!Array.isArray(parsed)) {
            console.warn("content 데이터 타입이 배열이 아닙니다.");
            return "";
        }

        let result = "";

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

    const fetchAuthEmail = async () => {
        const nicknameDB = await findUserById(props.author);
        setNickname(nicknameDB || "알 수 없는 사용자");
    }
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

    */
    <Card className="w-full h-fit p-4 gap-4 cursor-pointer" onClick={()=>navigate(`/topics/${props.id}/detail`)}>
        <div className="flex items-start gap-4">
            <div className="flex-1 flex flex-col items-start gap-3">
                {/* 썸네일과 제목 */}
                <h3 className="h-16 text-base font-semibold tracking-tight line-clamp-2">
                    <CaseSensitive size={16} className="text-muted-foreground" />
                    <p>{props.title}</p>
                </h3>
                {/* 본문내용 */}
                <p className="line-clamp-3 text-muted-foreground">
                    { extractTextFromContent( props.content )}
                </p>
            </div>
            <img src={props.thumbnail} alt="@THUMBNAIL" className="w-[140px] h-[140px] aspect-square rounded-lg object-cover" />
        </div>
        <Separator/>
        <div className="w-full flex items-center justify-between">
            <p>{nickname}</p>
            <p>{dayjs(props.created_at).format("YYYY. MM. DD")}</p>
        </div>
    </Card>
  )
}

