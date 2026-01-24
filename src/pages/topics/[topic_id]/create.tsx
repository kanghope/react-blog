import { useEffect, useState, type ChangeEvent } from "react";
import { AppEditor, AppFileUpload } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectValue, SelectTrigger } from "@/components/ui/select";
import { TOPIC_CATEGORY } from "@/constants/category.constant";
import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import type { Block } from "@blocknote/core";
import { ArrowLeft, Asterisk, BookOpenCheck, ImageOff, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { TOPIC_STATUS } from "@/types/topic.type";

export default function CreateTopic() {
    // [1] URL 파라미터 및 전역 상태(Store) 관리
    const { id } = useParams(); // URL에서 토픽의 고유 ID를 가져옴 (수정 시 필요)
    const user = useAuthStore((state) => state.user); // 현재 로그인한 사용자 정보
    const navigate = useNavigate();
    

    // [2] 폼 데이터 입력 상태(State) 관리 
    const [title, setTitle] = useState<string>(""); // 제목
    const [content, setContent] = useState<Block[]>([]); // 본문 (BlockNote 전용 객체 배열)
    const [category, setCategory] = useState<string>(""); // 선택된 카테고리값
    const [thumbnail, setThumbnail] = useState<File | string | null >(); // 썸네일 (파일 객체 또는 기존 URL)

    const fetchTopic = async () => {
        try{
             const { data: topics, error} = await supabase.from("topic").select("*").eq("id", id).eq('status', TOPIC_STATUS.TEMP);

             if(error)
            {
                toast.error(error.message);
                return;
            }

            if(topics)
            {
                setTitle(topics[0].title);
                setContent(JSON.parse(topics[0].content));
                setCategory(topics[0].category);
                setThumbnail(topics[0].thumbnail);

            }
        }
        catch(error){
            console.log(error);
            throw error;
        }
    };

    //최초의 한번 호출
        useEffect(() => 
        {
            if(user?.email) fetchTopic();
        }, [id]);

    /**
     * [함수] handleSave: 작성 중인 데이터를 '임시 저장'하는 로직
     * SQL의 UPDATE 문을 실행하는 것과 동일함
     */
    const handleSave = async () => {

        // 유효성 검사: 모든 필드가 비어있을 경우 중단
        if(!title && !content && !category && !thumbnail)
        {
            toast.warning("제목, 내용, 카테고리, 썸네일은 입력하세요.");
            return;
        }

        let thumbnailUrl : string | null = null;

        if(thumbnail && thumbnail instanceof File)
        {
            //썸네일 이미지를 storage에 업로드
            const fileExt = thumbnail.name.split(".").pop();
            const fileName = `${nanoid()}.${fileExt}`;
            const filePath = `topics/${fileName}`;

            //이미지파일경로 supabase에 업로드 
            const {error: FileUploadError} = await supabase.storage.from("files").upload(filePath, thumbnail);

            if(FileUploadError) throw FileUploadError;

            //업로드된 이미지의 Public URL 값 가져오기
            const { data  } = await supabase.storage.from("files").getPublicUrl(filePath);
            if(!data) throw new Error("썸네일 Public URL 조회를 실패하였습니다.");
            thumbnailUrl = data.publicUrl;
        }
        else if(typeof thumbnail === "string")
        {
            //기존이미지 유지
            thumbnailUrl = thumbnail;
        }

        // Supabase DB 업데이트 로직 
        const { data, error } = await supabase
        .from('topic') // 'topic' 테이블 선택
        .update([{
                status: TOPIC_STATUS.TEMP,     // 임시 저장 상태임을 명시
                title: title,       // 입력된 제목 바인딩
                content: JSON.stringify( content ),   // 에디터 본문 객체 바인딩
                category: category, // 카테고리 바인딩
                thumbnail: thumbnailUrl, // 썸네일 정보 (파일 처리 전 임시값)
                author: user?.id,    // 작성자 ID (FK 역할)
            } ])
        .eq("id", id) // WHERE id = '현재 페이지 ID' 조건 추가
        .select(); // 업데이트 후 결과 데이터를 다시 반환받음

        if(error)
        {
            toast.error(error.message);
            return;
        }
        if(data)
        {
            toast.success("작성 중인 토픽을 저장하였습니다.");
            return;
        }

    };
    /**
     * [함수] handlePublish: 최종 '발행' 로직
     * 모든 값이 필수여야 함
     */
    const handlePubish = async () => {
        if(!title && !content && !category && !thumbnail)
        {
            toast.warning("제목, 내용, 카테고리, 썸네일은 필수값 입니다.");
            return;
        }

        let thumbnailUrl : string | null = null;

        if(thumbnail && thumbnail instanceof File)
        {
            //썸네일 이미지를 storage에 업로드
            const fileExt = thumbnail.name.split(".").pop();
            const fileName = `${nanoid()}.${fileExt}`;
            const filePath = `topics/${fileName}`;

            //이미지파일경로 supabase에 업로드 
            const {error: FileUploadError} = await supabase.storage.from("files").upload(filePath, thumbnail);

            if(FileUploadError) throw FileUploadError;

            //업로드된 이미지의 Public URL 값 가져오기
            const { data  } = await supabase.storage.from("files").getPublicUrl(filePath);
            if(!data) throw new Error("썸네일 Public URL 조회를 실패하였습니다.");
            thumbnailUrl = data.publicUrl;
        }
        else if(typeof thumbnail === "string")
        {
            //기존이미지 유지
            thumbnailUrl = thumbnail;
        }

        // Supabase DB 업데이트 로직 
        const { data, error } = await supabase
        .from('topic') // 'topic' 테이블 선택
        .update([{
                status: TOPIC_STATUS.PUBLISH,     // 임시 저장 상태임을 명시
                title: title,       // 입력된 제목 바인딩
                content: JSON.stringify( content ),   // 에디터 본문 객체 바인딩
                category: category, // 카테고리 바인딩
                thumbnail: thumbnailUrl, // 썸네일 정보 (파일 처리 전 임시값)
                author: user?.id,    // 작성자 ID (FK 역할)
            } ])
        .eq("id", id) // WHERE id = '현재 페이지 ID' 조건 추가
        .select(); // 업데이트 후 결과 데이터를 다시 반환받음

        if(error)
        {
            toast.error(error.message);
            return;
        }
        if(data)
        {
            toast.success("토픽을 발행 하였습니다.");
            navigate("/");
        }
    };

    return (
    <main className="w-full h-full min-h-[1024px] flex gap-6">
        <div className="fixed right-1/2 bottom-10 translate-x-1/2 z-20 flex items-center gap-2">
            <Button variant={"outline"} size="icon" onClick={() => navigate("/")}>
                <ArrowLeft />
            </Button>
            {/* 
                !Important	CSS의 !important와 같습니다. 다른 스타일보다 우선순위를 높입니다.
                bg-yellow-800	Color	배경색(Background)을 노란색 계열 중 어두운 톤(800번)으로 설정합니다.
                /50	Opacity	투명도를 설정합니다. 여기서 50은 **50%**를 의미합니다.
            */}
            <Button type="button" variant={"outline"} className="w-22 !bg-yellow-800/50" onClick={handleSave}>
                <Save />
                저장
            </Button>
            <Button type="button" variant={"outline"} className="w-22 !bg-emerald-800/50" onClick={handlePubish}>
                <BookOpenCheck />
                발행
            </Button>
        </div>
        {/* 토픽 작성하기 */}
        <section className="w-3/4 h-full flex flex-col gap-6 p-6">
            <div className="flex flex-col pb-6 border-b">
                <span className="text-blue-400 font-semibold">Step 01</span>
                <span className="text-base font-semibold">토픽 작성하기</span>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                    <Asterisk size={14} className="text-blue-400" />
                    <Label className="text-muted-foreground">제목</Label>
                </div>
                <Input placeholder="토픽 제목을 입력해주세요." className="h-16 pl-6 !text-lg placeholder:font-semibold" value={title} onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value) } />
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                    <Asterisk size={14} className="text-blue-400" />
                    <Label className="text-muted-foreground">본문</Label>
                </div>
                {/* BlockNote Text Editor UI */}
                <AppEditor props={content} setContent={setContent} />
            </div>
        </section>
        {/* 카테고리 및 썸네일 등록 */}
        <section className="w-1/4 h-full flex flex-col gap-6 p-6">
            <div className="flex flex-col pb-6 border-b">
                <span className="text-blue-400 font-semibold">Step 02</span>
                <span className="text-base font-semibold">카테고리 및 썸네일 등록</span>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                    <Asterisk size={14} className="text-blue-400" />
                    <Label className="text-muted-foreground">카테고리</Label>
                </div>
                <Select value={category} onValueChange={(value: string) => setCategory(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="토픽(주제)선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>카테고리(주제)</SelectLabel>
                            {TOPIC_CATEGORY.map((category) => {
                                return (
                                <SelectItem key={category.id} value={category.category}>
                                    {category.label}
                                </SelectItem>
                                )}  
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>  
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                    <Asterisk size={14} className="text-blue-400" />
                    <Label className="text-muted-foreground">썸네일</Label>
                </div>
                {/*aspect-video	16 / 9	일반적인 영상, 유튜브 표준
aspect-square	1 / 1	정사각형, 프로필 사진, 인스타그램 피드
aspect-auto	auto	브라우저 기본값 (콘텐츠 크기에 맞춤)
aspect-[4/3]	4 / 3	임의의 비율 (대괄호 안에 원하는 수치 입력 가능
 */}
                {/* 썸네일 UI */}
               
                <AppFileUpload file={thumbnail || null} onChange={setThumbnail} />
                <Button variant={"outline"} className="border-0" onClick={() => setThumbnail(null)}>
                    <ImageOff  />
                    썸네일제거
                </Button>
            </div>  
        </section>
    </main>
  );
}
