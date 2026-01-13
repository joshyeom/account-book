import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_CATEGORIES } from '@/lib/constants'

interface AnalyzedReceipt {
  name: string
  amount: number
  date: string
  category: string
  isNewCategory: boolean
  suggestedIcon?: string
  suggestedColor?: string
}

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const base64Image = Buffer.from(bytes).toString('base64')
    const mimeType = image.type || 'image/jpeg'

    // Get user's existing categories
    const { data: userCategories } = await supabase
      .from('categories')
      .select('name')
      .or(`user_id.eq.${user.id},is_default.eq.true`)

    const userCategoryNames = (userCategories as { name: string }[] | null)?.map(c => c.name) || []
    const existingCategories = [
      ...DEFAULT_CATEGORIES.map(c => c.name),
      ...userCategoryNames,
    ]

    // Analyze receipt with GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 영수증을 분석하는 AI 어시스턴트입니다.
영수증 이미지를 분석하여 다음 정보를 추출해주세요:
1. 상호명 또는 구매 항목명
2. 총 금액 (숫자만)
3. 날짜 (YYYY-MM-DD 형식)
4. 적절한 카테고리

기존 카테고리 목록: ${existingCategories.join(', ')}

기존 카테고리에 맞는 것이 없다면 새로운 카테고리를 제안해주세요.
새 카테고리를 제안할 경우, Lucide 아이콘 이름과 HSL 색상 코드도 함께 제안해주세요.

JSON 형식으로만 응답해주세요:
{
  "name": "상호명 또는 항목명",
  "amount": 금액(숫자),
  "date": "YYYY-MM-DD",
  "category": "카테고리명",
  "isNewCategory": true/false,
  "suggestedIcon": "Lucide아이콘명 (새 카테고리인 경우)",
  "suggestedColor": "hsl(h, s%, l%) (새 카테고리인 경우)"
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: '이 영수증을 분석해주세요.',
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'Failed to analyze receipt' }, { status: 500 })
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 })
    }

    const analyzedData: AnalyzedReceipt = JSON.parse(jsonMatch[0])

    return NextResponse.json(analyzedData)
  } catch (error) {
    console.error('Receipt analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze receipt' },
      { status: 500 }
    )
  }
}
