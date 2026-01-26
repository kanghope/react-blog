import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AppCommentArea, AppEditor } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { ArrowLeft,  Trash2 } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";

export default function TopicDetail() {
    const navigate = useNavigate();
    const { id } = useParams(); // URL에서 토픽의 고유 ID를 가져옴 (수정 시 필요)
    const user = useAuthStore((state) => state.user); // 현재 로그인한 사용자 정보
    // 2. 실행 여부를 체크하는 플래그 (StrictMode 중복 실행 방지 및 메모리 누수 방지)
    const isCalled = useRef(false);//1. 변수를 useEffect 밖으로 뺍니다.

    const [title,setTitle] = useState<string>("");
    const [content, setContent] = useState<string>(""); // 본문 (BlockNote 전용 객체 배열)
    const [category, setCategory] = useState<string>(""); // 선택된 카테고리값
    const [thumbnail, setThumbnail] = useState<string>(); // 썸네일 (파일 객체 또는 기존 URL)
    const [author, setAuthor] = useState<string>("");//글작성자 id
    const [createdat, setCreateat] = useState<string>("");//작성일자

    const handleDelete = async () => {
        try{
            const { error } = await supabase
            .from('topic')
            .delete()
            .eq("id", id);

            if(error)
            {
                toast.error(error.message);
                return;
            }

            toast.success("해당 토픽글이 삭제 되었습니다.");
            navigate("/");
        }
        catch(error)
        {
            console.log(error);
            throw error;
        }
    }

    const fetchTopic = async () => {
        try{
             const { data: topics, error} = await supabase.from("topic").select("*").eq("id", id);

            if(error)
            {
                toast.error(error.message);
                return;
            }

            if(topics)
            {
                setTitle(topics[0].title);
                setContent(topics[0].content);
                setCategory(topics[0].category);
                setThumbnail(topics[0].thumbnail);
                setAuthor(topics[0].author)
                setCreateat(topics[0].created_at);

            }
        }
        catch(error){
            throw new Error('${error}');
        }
    };
    // 상세화면 호출시 조회수 증가 
    const handleIncrementView = async (topicId : string ) => {
        //.rpc('함수이름',{파라미터이름: 값})
        const { data,  error } = await supabase.rpc('increment_view',{
            topic_id: Number(topicId)
        });

        if(error)
        {
            console.error("조회수 증가 실패:", error.message);
            return;
        }

        if(data)
        {

        }
        
    };

    //최초의 한번 호출
        useEffect(() => 
        {
            // 💡 페이지 진입 시 스크롤을 맨 위(0,0)로 즉시 이동시킵니다.
            window.scrollTo(0, 0);
            // 💡 2. 이미 호출했다면 바로 리턴 (중복 실행 방지)
            if (isCalled.current || !id) return;

            const initializeDate = async () => {
                try{
                    isCalled.current = true; //3. 실행 시작과 동시에 깃발을 올림

                    // 두 작업을 병렬로 실행하거나 순차적으로 실행
                    await Promise.all([
                        fetchTopic(),
                        handleIncrementView(id)
                    ]);
                }
                catch(error)
                {
                    console.error("초기화 중 에러:", error);
                }
            };

            initializeDate();
            
            
        }, [id]);

    return (
    <main className="w-full h-full min-h-[720px] flex flex-col">
        {/*
        1. 코드 상세 설명
        relative: "기준점 설정". 이 박스 안에 글자나 아이콘을 띄울 때(absolute), 이 박스를 기준으로 위치를 잡겠다는 뜻입니다. (WinForm의 Container 역할)
        w-full h-100: "크기 결정". 가로는 꽉 채우고(width: 100%), 세로는 지정된 높이(height: 25rem 정도)만큼 확보합니다.
        bg-cover: "이미지 채우기 방식". 이미지가 박스보다 작아도 강제로 늘려서 빈틈없이 꽉 채웁니다. (선배님이 아까 보신 object-cover의 배경 이미지 버전입니다.)
        bg-[50%_35%]: "시선 고정(초점)". 이게 제일 중요합니다!
        첫 번째 값(50%): 가로 중앙을 기준으로 잡습니다.
        두 번째 값(35%): 세로에서 위쪽 35% 지점을 중심으로 보여줍니다.
        왜 쓰나요? 보통 인물 사진은 머리가 위쪽에 있으므로, 정중앙(50%)보다 약간 위쪽(35%)을 보여줘야 얼굴이 안 잘리고 예쁘게 나옵니다.
        bg-accent: "기본 배경색". 이미지가 로딩되기 전이나 엑박이 뜰 때, 시스템이 정한 강조색(Accent Color)을 대신 보여줘서 화면이 깨져 보이지 않게 합니다.
        */}
        <div className="relative w-full h-60 md:h-100 bg-cover bg-[50%_35%] bg-accent " style={{backgroundImage: `url(${thumbnail})`}} >
            {/* 뒤로 가기 */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                <Button size={"icon"} variant={"outline"}  onClick={() => {navigate("/")}}>
                    <ArrowLeft />
                </Button>
                {/* 토픽을 작성한 사람의 user_id와 로그인한 사람의 user_id가 같은 경우에만 보이도록 */}
                {
                    user?.id === author && (

                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size={"icon"} variant={"outline"} className="!bg-red-800/50">
                        <Trash2  />
                    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>토픽글을 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            삭제하시면 해당글에 관련된 모든 정보가 삭제 됩니다.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600/50 text-foreground hover:bg-red-700/50" onClick={handleDelete}>삭제</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                    
                )} 
                { user?.id === author && (
                <Button className="!bg-blue-400/50 flex items-center gap-2" size={"default"} variant={"outline"}  onClick={() => navigate(`/topics/${id}/create?wyn=Y`)}>
                    수정
                </Button>
                    )}
                
            </div>
            
            {/* 좌, 우, 하단 그라데이션
            이 코드는 배경 이미지 위에 "글자가 잘 보이도록 왼쪽은 어둡게, 
            오른쪽으로 갈수록 투명해지는 그림자(그라데이션)를 덧씌우는" 아주 세련된 기법입니다.
            absolute: "공중에 띄우기". 부모(relative) 박스 안에서 다른 요소들과 상관없이 원하는 위치에 겹치게 배치합니다.
            inset-0: "상하좌우 0". top:0; right:0; bottom:0; left:0;을 한 번에 쓴 것입니다. 즉, 부모 박스 크기와 똑같이 꽉 채우라는 뜻입니다.
            bg-gradient-to-r: "오른쪽으로 흐르는 그라데이션". 배경색을 왼쪽(시작)에서 오른쪽(끝)으로 서서히 변하게 만듭니다.
            from-[#0a0a0a]: "시작점 (왼쪽)". 아주 진한 검은색(#0a0a0a)에서 시작합니다. (여기에 제목 글자가 올라가면 아주 잘 보이겠죠?)
            via-transparent: "중간 지점". 중간쯤 오면 완전 투명해집니다.
            to-transparent: "끝 지점 (오른쪽)". 끝까지 투명함을 유지합니다.
            */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a] via-transparent to-transparent"></div>
        </div>
        <section className="relative w-full flex flex-col items-center -mt-40">
             <span className="mb-4"># {category}</span>
             <h1 className="scroll-m-20 text-center font-extrabold tracking-tight sm:text-2xl text-xl md:text-4xl md:px-0">{title}</h1>
             <Separator className="!w-6 my-6 bg-foreground" />
             <span>{dayjs(createdat).format("YYYY. MM. DD")}</span>
        </section>
        {/* 에디터 내용을 불러와 렌더링 */}
        <div className="w-full py-6">
            {content && <AppEditor props={JSON.parse(content)} readonly />} 
        </div>

        {/* 💡 분리된 댓글 컴포넌트 호출 */}
        {id && <AppCommentArea topicId={id} user={user} />}

    </main>
  )
}
