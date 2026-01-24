
import { CircleSmall, NotebookPen, PencilLine } from "lucide-react";
import { AppDraftsDialog, AppSidebar } from "../components/common";
import { SkeletonHotTopic, SkeletonNewTopic } from "../components/skeleton";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import supabase from "@/lib/supabase";
import { TOPIC_STATUS, type Topic } from "@/types/topic.type";
import { useEffect, useState } from "react";
import { NewTopicCard } from "@/components/topics";
import { HotTopicCard } from "@/components/topics";
import { AppPaging } from "@/components/common/AppPaging";

/*
1. <main> : 주인공 (본문 영역)
의미: 해당 페이지의 가장 핵심적인 내용이 들어가는 곳입니다.
규칙: 한 페이지에 딱 한 번만 사용하는 것이 원칙입니다. (주인공은 한 명이니까요!)
실무: 9din님 프로젝트에서는 헤더(AppHeader)를 제외한 나머지 앨범 리스트나 상세 페이지 내용 전체를 <main>으로 감싸게 됩니다.

2. <aside> : 조연 (부가 정보 영역)
의미: 본문(main)과는 직접적인 관련이 적지만, 옆에 붙어서 도움을 주는 부가 정보 영역입니다.
실무 활용: * 사이드바 메뉴: "카테고리 리스트", "최근 본 상품"
광고: 본문 옆에 붙는 광고 배너
추천: "이 글과 비슷한 다른 글"
특징: 보통 화면의 왼쪽이나 오른쪽에 배치되지만, 꼭 옆에 있어야만 하는 건 아닙니다. (의미상 부차적인 것이면 aside를 씁니다.)

1. <section>의 핵심 의미
주제별 그룹화: 단순히 디자인 때문에 묶는 것이 아니라, **"여기서부터 여기까지는 같은 주제를 다루는 내용이야"**라고 브라우저에게 알려주는 것입니다.
제목이 필요함: 원칙적으로 section 안에는 그 구역의 정체성을 알려주는 **제목 태그(<h1> ~ <h6>)**가 하나쯤은 들어있는 것이 좋습니다.

2. div vs section 차이점
이게 가장 헷갈리실 텐데, 딱 한 줄로 정리해 드릴게요.
div: 아무 의미 없이 **디자인(레이아웃)**을 위해 박스를 칠 때 (예: 가로 정렬용, 여백용)
section: 디자인과 상관없이 내용상 하나의 덩어리일 때 (예: 공지사항 섹션, 상품 목록 섹션)

1. scroll-m-20 (스크롤 위치 보정)
해석: "이 요소로 스크롤 이동을 할 때, 위쪽에 5rem(80px)만큼의 여유 공간을 두고 멈춰줘!"
왜 쓰나요? * 지금 만드시는 프로젝트의 헤더(AppHeader)가 fixed(상단 고정) 상태죠?
만약 메뉴를 클릭해서 특정 섹션으로 이동하면, 제목이 고정된 헤더 뒤로 숨겨져서 안 보이는 현상이 발생합니다.
이때 scroll-m-20을 주면 헤더 두께만큼 **여백(Scroll Margin)**을 두고 스크롤이 멈춰서 제목이 헤더 아래에 예쁘게 보이게 됩니다.

2. tracking-tight (자간 조절)
해석: "글자 사이의 간격(자간)을 살짝 좁게 만들어줘!" (letter-spacing: -0.025em)
왜 쓰나요?
제목(h1, h2 등)은 글자 크기가 큽니다. 글자가 크면 자간이 기본값일 때 약간 벙벙해 보이고 디자인이 엉성해 보일 수 있어요.
이걸 tight하게 조여주면 글자가 훨씬 단단하고 세련된 느낌을 줍니다. 요즘 유행하는 모던한 웹 디자인(Apple이나 Toss 스타일)의 필수 요소입니다.
*/


