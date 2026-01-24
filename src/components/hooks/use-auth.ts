import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { useEffect } from "react";
import { useNavigate } from "react-router";
/**
 * useAuthListener:
 * 1. 컴포넌트 마운트 시 최초 세션 정보를 확인합니다. (새로고침 시 사용자 정보 유지)
 * 2. Supabase의 실시간 onAuthStateChange 리스너를 설정합니다.
 * 3. 로그인/로그아웃, 토큰 갱신, OAuth 리디렉션 등 인증 상태가 변경될 때마다 전역 상태를 업데이트합니다.
 * 이 훅은 일반적으로 애플리케이션의 최상위 컴포넌트(예: App.jsx)에서 단 한 번 호출되어야 합니다.
 */
export default function useAuthListener() {
    // Zustand (또는 다른 상태 관리 라이브러리)에서 사용자 정보를 설정하는 함수를 가져옵니다.
    const setUser = useAuthStore((state) => state.setUser);

    // 컴포넌트 마운트 시에만 실행되도록 useEffect의 의존성 배열은 비워둡니다 ([]).
    useEffect(() => {
            /**
         * 1. 초기 세션 확인 (Initial Session Check)
         * - 앱이 로드되거나 새로고침되었을 때, Supabase에 저장된 현재 세션 정보를 확인합니다.
         * - 세션이 유효하다면, 그 즉시 전역 상태(Zustand Store)에 사용자 정보를 설정합니다.
         */
            const checkSession = async () => {
                // 현재 세션 정보를 비동기적으로 가져옵니다.
                const { data: { session }, } = await supabase.auth.getSession();
                // 세션과 사용자 정보가 존재하면,
                if(session?.user) {
                    // 전역 상태에 사용자 정보를 업데이트합니다.
                    // TypeScript 환경이므로 role과 email은 string으로 단언(assertion) 처리합니다.
                    setUser({
                        id: session.user.id,
                        email: session.user.email as string,
                        role: session.user.role as string,
                    });
                }
            };
            checkSession();//// 초기 세션 확인 함수를 즉시 호출합니다.

            /**
         * 2. 실시간 인증 상태 변화 감지 (Real-time Auth State Change Listener)
         * - onAuthStateChange는 인증 관련 이벤트(로그인, 로그아웃, 토큰 갱신 등)가 발생할 때마다 실행됩니다.
         * - 특히, OAuth 소셜 로그인 후 리디렉션될 때, 이 리스너가 새로운 세션을 감지합니다.
         */
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            // session이 유효하면 (로그인 상태)
            if (session?.user) {
                // 전역 상태 업데이트: 로그인 성공
                setUser({
                    id: session.user.id,
                    email: session.user.email as string,
                    role: session.user.role as string,
                });
            } else {
                // session이 null이면 (로그아웃 상태 또는 세션 만료)
                // 전역 상태를 null로 설정하여 로그아웃 처리합니다.
                setUser(null);
            }
        });

        /**
         * 3. 클린업 함수 (Cleanup)
         * - 컴포넌트가 언마운트될 때 메모리 누수를 방지하기 위해 리스너 구독을 해제합니다.
         * - Supabase 리스너는 `.subscription.unsubscribe()`를 통해 해제해야 합니다.
         */
        return () => {
            // data 객체 내의 listener 객체를 통해 구독을 해제합니다.
            listener.subscription.unsubscribe();
        };

        },[]); // 빈 배열: 컴포넌트 마운트/언마운트 시에만 실행

       
}
