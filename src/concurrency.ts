export function divideArray<T>(arr: T[], size): T[][] {
  if (size <= 0) {
    return []
  }
  const result: T[][] = []

  for (let i = 0; i < arr.length; i += size) {
    const chunk = arr.slice(i, i + size)
    result.push(chunk)
  }
  return result
}

const concurrentCall = async (array: string[]): Promise<any[]> => {
  const promises = array.map(url => fetch(url))
  const res = await Promise.all(promises)
  return res
}

export const concurrentCalls = async (
  arrayOfURLs: string[],
  maxConcurrency: number
) => {
  const dividedArray = divideArray<string>(arrayOfURLs, maxConcurrency)
  console.log(dividedArray)
  const result: any[] = []

  for (const array of dividedArray) {
    const res = await concurrentCall(array)
    const jsonResponses = await Promise.all(res.map(r => r.json()))
    result.push(...jsonResponses)
  }
  
  return result
}
