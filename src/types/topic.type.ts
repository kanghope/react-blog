export enum TOPIC_STATUS {
    TEMP = "temp",
    PUBLISH = "publish",
}

export interface Topic
{
    id: number,
    created_at : Date | string ;	
    author : any;	
    title : string;
    content	: string;
    category : string;
    thumbnail : string;	
    status : TOPIC_STATUS;
    views : number;
    comment_count : number | any;
}
 // 1. 타입 정의 (컴포넌트 상단 또는 types 파일)
export interface CategoryStat {
  name: string;   // 카테고리 이름 (예: 'React', 'TypeScript')
  value: number;  // 해당 카테고리의 글 수
}