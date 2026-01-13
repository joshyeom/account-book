'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface AnalyzedReceipt {
  name: string
  amount: number
  date: string
  category: string
  isNewCategory: boolean
  suggestedIcon?: string
  suggestedColor?: string
}

interface ReceiptUploadProps {
  onAnalyzed: (data: AnalyzedReceipt) => void
}

export function ReceiptUpload({ onAnalyzed }: ReceiptUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = async (file: File) => {
    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Analyze receipt
    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/ai/analyze-receipt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze receipt')
      }

      const data = await response.json()
      onAnalyzed(data)
      toast.success('영수증 분석 완료!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('영수증 분석에 실패했습니다')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Receipt preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            {isAnalyzing ? (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">AI가 분석 중...</p>
                </div>
              </div>
            ) : (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearPreview}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
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
              className="flex-1 h-24 flex-col gap-2"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="w-6 h-6" />
              <span className="text-sm">카메라</span>
            </Button>

            <Button
              variant="outline"
              className="flex-1 h-24 flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm">갤러리</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
