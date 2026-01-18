import { NextRequest, NextResponse } from "next/server";

import OpenAI from "openai";

import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

import type { TransactionType } from "@/types/database";

type AnalyzedReceiptItem = {
  name: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  isNewCategory: boolean;
  suggestedIcon?: string;
  suggestedColor?: string;
};

type AnalyzedReceiptResponse = {
  items: AnalyzedReceiptItem[];
};

export const POST = async (request: NextRequest) => {
  try {
    // async-api-routes: API 라우트에서 독립적인 작업은 미리 시작
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // async-parallel: 독립적인 작업들을 병렬로 실행하여 워터폴 제거
    const [supabase, formData] = await Promise.all([createClient(), request.formData()]);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // async-parallel: 이미지 변환과 카테고리 조회를 병렬로 실행
    const [imageBuffer, categoriesResult] = await Promise.all([
      image.arrayBuffer(),
      supabase
        .from("categories")
        .select("name, category_type")
        .or(`user_id.eq.${user.id},is_default.eq.true`),
    ]);

    // Convert image to base64
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const { data: userCategories } = categoriesResult;

    const userCategoryNames =
      (userCategories as { name: string; category_type: string }[] | null)?.map((c) => c.name) ||
      [];
    const expenseCategories = [
      ...DEFAULT_EXPENSE_CATEGORIES.map((c) => c.name),
      ...userCategoryNames,
    ];
    const incomeCategories = [
      ...DEFAULT_INCOME_CATEGORIES.map((c) => c.name),
      ...userCategoryNames,
    ];

    // Analyze receipt with GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `당신은 결제 내역 스크린샷을 분석하는 AI 어시스턴트입니다.
스크린샷 이미지에서 **모든 거래 내역**을 추출해주세요. 이미지에 여러 건의 거래가 있다면 모두 추출합니다.

각 거래 항목별로 다음 정보를 추출하세요:
1. 상호명 또는 거래 항목명
2. 금액 (숫자만, 항상 양수)
3. 날짜 (YYYY-MM-DD 형식, 날짜가 없으면 오늘 날짜: ${new Date().toISOString().split("T")[0]})
4. 거래 유형 (income: 입금/수입, expense: 출금/지출)
5. 적절한 카테고리

지출 카테고리 목록: ${expenseCategories.join(", ")}
수입 카테고리 목록: ${incomeCategories.join(", ")}

거래 유형 판단 기준:
- "입금", "받은 돈", "이체받음", "급여", "월급", "환급" 등은 income
- "출금", "결제", "이체", "구매", "지출" 등은 expense
- 금액 앞에 "+" 또는 파란색/초록색이면 income
- 금액 앞에 "-" 또는 빨간색이면 expense

기존 카테고리에 맞는 것이 없다면 새로운 카테고리를 제안해주세요.
새 카테고리를 제안할 경우, Lucide 아이콘 이름과 HSL 색상 코드도 함께 제안해주세요.

사용 가능한 Lucide 아이콘: Utensils, Car, Coffee, ShoppingBag, Film, Heart, Home, Zap, Banknote, Gift, TrendingUp, Plus, HelpCircle, Phone, Wifi, Book, Music, Plane, Train, Bus, Bike, Shirt, Watch, Headphones, Monitor, Smartphone, Gamepad, Camera, Tv, Speaker, Laptop, Tablet

JSON 형식으로만 응답해주세요:
{
  "items": [
    {
      "name": "상호명 또는 항목명",
      "amount": 금액(숫자, 항상 양수),
      "date": "YYYY-MM-DD",
      "type": "income" 또는 "expense",
      "category": "카테고리명",
      "isNewCategory": true/false,
      "suggestedIcon": "Lucide아이콘명 (새 카테고리인 경우만)",
      "suggestedColor": "hsl(h, s%, l%) (새 카테고리인 경우만)"
    }
  ]
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: "이 결제 내역 스크린샷에서 모든 거래 항목을 추출해주세요.",
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Failed to analyze receipt" }, { status: 500 });
    }

    // Parse JSON response - handle markdown code blocks and extra text
    let jsonString = content;

    // Remove markdown code blocks if present
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1].trim();
    }

    // Extract JSON object (non-greedy match for first complete object)
    const jsonMatch = jsonString.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
    if (!jsonMatch) {
      console.error("Failed to extract JSON from:", content);
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }

    let analyzedData: AnalyzedReceiptResponse;
    try {
      analyzedData = JSON.parse(jsonMatch[0]);
      // Handle backward compatibility - if response is single item (old format)
      if (!analyzedData.items && (analyzedData as unknown as AnalyzedReceiptItem).name) {
        analyzedData = { items: [analyzedData as unknown as AnalyzedReceiptItem] };
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Raw content:", content);
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
    }

    return NextResponse.json(analyzedData);
  } catch (error) {
    console.error("Receipt analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze receipt" }, { status: 500 });
  }
}
