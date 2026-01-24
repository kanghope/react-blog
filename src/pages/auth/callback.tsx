import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { useEffect } from "react";
import { useNavigate } from "react-router"

export default function AuthCallback() {

    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        const { data : Listener} = supabase.auth.onAuthStateChange( async (_event, session) => {
            if(!session?.user)
            {
                console.log("세션에 사용자 정보가 없습니다.");
                return;
            }

            const user = session.user;

            if(!user.id)
            {
                console.log("유저 ID가 없습니다.");
                return;
            }

            try{
                const { data: existData, error: selError } = await supabase.from("user").select("id").eq("id", user.id).single();

                if(!existData)
                {
                    const { error: insertError } = await supabase
                    .from('user')
                    .insert([
                    {id: user.id, email: user.email,  service_agreed: true, maketing_agreed: true, privacy_agreed : false }
                    ]);

                    if(insertError)
                    {
                        console.error("user 테이블 데이터 추가중 에러가 발생하였습니다.");
                        return;
                    }
                }

                if(selError)
                {
                    console.error("user 테이블 데이터 추가중 에러가 발생하였습니다.");
                    return;
                }

                setUser(
                    {
                        id: user.id,
                        email: user.email || "알수없는 사용자",
                        role: user.role || "",
                    }
                );
                navigate("/");
            }
            catch(error)
            {
                console.error(error);
                throw error;
            }
        });

        // 언마운트 시, 구독 해지
        return () => {
            Listener.subscription.unsubscribe();
        };
    },[]);

    return (
    <main className="w-full h-full min-h-[720px] flex items-center justify-center">
      로그인을 진행 중입니다.
    </main>
  )
}
