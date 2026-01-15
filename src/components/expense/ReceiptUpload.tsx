"use client";

import { useCallback, useRef, useState } from "react";

// bundle-barrel-imports: 개별 아이콘만 import하여 트리 쉐이킹 최적화
import { Camera, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button, Card, CardContent } from "@/components/ui";

import type { TransactionType } from "@/types/database";

export type AnalyzedReceiptItem = {
  name: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  isNewCategory: boolean;
  suggestedIcon?: string;
  suggestedColor?: string;
};

export type AnalyzedReceiptResponse = {
  items: AnalyzedReceiptItem[];
};

type ReceiptUploadProps = {
  onAnalyzed: (data: AnalyzedReceiptResponse) => void;
};

export function ReceiptUpload({ onAnalyzed }: ReceiptUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // rerender-functional-setstate: useCallback으로 함수 참조 안정화
  const handleImageSelect = useCallback(
    async (file: File) => {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Analyze receipt
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/ai/analyze-receipt", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to analyze receipt");
        }

        const data: AnalyzedReceiptResponse = await response.json();
        onAnalyzed(data);
        const itemCount = data.items?.length || 0;
        toast.success(`${itemCount}건의 거래 내역을 찾았습니다!`);
      } catch (error) {
        console.error("Analysis error:", error);
        toast.error("스크린샷 분석에 실패했습니다");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [onAnalyzed]
  );

  // rerender-functional-setstate: useCallback으로 함수 참조 안정화
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageSelect(file);
      }
    },
    [handleImageSelect]
  );

  // rerender-functional-setstate: useCallback으로 함수 참조 안정화
  const clearPreview = useCallback(() => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }, []);

  return (
    <Card className="border-muted-foreground/25 hover:border-primary/50 overflow-hidden border-2 border-dashed transition-colors">
      <CardContent className="p-0">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Receipt preview"
              className="bg-muted/30 max-h-64 w-full object-contain"
            />
            {isAnalyzing ? (
              <div className="bg-background/80 absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="text-primary h-10 w-10 animate-spin" />
                  <p className="text-sm font-medium">AI가 거래 내역을 분석 중...</p>
                </div>
              </div>
            ) : (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-4 p-6">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              variant="outline"
              className="hover:bg-primary/5 hover:border-primary h-32 flex-1 flex-col gap-3"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="text-muted-foreground h-8 w-8" />
              <span className="text-sm font-medium">카메라로 촬영</span>
            </Button>

            <Button
              variant="outline"
              className="hover:bg-primary/5 hover:border-primary h-32 flex-1 flex-col gap-3"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="text-muted-foreground h-8 w-8" />
              <span className="text-sm font-medium">갤러리에서 선택</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
