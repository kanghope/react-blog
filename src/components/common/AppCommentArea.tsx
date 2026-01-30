import { useEffect, useState } from "react";
import { MessageSquareQuote, User, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import dayjs from "dayjs";
import supabase from "@/lib/supabase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";

interface Props {
  topicId: string;
  user: any; // 스토어에서 받은 유저 정보
}

export function AppCommentArea({ topicId, user} : Props) {
    const [comments, setComments] = useState<any[]>([]);//댓글 리스트
    const [commentInput, setCommentInput] = useState(""); // 댓글 입력

    // 1.댓글 목록 조회
    const fetchComments = async () => {
    const { data, error } = await supabase
        .from("comment")
        .select(`
        *,
        author:user(
            email                          
        )
        `) // comment.user_id를 통해 public.user 테이블의 email을 가져옴
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

        if (error) {
            console.error("댓글 로딩 실패:", error);
        } else {
            setComments(data || []);
        }
    };
    // 2. 댓글 등록
    const handleCreateComment = async () => {
        try{
            if(!user?.email)
            {
                toast.error("로그인이 필요합니다.");
                return;
            }
            if (!commentInput.trim()) return;

            const { error } = await supabase.from("comment").insert([
                {
                    topic_id: topicId,
                    user_id: user.id,
                    content: commentInput,
                }
            ]);

            if (!error) {
                toast.success("댓글이 등록 되었습니다.");
                setCommentInput("");
                fetchComments();
            }
        }
        catch(error)
        {
            console.log(error);
            throw error;
        }
    };

    // 3. 삭제
    const handleDeleteComment = async (commentId: string) => {
        const { error } = await supabase.from("comment").delete().eq("id", commentId);
        if (!error) {
            toast.success("댓글이 삭제되었습니다.");
            fetchComments();
        }
    };

    useEffect(() => {
        if (topicId) fetchComments();
    }, [topicId]);

    return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-12 mb-20 flex flex-col gap-6">
      <div className="flex items-end gap-3">
        <MessageSquareQuote size={22} className="text-primary" />
        <h3 className="text-xl font-bold">댓글</h3>
        <span className="text-xs text-muted-foreground ml-1">{comments.length}개</span>
      </div>
      <Separator />

      {/* 입력 섹션 */}
      <div className="flex gap-3">
        <Avatar className="size-9 border bg-muted">
          <AvatarFallback><User size={18} /></AvatarFallback>
        </Avatar>
        <div className="flex-1 flex flex-col gap-2">
          <Textarea
            placeholder={user ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
            className="bg-input/20 h-20 resize-none text-sm"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            disabled={!user}
          />
          <div className="flex justify-end">
            <Button onClick={handleCreateComment} disabled={!user || !commentInput.trim()} size="sm">
              등록
            </Button>
          </div>
        </div>
      </div>

      {/* 댓글 리스트 */}
      <div className="flex flex-col gap-6 mt-4">
        {comments.map((comment) => {
          // 조인된 이메일 정보 추출 (아이디 부분만 표시)
          const displayEmail = comment.author?.email?.split("@")[0] || "알 수 없는 사용자";

          return (
            <div key={comment.id} className="flex flex-col gap-1 group">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-full bg-accent flex items-center justify-center">
                  <User size={14} className="text-muted-foreground" />
                </div>
                <span className="text-sm font-semibold">{displayEmail}</span>
                <span className="text-[10px] text-muted-foreground">
                  {dayjs(comment.created_at).format("YYYY.MM.DD HH:mm")}
                </span>

                {user?.id === comment.user_id && (
                  

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                    
                    className="ml-auto p-1 text-muted-foreground bg-transparent border-none text-red-500  cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>댓글을 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            삭제된 댓글은 복구할 수 없습니다. 정말로 삭제하시겠습니까?
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600/50 text-foreground hover:bg-red-700/50" onClick={() => handleDeleteComment(comment.id)}>삭제</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                )}
              </div>
              <p className="pl-9 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          );
        })}

        {comments.length === 0 && (
          <p className="text-center py-1 text-xs text-muted-foreground">첫 댓글을 남겨보세요! 💬</p>
        )}
      </div>
    </div>
  );
}
