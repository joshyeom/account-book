---
title: 필요할 때까지 await 지연
impact: HIGH
impactDescription: 사용되지 않는 코드 경로 차단 방지
tags: async, await, 조건문, 최적화
---

## 필요할 때까지 await 지연

`await` 작업을 실제로 사용되는 분기로 이동하여 필요하지 않은 코드 경로를 차단하지 않도록 합니다.

**잘못된 예 (두 분기 모두 차단):**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId);

  if (skipProcessing) {
    // 즉시 반환하지만 userData를 기다림
    return { skipped: true };
  }

  // 이 분기만 userData를 사용
  return processUserData(userData);
}
```

**올바른 예 (필요할 때만 차단):**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // 기다리지 않고 즉시 반환
    return { skipped: true };
  }

  // 필요할 때만 가져오기
  const userData = await fetchUserData(userId);
  return processUserData(userData);
}
```

**또 다른 예 (조기 반환 최적화):**

```typescript
// 잘못된 예: 항상 권한을 가져옴
async function updateResource(resourceId: string, userId: string) {
  const permissions = await fetchPermissions(userId);
  const resource = await getResource(resourceId);

  if (!resource) {
    return { error: "Not found" };
  }

  if (!permissions.canEdit) {
    return { error: "Forbidden" };
  }

  return await updateResourceData(resource, permissions);
}

// 올바른 예: 필요할 때만 가져옴
async function updateResource(resourceId: string, userId: string) {
  const resource = await getResource(resourceId);

  if (!resource) {
    return { error: "Not found" };
  }

  const permissions = await fetchPermissions(userId);

  if (!permissions.canEdit) {
    return { error: "Forbidden" };
  }

  return await updateResourceData(resource, permissions);
}
```

이 최적화는 건너뛰는 분기가 자주 사용되거나 지연된 작업이 비용이 많이 들 때 특히 유용합니다.
