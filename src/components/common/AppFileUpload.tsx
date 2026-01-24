import { useRef, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Image } from "lucide-react";

interface Props {
    file : File | string | null;
    onChange: ( file: File | string | null) => void;
}

export function AppFileUpload({file, onChange}: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // 파일 변경 감지 및 상위 컴포넌트 전달
    const handleChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.files?.[0] ?? null);

        e.target.value = "";
    };
    // 이미지 미리보기

    const handleRenderPreview = () => {

        /*
        ① 첫 번째 분기: typeof file === "string"
        상황: 이미 DB에 저장된 이미지 경로(예: https://.../photo.jpg)가 넘어온 경우입니다.
        동작: 문자열 그대로를 src에 넣어서 서버에 있는 이미지를 불러옵니다.
        비유: DB에서 가져온 **파일 경로(Path)**를 그대로 Image.Url에 바인딩하는 것과 같습니다.

        ② 두 번째 분기: file instanceof File
        상황: 사용자가 '파일 선택' 버튼을 눌러서 내 컴퓨터에 있는 사진을 막 올린 경우입니다.
        동작: URL.createObjectURL(file)을 사용해 브라우저 메모리에 임시 주소를 만들어서 보여줍니다. (미리보기 기능)
        비유: 로컬 파일을 MemoryStream으로 읽어서 화면에 임시로 렌더링하는 것과 같습니다.
        */
        if(typeof file === "string")
        {
            /*rounded-lg (Large Corner Radius): 모서리를 부드럽게 깎습니다. lg는 약 8px 정도의 곡률을 줍니다.
            object-cover (비율 유지 채우기): 이미지나 영상의 비율이 16:9와 맞지 않을 때, 여백을 남기지 않고 이미지를 잘라내서라도 박스에 꽉 채우는 방식입니다. (가장 깔끔하게 보입니다.)
            border (테두리): 요소의 외곽에 1px 실선을 그립니다. (보통 연한 회색으로 들어갑니다.) */
            return <img src={file} alt="@THUMBNAIL" className="w-full aspect-video rounded-lg object-cover boreder" />
        }
        else if (file instanceof File)
        {
            return <img src={URL.createObjectURL(file)} alt="@THUMBNAIL" className="w-full aspect-video rounded-lg object-cover boreder" />
        }

        //썸네일이 설정되지 않은 경우에는 기본 이미지 아이콘을 보여줍니다.
        return (
            <div className="w-full flex items-center justify-center aspect-video bg-card rounded-lg">
                <Button size={"icon"} variant={"ghost"} onClick = {() => fileInputRef.current?.click()} >
                    <Image />
                </Button>
            </div>
        )
    };
    return (
    <>
        {handleRenderPreview()}
        <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleChangeFile} className="hidden" />
    </>
    );
    
}
