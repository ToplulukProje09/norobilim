// src/utils/unwrapParams.ts
export async function unwrapParams<T extends object>(
  params: Promise<T> | T
): Promise<T> {
  return params instanceof Promise ? await params : params;
}
