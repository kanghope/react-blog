import { Separator } from "../ui/separator";
import { Button  } from "../ui/button";

function AppFooter() {
  return <footer className="w-full flex flex-col items-center justify-center bg-[#121212]">
    <div className="w-full max-w-[1328px] flex flex-col gap-6 p-6 pb-18">
      {/* 상단 구분선 
      1. w-full flex flex-col해석: "넓이를 가득 채우고 세로 정렬을 하며" -> 정확합니다.
      비유: 세로로 쌓이는 스택(Stack) 레이아웃을 만듭니다.
      2. items-start justify-between (여기가 핵심!)해석: "윗쪽부터 정렬시작 위아래로 요소를 붙이고" -> 반은 맞고 반은 수정이 필요합니다.
      정밀 교정: flex-col(세로) 모드일 때와 flex-row(가로) 모드일 때 기준축이 바뀝니다.
      items-start: 가로축(Cross Axis) 기준입니다. 
      세로로 쌓여 있는 요소들을 왼쪽 끝으로 정렬합니다. 
      (위쪽이 아닙니다!)justify-between: 세로축(Main Axis) 기준입니다. 
      요소들 사이에 빈 공간을 최대한 넣어 첫 번째 요소는 맨 위, 마지막 요소는 맨 아래에 붙입니다.
      3. gap-6해석: "요소 사이에는 24px만큼" -> 완벽합니다. 
      ($6 \times 4px = 24px$)4. md:flex-row md:gap-0
      해석: "해상도가 커지면 다시 가로 정렬을 하고 요소 사이 값을 0으로 조절하라" -> 완벽합니다.
      추가 설명: 이때 justify-between의 역할도 바뀝니다. 
      가로 모드에서는 첫 번째 요소는 왼쪽 끝, 마지막 요소는 오른쪽 끝으로 밀어내게 됩니다.
      */}
      <div className="w-full flex flex-col items-start justify-between gap-6 md:flex-row md:gap-0">
        <div className="flex flex-col items-start gap-4">
          <div className="flex flex-col items-start">
            {/*
            text-base md:text-2xl (반응형 글자 크기)
            해석: "특정 크기보다 작아지면 작아지게 한다" -> 반대입니다.
            정밀 교정: 테일윈드는 **모바일 우선(Mobile First)**입니다.
            기본 (text-base): 모바일(작은 화면)에서 16px로 시작합니다.
            확장 (md:text-2xl): 화면 너비가 768px(md) 이상으로 커지면 글자 크기를 **24px(2xl)**로 키웁니다.
            즉, "작은 화면에선 작게, 큰 화면에선 크게" 만드는 설정입니다.
            scroll-m-20	스크롤 상단 여백	80px (20 * 4px)
            text-base	기본 글자 크기	16px (모바일 기준)
            md:text-2xl	반응형 크기 조절	768px 이상에서 24px로 확대
            font-semibold	글꼴 두께	600 (중간 굵기)
            tracking-tight	글자 간격(자간)	-0.025em (좁게)
            */}
            <h3 className="scroll-m-20 text-base md:text-2xl font-semibold tracking-tight">개발자로써 삶이 좀더</h3>
            <h3 className="scroll-m-20 text-base md:text-2xl font-semibold tracking-tight">한단계씩 업그레이드 되다.</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={"outline"} size={"icon"} className="border-0">
              <img src="/assets/images/icon-002.svg" alt="@SNS" className="w-6 h-6 mt-[2px]" />
            </Button>
            <Button variant={"outline"} size={"icon"} className="border-0">
              <img src="/assets/gifs/gif-001.gif" alt="@SNS" className="w-[22px] h-[22px]" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="cursor-pointer transition-all duration-300 hover:font-mediaum">이용약관</p>
          <Separator orientation="vertical" className="!h-[14px]" />
          <p className="cursor-pointer transition-all duration-300 hover:font-mediaum">개인정보처리방침</p>
          <Separator orientation="vertical" className="!h-[14px]" />
          <p className="cursor-pointer transition-all duration-300 hover:font-mediaum">클래스 론칭 문의</p>
        </div>
      </div>
      <Separator />
      <div className="w-full flex flex-col gap-12 items-start justify-between md:flex-row md:gap-0">
        <div className="h-full flex flex-col justify-between">
          <div className="flex flex-col">
            <p className="h-10 text-base font-semibold">고객센터</p>
            {/*
            flex: 레이아웃 엔진을 켭니다.
flex-col (세로 정렬): 자식들을 위에서 아래로 쌓습니다.
items-start (왼쪽 정렬): 자식들을 왼쪽 끝에 맞춥니다.
flex-col 상태에서 items- 속성은 가로축(수평) 정렬을 담당하기 때문입니다.
gap-1 (간격 4px): 자식들 사이의 간격을 **0.25rem(4px)**만큼 줍니다.
테일윈드에서 숫자 1은 0.25rem이며, 브라우저 기본 폰트 사이즈(16px) 기준으로 4px가 맞습니다.*/}
            <div className="flex flex-col items-start gap-1">
              <p>평일 오전 9시 ~ 오후 6시</p>
              <p>문의 : tansang2@naver.com</p>
            </div>
          </div>
          <p>@ Kang Team all rights reserved</p>
        </div>
        <div className="flex flex-col mr-[66px]">
          <p className="h-10 text-base font-semibold">사업자 정보</p>
          <div className="flex flex-col items-start gap-1">
            <p>상호: 강팀</p>
            <p>대표: 개발자 Kang</p>
            <p>사업자등록번호: 123-45-67890</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
}