function App() {

    const ITEMS_PER_PAGE = 6;//한 페이지에 보여줄 개수
    const user = useAuthStore((state) => state.user);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0); // 전체 개수 저장
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const navigate = useNavigate();
    const [searchParams, setSearthcParams] = useSearchParams();
    const category = searchParams.get("category") || "";
    const [topics, setTopics] = useState<Topic[]>([]);
    const [hotTopics, setHotTopics] = useState<Topic[]>([]);

    const handleCategoryChange = (value: string) => {
        if(value === category) return;
        setCurrentPage(1); // 💡 페이지 리셋
        if(value === "") setSearthcParams({});
        else setSearthcParams({ category: value });
    };    
    //HOT 토픽 조회
    const fetchHotTopics = async () => {

        try
        {
            const query = supabase
            .from("topic")
            .select("*")
            .eq('status', TOPIC_STATUS.PUBLISH)
            .order('views', { ascending: false, nullsFirst: false }) // 1. views 컬럼 기준 내림차순(큰 숫자부터) 정렬
            .limit(6); // 2. 상위 4개만 가져오기

            const { data: hotTopics, error} = await query;

            if(error)
            {
                toast.error(error.message);
                return;
            }

            if(hotTopics)
            {
                setHotTopics(hotTopics);

            }
        }
        catch(error)
        {
            console.log(error);
            throw error;
        }
    };
    //발행된 토픽 조회
    const fetchTopics = async () => {
        try
        {
            /*
            const query = supabase.from("topic").select("*").eq('status', TOPIC_STATUS.PUBLISH);
            // 💡 [핵심] 생성일자(created_at) 기준 내림차순 정렬 (최신순)
            query.order("created_at", { ascending: false })
            query.limit(6);
            if(category && category.trim() !== "")
            {
                query.eq("category", category);
            }
            const { data: topics, error} = await query;

            if(error)
            {
                toast.error(error.message);
                return;
            }

            if(topics)
            {
                setTopics(topics);

            }*/
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            // 💡 { count: 'exact' } 를 추가해야 전체 개수를 가져옵니다.
            const query = supabase
                .from("topic")
                .select("*", { count: 'exact' }) 
                .eq('status', TOPIC_STATUS.PUBLISH)
                .order("created_at", { ascending: false })
                .range(from, to); // 💡 범위 지정

            if (category && category.trim() !== "") {
                query.eq("category", category);
            }

            const { data: topics, error, count } = await query;

            if (error) throw error;
            if (topics) setTopics(topics);
            if (count !== null) setTotalCount(count);
            }
            catch(error)
            {
                console.log(error);
                throw error;
            }
    }
    

    //나만의 토픽 생성 버튼 클릭
    const handleRoute = async () => {
        if (!user)
        {
            toast.warning("토픽 작성은 로그인 후 사용 가능합니다.");
            return;
        }
        //RLS Policy 설정할 때, auth.uid() = author
        const { data, error } = await supabase
        .from('topic')
        .insert([
            {
                status: null,
                title: null,
                content: null,
                category: null,
                thumbnail: null,
                author: user.id,
            }
        ])
        .select();

        if(data)
        {
            toast.success("토픽을 생성하였습니다.");
            navigate(`/topics/${data[0].id}/create`);
        }
        
        if(error)
        {
            toast.error(error.message);
            return;
        }
        
    };

    //페이지가 렌더링 될때
    useEffect(() => {
        fetchHotTopics();
    },[]);
    useEffect(() => {
        fetchTopics();
   
    },[category, currentPage]);

    // 카테고리 변경 시에는 페이지를 1로 리셋해주는 센스!
 
    return ( 
      <main className="w-full h-full min-h-[720px] flex p-6 gap-6 ">
                {/*
                    fixed: 뷰포트(브라우저 화면)를 기준으로 요소를 고정합니다. 스크롤을 내려도 그 자리에 계속 떠 있습니다.
                    right-1/2: 요소의 오른쪽 끝을 화면의 딱 절반(50%) 지점에 갖다 놓습니다.
                    문제점: 이렇게만 하면 요소의 오른쪽 끝이 중앙에 오기 때문에, 실제로는 왼쪽으로 치우쳐 보입니다.
                    translate-x-1/2: 요소를 자기 자신의 너비의 절반만큼 오른쪽(x축)으로 다시 밀어냅니다.
                    결과: 이 두 과정을 거치면 비로소 요소의 정중앙이 화면의 정중앙과 일치하게 됩니다.
                    화면 바닥에서 40px 띄우고(bottom-10), 좌우 정중앙에 고정시킨 뒤(right-1/2, translate-x-1/2), 
                    다른 애들보다 위로 보이게 해라(z-20)
                */}
                <div className="fixed right-1/2 bottom-10 translate-x-1/2 z-20 flex items-center gap-2">
                    <Button variant={"destructive"} className="!py-5 !px-6 rounded-full hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    onClick={handleRoute}>
                      <PencilLine />
                      나만의 토픽 작성
                    </Button>
                    <AppDraftsDialog >
                        <div className="relative">
                            <Button variant={"outline"} className="w-10 h-10 rounded-full">
                                <NotebookPen />
                            </Button>
                            <CircleSmall size={12} className="absolute top-0 right-0 text-blue-500"  fill="#3b82f6" />
                        </div>
                    </AppDraftsDialog>
                </div>
                {/*카테고리 사이드바
                        lg: (Large Breakpoint)
                        테일윈드의 반응형 접두사입니다. 브라우저 너비가 1024px 이상(보통 데스크톱 모니터)일 때만 뒤에 오는 속성들을 적용하라는 뜻입니다.
                        반대로 말하면, 모바일이나 태블릿에서는 이 속성들이 무시됩니다.
                        lg:min-w-60 (Minimum Width)
                        화면이 커졌을 때, 이 요소의 **최소 너비를 15rem(240px)**로 고정합니다.
                        왜 쓰나요? 내부 콘텐츠가 적더라도 사이드바가 쪼그라들지 않게 방어막을 치는 것입니다.
                        lg:w-60 (Width)
                        화면이 커졌을 때, 기본 너비도 **15rem(240px)**로 맞춥니다.
                        min-w와 w를 같은 값으로 주면, 유연하게 늘어나지 않고 딱 그 크기로 고정되는 효과가 있습니다.
                        lg:h-full (Height)
                        화면이 커졌을 때, 높이를 **부모 요소의 100%**로 채웁니다.
                        사이드바가 페이지 끝까지 길게 내려오도록 만들 때 필수적입니다.

                        hidden (기본값)
                        이 요소는 기본적으로 보이지 않습니다 (display: none).
                        테일윈드는 모바일 우선(Mobile First) 방식이기 때문에, 별다른 접두사가 없는 hidden은 **가장 작은 화면(모바일)**에서의 상태를 의미합니다.
                        lg:block (반응형 스위치)
                        화면 너비가 1024px(lg) 이상이 되는 순간, hidden 상태를 해제하고 block 요소로 나타나게 합니다.
                        즉, "PC 화면에서만 이 사이드바를 꺼내라"는 뜻이죠.
                        나머지 속성들과의 조합 (lg:min-w-60 lg:w-60 lg:h-full)
                        일단 나타나면(block), 너비는 240px로 고정하고(w-60), 높이는 꽉 채워라(h-full)는 설정이 뒤따라 붙는 구조입니다.
                */}
                <div className="hidden lg:block lg:min-w-60 lg:w-60 lg:h-full">
                    <AppSidebar category={category} setCategory={handleCategoryChange} />
                </div>
                {/*토픽 콘텐츠 flex-1은 한마디로 **"남는 공간을 혼자 다 차지해라!"*/}
                
                    {/* 핫토픽
                    1. grid (바둑판 선언)
                    해석: "자식들을 격자무늬(바둑판) 모양으로 배치할 거야!"
                    비유: flex가 기차처럼 한 줄로 쭉 세우는 거라면, grid는 아파트 평면도처럼 가로세로 칸을 딱딱 나눠서 배치하는 방식입니다.

                    2. grid-cols-4 (4칸짜리 줄)
                    해석: "가로 한 줄에 정확히 4개의 박스를 놓을 거야."
                    결과: 앨범 카드가 8개라면 자동으로 4개씩 두 줄로 배치됩니다. 만약 grid-cols-3으로 바꾸면 한 줄에 3개씩 나오겠죠?

                    3. gap-6 (박스 사이의 틈)
                    해석: "가로세로 박스들 사이에 **1.5rem(24px)**만큼의 간격을 줘."
                    효과: 사진들이 서로 딱딱 붙어 있으면 답답해 보이는데, gap-6을 주면 잡지 화보처럼 여유 있고 깔끔하게 정렬됩니다.

                    4. text-muted-foreground (소제목 색상)
                    해석: (아까 배운 대로) "이 구역의 글자색을 배경에 묻어가는 은은한 회색으로 해줘."
                    실무 활용: 보통 앨범 리스트 위에 있는 "전체 결과(120개)" 혹은 "카테고리 이름" 같은 부가 정보에 이 색을 입혀서 진짜 주인공인 앨범 사진을 돋보이게 만듭니다.
                    1. 코드 상세 분석
                    md: (Breakpoint):
                    Medium의 약자로, 화면 가로 넓이가 768px 이상일 때를 의미합니다. (보통 태블릿이나 작은 노트북 화면부터 적용됩니다.)
                    text-base:
                    테일윈드에서 가장 표준이 되는 글자 크기인 **1rem (16px)**입니다.

                    2. 왜 md:를 붙여서 쓸까요? (반응형 디자인)
                    테일윈드는 "모바일 우선(Mobile First)" 방식입니다. 그래서 보통 코드를 이렇게 짝을 지어 씁니다:
                    text-sm md:text-base
                    모바일 (768px 미만): text-sm이 적용되어 글자가 14px로 작게 보입니다. (작은 폰 화면에 적합)
                    데스크탑 (768px 이상): md: 조건이 발동하면서 글자가 16px(text-base)로 커집니다. (넓은 화면에 적합)
                    */}
                <section className="w-full lg:w-[calc(100%-264px)] flex flex-col gap-12">
                    <div className="w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <img src="/assets/gifs/gif-001.gif" alt="@IMG" className="w-7 h-7" />
                                <h4 className="scroll-m20 text-xl font-semibold tracking-tight"> 핫 토픽</h4>
                            </div>
                            <p className="text-base text-muted-foreground">지금 가장 주목받는 주제들을 살펴보고, 다양한 관점의 인사이트를 얻어보세요.</p>
                        </div>
                        {/*grid grid-cols-4 gap-6 */}
                        {/*핫토픽 카드 컴포넌트*/}
                        {hotTopics.length > 0 ? (
                            <div className="w-full flex items-center gap-6 overflow-auto">
                                {hotTopics.map((hotTopic : Topic) => {
                                    return <HotTopicCard props={hotTopic} key={hotTopic.id} />
                                })}
                                {/* 2. 부족한 개수만큼 스켈레톤 생성 (4개 기준) */}
                                {hotTopics.length < 4 &&
                                    Array.from({ length : 4 - hotTopics.length}).map((_, index) => ( 
                                        <SkeletonHotTopic key={`skeleton-${index}`} />
                                    ))
                                } 
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-6">
                                <SkeletonHotTopic />
                                <SkeletonHotTopic />
                                <SkeletonHotTopic />
                                <SkeletonHotTopic />
                            </div>
                        )}
                        
                            
                            
                            
                            {/*
                            <SkeletonHotTopic />
                            <SkeletonHotTopic />
                            <SkeletonHotTopic />
                            <SkeletonHotTopic />
                            */}
                        
                    </div>
                    {/* NEW 토픽*/}
                    <div className="w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <img src="/assets/gifs/gif-002.gif" alt="@IMG" className="w-7 h-7" />
                                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">NEW 토픽</h4>
                            </div>
                            <p className="md:text-base text-muted-foreground">새로운 시선으로, 새로운 이야기를 시작하세요.</p>
                        </div>
                        {/*핫토픽 카드 컴포넌트
                        min-h-120
  
                        */}
                        {topics.length > 0 ? (
                            <div className="flex flex-col  md:grid md:grid-cols-2 gap-6" >
                            {topics
                                .sort((preday, nextday) => new Date(nextday.created_at).getTime() - new Date(preday.created_at).getTime())
                                .map( (topic: Topic) => {
                                    return <NewTopicCard props={topic} key={topic.id} />
                            })}
                            {/* 💡 홀수일 때만 빈 카드를 렌더링 (나머지 채우기) */}
                            {topics.length % 2 !== 0 && (
                                <div className="w-full h-[228px] hidden md:block">
                                {/* 디자인적으로 '비어있음'을 표현하거나, 
                                    단순히 빈 div로 공간만 차지하게 할 수 있습니다. 
                                */}
                                <SkeletonNewTopic/>
                                </div>
                            )}
                        </div>
                        ) : (
                            <div className="w-full min-h-120 flex items-center justify-center">
                                <p className="text-muted-foreground/50">조회 가능한 토픽이 없습니다.</p>
                            </div>
                        )}
                    </div>
                    {/* NEW 토픽 섹션 내부 리스트 하단에 추가 */}
                    <AppPaging currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}  />
                    
                </section>
            </main>
     
  );

}

export default App;