---
title: 긴 리스트에 CSS content-visibility 적용
impact: HIGH
impactDescription: 더 빠른 초기 렌더
tags: rendering, css, content-visibility, long-lists
---

## 긴 리스트에 CSS content-visibility 적용

화면 밖 렌더링을 지연시키기 위해 `content-visibility: auto`를 적용합니다.

**CSS:**

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

**예시:**

```tsx
function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="h-screen overflow-y-auto">
      {messages.map((msg) => (
        <div key={msg.id} className="message-item">
          <Avatar user={msg.author} />
          <div>{msg.content}</div>
        </div>
      ))}
    </div>
  );
}
```

1000개의 메시지가 있으면 브라우저가 ~990개의 화면 밖 항목에 대한 레이아웃/페인트를 건너뜁니다 (10배 빠른 초기 렌더).
