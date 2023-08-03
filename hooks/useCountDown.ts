import { useEffect, useState } from 'react'
import React from 'react'
type Options = {
  intervalTime?: number
  start?: () => number
  onEnd?: () => void
  remindAfter?: number
  noHour?: boolean
  showDay?: boolean
  hasStyle?: boolean
}
type CountDownResult = {
  timeStamp: number
  timeString: string
  remind?: boolean
}
const COUNT_IN_MILLISECOND = 1
const SECOND_IN_MILLISECOND: number = 1 * COUNT_IN_MILLISECOND
const MINUTE_IN_MILLISECOND: number = 60 * SECOND_IN_MILLISECOND
const HOUR_IN_MILLISECOND: number = 60 * MINUTE_IN_MILLISECOND
const DAY_IN_MILLISECOND: number = 24 * HOUR_IN_MILLISECOND

function add0ToTag(str) {
  if (!str) return str
  if (String(str).length > 2) return str
  str = `0${str}`.slice(-2)
  let newString = ''
  for (let i = 0; i < str?.length; i++) {
    newString += `<span class='t'>${str[i]}</span>`
  }
  return newString
}

function add0ToStr(str) {
  if (!str && str !== 0) return str
  if (String(str).length > 2) return str
  return `0${str}`.slice(-2)
}

const getTimeStringFromStamp = (time, options: Options): string => {
  if (typeof time === 'undefined') {
    return options?.noHour ? '--:--' : '--:--:--'
  }
  if (typeof time === 'number' && time < 0) {
    return options?.noHour ? '00:00' : '00:00:00'
  }
  const day = Math.floor(time / DAY_IN_MILLISECOND)
  time = time % DAY_IN_MILLISECOND

  const hours = Math.floor(time / HOUR_IN_MILLISECOND)
  time = time % HOUR_IN_MILLISECOND

  const minutes = Math.floor(time / MINUTE_IN_MILLISECOND)
  time = time % MINUTE_IN_MILLISECOND

  const seconds = Math.floor(time / SECOND_IN_MILLISECOND) || '00'
  time = time % SECOND_IN_MILLISECOND

  let countTime = options?.noHour ? `${add0ToTag(minutes)}:${add0ToTag(seconds)}` : `${add0ToStr(hours)}:${add0ToStr(minutes)}:${add0ToStr(seconds)}`
  countTime = options?.showDay && day > 0 ? `${day}d ${countTime}` : countTime
  return countTime
}

function useCountdown(end: () => number, options: Options = {}): CountDownResult {
  if (isNaN(end()) || end() === undefined || end() === null) {
    return {
      timeStamp: 0,
      timeString: '',
      remind: false,
    }
  }
  const refInterval = React.useRef<any>(null)
  const { intervalTime = 1000, start = (): number => (new Date().getTime() / 1000) | 1, onEnd } = options

  const [timeLeft, setTimeLeft] = useState<CountDownResult>(() => {
    let timeStamp = end() - start()
    return {
      timeStamp,
      timeString: getTimeStringFromStamp(timeStamp, options),
      remind: false,
    }
  })

  useEffect(() => {
    if (end() - start() > 0) {
      refInterval.current = setInterval(() => {
        setTimeLeft(({ timeStamp }) => {
          if (timeStamp <= 0) {
            if (refInterval.current) {
              clearInterval(refInterval.current)
            }
            onEnd?.()
            return { timeStamp: 0, timeString: '00:00:00' }
          }
          let distance = timeStamp - 1

          return {
            timeStamp: distance,
            remind: options.remindAfter ? distance - options.remindAfter < 0 : false,
            timeString: getTimeStringFromStamp(distance, options),
          }
        })
      }, intervalTime)
    }

    return () => {
      if (refInterval.current) {
        clearInterval(refInterval.current)
      }
    }
  }, [end()])

  if (isNaN(end()) || end() === undefined || end() === null) {
    return {
      timeStamp: 0,
      timeString: '',
      remind: false,
    }
  }

  return timeLeft
}

export default useCountdown
