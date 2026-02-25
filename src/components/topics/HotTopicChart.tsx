import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  PieChart, Pie, Legend 
} from "recharts";
import { type Topic } from "@/types/topic.type";

interface ChartItem{
    name: string;
    value: number;
}   
interface Props {
  data: Topic[] | ChartItem[]; // 토픽 배열 또는 차트용 데이터 배열
  // 💡 모드를 3가지로 확장: horizontal(세로막대), vertical(가로막대), pie(원형)
  mode?: "horizontal" | "vertical" | "pie"; 
}
    
export const HotTopicChart = ({ data, mode = "horizontal" }: Props) => {
    const isMobile = window.innerWidth < 768;
 // 💡 데이터 표준화 로직: Topic[]이든 ChartItem[]이든 무조건 { name, value } 배열로 만듭니다.
  const chartData: ChartItem[] = data.slice(0, 5).map((item) => {


    // 1. Topic 타입인 경우 (title 속성이 있는지 확인)
    if ('title' in item) {
      return {
        name: item.title.length > (isMobile ? 3 : 10) ? item.title.substring(0, isMobile ? 4 : 10) + ".." : item.title,
        value: item.views || 0,
      };
    }
    // 2. 이미 ChartItem 타입인 경우
    return {
      name: item.name.length > (isMobile ? 3 : 10) ? item.name.substring(0, isMobile ? 4 : 10) + ".." : item.name,
      value: item.value,
    };
  });

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#6366f1"];

  // 1. 파이 차트 렌더링 함수
  const renderPieChart = () => (
    <PieChart>
      <Pie
        data={chartData}
        cx="50%" // 차트 중심 X좌표
        cy="50%" // 차트 중심 Y좌표
        innerRadius={60} // 💡 도넛 형태로 만들고 싶으면 값을 넣으세요 (0이면 꽉 찬 원)
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
      >
        {chartData.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        contentStyle={{ backgroundColor: "#1c1c1c", border: "1px solid #333", borderRadius: "8px" }}
      />
      {/* 하단에 범례 표시 */}
      <Legend verticalAlign="bottom" height={36} iconType="circle" />
    </PieChart>
  );

  // 2. 막대 차트 렌더링 함수 (기존 로직)
  const renderBarChart = () => (
    <BarChart 
      data={chartData} 
      layout={mode === "vertical" ? "vertical" : "horizontal"}
      margin={{ top: 5, right: 30, left: mode === "vertical" ? 40 : 0, bottom: mode === "vertical" ? 30 : 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" vertical={mode === "vertical"} horizontal={mode !== "vertical"} stroke="#333" />
      {mode === "vertical" ? (
        <>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#888" }} width={90} axisLine={false} tickLine={false} />
        </>
      ) : (
        <>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} interval={0} height={40} />
          <YAxis hide />
        </>
      )}
      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: "#1c1c1c", border: "1px solid #333", borderRadius: "8px" }} />
      <Bar dataKey="value" radius={mode === "vertical" ? [0, 4, 4, 0] : [4, 4, 0, 0]} barSize={mode === "vertical" ? 25 : 40}>
        {chartData.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  );

  return (
    <div className={`w-full ${mode === "pie" ? "h-[320px]" : mode === "vertical" ? "h-[300px]" : "h-[220px]"} mb-8 bg-card/50 p-6 rounded-2xl border border-border/50 shadow-sm transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold tracking-tight text-primary">
          {mode === "pie" ? "인기 카테고리 비중" : mode === "vertical" ? "랭킹 요약" : "실시간 트렌드"}
        </h4>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Live Data</span>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        {mode === "pie" ? renderPieChart() : renderBarChart()}
      </ResponsiveContainer>
    </div>
  );
};
/*
1. 틀 잡기 (Container & Chart)
<ResponsiveContainer>: 그래프가 부모 박스의 크기에 맞춰 자동으로 늘어나거나 줄어들게 합니다. (width="100%" height="100%")

<BarChart data={chartData}>: "이제부터 막대 그래프를 그릴 거야"라고 선언하며, 사용할 데이터를 연결합니다.

margin: 그래프 테두리와 실제 데이터 사이의 여백을 설정합니다.

2. 배경과 축 (Grid & Axis)
<CartesianGrid />: 배경에 깔리는 가로 점선입니다. vertical={false}이므로 세로선은 없고 가로선만 생깁니다.

<XAxis />: 아래쪽 **가로축(이름)**입니다. 선(axisLine)과 눈금(tickLine)을 지워 깔끔하게 만들었고, 글자 크기를 작게(11px) 조절했습니다.

<YAxis hide />: 세로축(숫자)입니다. hide가 붙어있어 화면에는 보이지 않게 숨겼습니다. (디자인을 깔끔하게 하기 위함)

3. 상호작용 (Tooltip)
<Tooltip />: 마우스를 막대 위에 올렸을 때 나타나는 설명창입니다.

backgroundColor: "#1c1c1c": 검은색 톤의 어두운 배경창입니다.

borderRadius: "8px": 창 모서리를 둥글게 깎았습니다.

4. 실제 막대 (Bar & Cell)
<Bar dataKey="views" />: '조회수(views)' 데이터를 막대로 그립니다.

radius={[4, 4, 0, 0]}: 막대의 윗부분만 둥글게 만듭니다.

barSize={40}: 막대의 두께를 40px로 고정합니다.

<Cell />: 각 막대마다 다른 색상을 입히기 위한 설정입니다. COLORS 배열에 있는 색상들을 순서대로 돌아가며 칠합니다.

💡 한 줄 요약
**"배경 선은 가로로만 있고, 축 선은 숨겨서 깔끔하며, 마우스를 올리면 검은색 팝업이 뜨고, 막대 윗부분은 둥근 알록달록한 그래프"**입니다.
 */