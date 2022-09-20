import { concurrentCalls, divideArray } from './concurrency'

describe('divide array', () => {
  const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

  it('divideArray works with arrays', () => {
    expect(divideArray<string>(array, 3)).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      ['g', 'h', 'i'],
      ['j'],
    ])
    expect(divideArray<string>(array, 4)).toEqual([
      ['a', 'b', 'c', 'd'],
      ['e', 'f', 'g', 'h'],
      ['i', 'j'],
    ])
    expect(divideArray<string>(array, 5)).toEqual([
      ['a', 'b', 'c', 'd', 'e'],
      ['f', 'g', 'h', 'i', 'j'],
    ])
    expect(divideArray<string>(array, 6)).toEqual([
      ['a', 'b', 'c', 'd', 'e', 'f'],
      ['g', 'h', 'i', 'j'],
    ])
  })

  it('divideArray works with empty arrays', () => {
    expect(divideArray<string>([], 3)).toEqual([])
  })

  it('divideArray works with size 0 or negative integer', () => {
    expect(divideArray<string>(array, 0)).toEqual([])
    expect(divideArray<string>(array, -1)).toEqual([])
  })

  it('divideArray works with size bigger than array length', () => {
    expect(divideArray<string>(array, 11)).toEqual([array])
  })
})

describe('concurrentCalls', () => {
  let activeFetchs: number = 0
  let maxActiveFetchs: number = 0

  const arrayOfURLs = [
    'https://jsonplaceholder.typicode.com/todos/1',
    'https://jsonplaceholder.typicode.com/todos/2',
    'https://jsonplaceholder.typicode.com/todos/3',
    'https://jsonplaceholder.typicode.com/todos/4',
    'https://jsonplaceholder.typicode.com/todos/5',
    'https://jsonplaceholder.typicode.com/todos/6',
    'https://jsonplaceholder.typicode.com/todos/7',
    'https://jsonplaceholder.typicode.com/todos/8',
    'https://jsonplaceholder.typicode.com/todos/9',
    'https://jsonplaceholder.typicode.com/todos/10',
  ]

  beforeAll(() => {
    jest.setTimeout(10000)
    global.fetch = jest.fn(async () => {
      if (++activeFetchs > maxActiveFetchs) {
        maxActiveFetchs = activeFetchs
      }

      const _p = new Promise((resolve, reject) => {
        setTimeout(() => {
          activeFetchs--
          resolve({
            json: async () => ({
              msg: 'ok',
            }),
          })
        }, 0)
      })

      return await _p
    }) as jest.Mock
  })

  beforeEach(() => {
    ;(fetch as jest.Mock).mockClear()
    activeFetchs = 0
    maxActiveFetchs = 0
  })

  it('concurrentCalls calls works with empty array', async () => {
    expect(await concurrentCalls([], 3)).toEqual([])
  })

  it('concurrentCalls works with concurrent size 0 or negative integer', async () => {
    expect(await concurrentCalls(arrayOfURLs, 0)).toEqual([])
    expect(await concurrentCalls(arrayOfURLs, -1)).toEqual([])
  })

  it('concurrentCalls calls fetch with correct arguments', async () => {
    await concurrentCalls(arrayOfURLs, 3)
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1'
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/2'
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/3'
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/4'
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/5'
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/6'
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/7'
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/8'
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/9'
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/10'
    )
  })

  it('concurrentCalls calls fetch correct number of times', async () => {
    await concurrentCalls(arrayOfURLs, 3)
    expect(fetch).toHaveBeenCalledTimes(10)
  })

  it('concurrentCalls gets the correct number of responses', async () => {
    const res = await concurrentCalls(arrayOfURLs, 3)
    expect(res.length).toBe(10)
  })

  it('concurrenCalls doesnt exceed the max concurrent calls', async () => {
    await concurrentCalls(arrayOfURLs, 3)
    expect(maxActiveFetchs).toBeLessThanOrEqual(3)
    maxActiveFetchs = 0
    await concurrentCalls(arrayOfURLs, 5)
    expect(maxActiveFetchs).toBeLessThanOrEqual(5)
  })

  it('concurrency is optimized to the max concurrency', async () => {
    await concurrentCalls(arrayOfURLs, 10)
    expect(maxActiveFetchs).toBe(10)
    maxActiveFetchs = 0
    await concurrentCalls(arrayOfURLs, 5)
    expect(maxActiveFetchs).toBe(5)
    maxActiveFetchs = 0
    await concurrentCalls(arrayOfURLs, 3)
    expect(maxActiveFetchs).toBe(3)
    maxActiveFetchs = 0
    await concurrentCalls(arrayOfURLs, 100)
    expect(maxActiveFetchs).toBe(10)
  })
})
