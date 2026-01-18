"use client";

import { useState } from "react";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { User } from "@supabase/supabase-js";
import { LogOut, Moon, Sun, Tags, Trash2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import { ICON_MAP } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Separator,
} from "@/components/ui";

import { Category } from "@/types/database";

type SettingsClientProps = {
  user: User;
  customCategories: Category[];
};

export const SettingsClient = ({ user, customCategories }: SettingsClientProps) => {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [categories, setCategories] = useState(customCategories);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from("categories").delete().eq("id", deleteTarget.id);

      if (error) throw error;

      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success("카테고리가 삭제되었습니다");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserIcon className="h-5 w-5" />
            프로필
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.user_metadata?.full_name?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-lg font-semibold">{user.user_metadata?.full_name ?? "사용자"}</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">테마</CardTitle>
          <CardDescription>앱 테마를 선택하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="flex h-auto flex-col gap-1 py-3"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-5 w-5" />
              <span className="text-xs">라이트</span>
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="flex h-auto flex-col gap-1 py-3"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs">다크</span>
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              className="flex h-auto flex-col gap-1 py-3"
              onClick={() => setTheme("system")}
            >
              <span className="text-xs">시스템</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tags className="h-5 w-5" />내 카테고리
          </CardTitle>
          <CardDescription>AI가 생성한 커스텀 카테고리 목록입니다</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              커스텀 카테고리가 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = ICON_MAP[category.icon];
                return (
                  <div key={category.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {Icon && <Icon className="h-5 w-5" style={{ color: category.color }} />}
                    </div>
                    <span className="flex-1 font-medium">{category.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-muted-foreground space-y-1 pt-4 text-center text-sm">
        <p>딸깍 가계부 v1.0.0</p>
        <p>스크린샷 한 장으로 가계부를</p>
      </div>

      {/* Delete Category Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 삭제</DialogTitle>
            <DialogDescription>
              "{deleteTarget?.name}" 카테고리를 삭제하시겠습니까?
              <br />
              해당 카테고리의 거래는 "미분류"로 변경됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory} disabled={isDeleting}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