export {AppFooter};

/*
  1. items-start의 핵심 의미
flex 방향에 따라 정렬되는 기준이 달라집니다.
flex-row (가로 정렬) 일 때: 자식들을 **위쪽(Top)**에 딱 붙입니다.
자식들의 높이가 제각각이어도 모두 천장에 머리를 맞추고 서 있게 됩니다.
flex-col (세로 정렬) 일 때: 자식들을 **왼쪽(Left)**에 딱 붙입니다.
자식들의 너비가 달라도 모두 왼쪽 벽에 등을 맞추고 서 있게 됩니다.

1. 왜 variant라고 부를까요?
하나의 버튼(Button)이라도 서비스 안에서는 여러 가지 모습으로 쓰입니다.
Primary (주요): "확인", "저장"처럼 눈에 띄어야 하는 파란색 버튼
Destructive (위험): "삭제", "탈퇴"처럼 경고를 주는 빨간색 버튼
Ghost (유령): 배경색 없이 글자만 있다가 마우스를 올리면 슬쩍 배경이 생기는 버튼 (사이드바 메뉴용)
이걸 매번 새로운 클래스로 만드는 게 아니라, **"버튼이라는 본체는 하나인데, '변형(Variant)'만 골라서 쓴다"**는 전략입니다.

테두리를 '제거'하고 싶을 때는?
테두리도 없고 배경도 없애서, 평소에는 글자만 보이다가 마우스를 올릴 때만 반응하게 하고 싶다면 아까 보셨던 **ghost**를 사용합니다.
variant="outline": "테두리만 그려줘" (보통 '취소'나 '보조 기능' 버튼에 사용)
variant="ghost": "테두리도 배경도 다 빼줘" (유령처럼! 주로 사이드바 메뉴나 아이콘 버튼에 사용)

1. text-base의 구체적인 스펙테일윈드에서 이 클래스를 적용하면 내부적으로 다음과 같은 CSS 속성이 적용됩니다.
글자 크기 (Font Size): 1rem (16px)줄 간격 (Line Height): 1.5rem (24px)
2. 왜 16px이 기준인가요?브라우저 표준: 전 세계 모든 최신 웹 브라우저(Chrome, Safari, Edge 등)의 기본 폰트 크기 설정값이 바로 16px입니다.
가독성: 본문 텍스트를 읽기에 가장 쾌적한 크기로 알려져 있습니다. 
너무 작지도, 너무 크지도 않은 "딱 적당한" 크기죠.
상대 단위(rem): text-base는 고정된 px이 아니라 rem 단위를 씁니다. 
만약 사용자가 브라우저 설정에서 "글꼴 크게 보기"를 선택하면, 이 text-base 값도 그에 맞춰 유연하게 커집니다. 
(접근성 측면에서 매우 훌륭하죠!)
3. 주변 크기들과 비교 (시니어용 표)주로 본문은 text-base를 쓰고, 부가 설명은 한 단계 작게, 
강조는 한 단계 크게 씁니다.
클래스픽셀(px)용도
text-sm 14px 부가 설명, 푸터, 작은 캡션
text-base 16px 일반 본문, 블로그 글, 게시글 내용
text-lg 18px 소제목, 강조하고 싶은 문장
text-xl 20px 제목, 섹션 헤더
*/