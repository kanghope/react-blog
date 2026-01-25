import { Trophy } from "lucide-react";
import { Card } from "../ui/card";
import type { Topic } from "@/types/topic.type";
import { toast } from "sonner";
import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface Props{
    props: Topic
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

export function HotTopicCard({props}: Props) {

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
    p-0: Card 자체에 들어있는 패딩을 없애야 이미지가 경계선까지 닿습니다.
    overflow-hidden: 이미지가 Card의 둥근 모서리(rounded-lg)를 삐져나가지 않게 깎아줍니다. 
    안 그러면 위쪽 모서리가 사각형으로 보일 수 있어요.
    bg-cover bg-center: object-cover는 <img> 태그용입니다. 
    div 배경 이미지로 쓸 때는 테일윈드의 bg-cover(이미지를 꽉 채움)와 bg-center(중앙 정렬)를 써야 예쁘게 나옵니다.
    하단부 별도 패딩: 카드 전체 패딩을 0으로 만들었기 때문에, 아래 아바타와 텍스트 부분은 다시 p-4 같은 값을 주어 숨통을 틔워줘야 합니다.   
    rounded-b-2xl 
    */
    <Card className="w-full flex flex-col gap-2 min-w-58 p-0 overflow-hidden border-none shadow-none cursor-pointer" onClick={()=>navigate(`/topics/${props.id}/detail`)}>
      
      <div className="w-full h-70 bg-cover bg-center  flex flex-col justify-end p-4 relative" style={{backgroundImage: `url(${props.thumbnail})`}}>
        {/* 💡 2. 가독성을 위해 검은색 그라데이션 오버레이를 살짝 줍니다. (선택사항)rounded-b-2xl */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent " />

        {/* 💡 3. 제목 (z-index를 주어 그라데이션 위로 올립니다) */}
        <h1 className="relative z-10 w-full line-clamp-3  text-base md:text-2xl font-extrabold/70 tracking-tight text-white">{props.title}</h1>
      </div> 
      {/*<Skeleton className="w-full h-70 flex items-start" />*/}
      
      <div className="flex items-center justify-between gap-2 p-4">
        {/* 1. 왼쪽: shadcn(Lucide) 아이콘 - 원형 배경으로 포인트 bg-secondary*/}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700">
            <Trophy className="w-5 h-5 text-muted-foreground" /> 
            {/* User 대신 상황에 맞는 아이콘(Trophy, MessageCircle 등)을 쓰시면 됩니다. */}
        </div>
        <div className="flex flex-col items-end justify-center gap-0.5 w-full">
            {/* 아래쪽: 닉네임 (중간 크기) self-end를 추가해서 오른쪽 끝으로 */}
            <span className="text-sm font-semibold text-primary ">
                {nickname}
            </span>
            {/* 위쪽: 카테고리 제목 (작고 강조된 스타일) */}
            <span className="text-sm font-semibold w-full text-right line-clamp-1 text-card-foreground/50 uppercase tracking-wider ">
              {props.category}
            </span>
            
            
        </div>
      </div>
    </Card>
  )
}
