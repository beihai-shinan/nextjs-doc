'use client'
import React, { useEffect, useRef, useState } from 'react'
import useCountdown from '~/hooks/useCountDown'
// import useAccount from '@/store/account'
// import { getCommonBarInfo, setCommonBarClose } from '@/api/growth'
import { useRouter } from 'next/navigation'
import { getCookie } from '~/utils/cookie-client'
import { callApi, getRequestHeadersInClient } from '~/utils/axios'

type Props = {
  cookieKey: 'landing_stamp_expires' | 'pdp_landing_stamp_expires'
  showTimeBanner?: boolean
  initialVisible?: boolean
  amount?: number | string
  onClose?: () => void
  searchParams?: Record<string, string>
}

/*
3.28完成 倒计时 & text 版本迭代
countdown = null 无倒计时的模式，固定展示timer banner，只能手动关闭
type=1,2 拿end_time字段
- type = 1 带方块背景色的倒计时模式，倒计时结束自动关闭timer banner
- type = 2 无方块背景普通的文本倒计时，倒计时结束自动关闭timer banner
type=3 拿show_time字段
- type = 3 不显示倒计时，后台自动倒计时10s，倒计时结束自动关闭timer banner
*/
export default function TopCommonPromoBar(props: Props) {
  const { cookieKey, initialVisible = false, searchParams } = props
  const [copyInfo, setCommonBarCopy] = useState<any>()
  const timeStampRef = useRef(0)
  const timeBannerRef = useRef<any>()
  const [visible, visibleSet] = useState<boolean>(initialVisible || true)

  const getData = async () => {
    let postData: {
      referrer_id?: string
      ep_partner?: string
      channel_type?: string
      source?: string
      referral_type?: string
    } = {
      channel_type: (searchParams?.channel_type as string) || '',
      referral_type: searchParams?.referral_type || '',
      source: '',
    }
    const referrer_id = getCookie('referrer_id')?.toString()
    if (referrer_id) {
      postData.referrer_id = referrer_id
    }
    const ep_partner = getCookie('ep_partner')?.toString()
    if (ep_partner) {
      postData.ep_partner = ep_partner
    }
    const res = await callApi(`/ec/growth/bar/info`, {
      method: 'GET',
      headers: getRequestHeadersInClient(),
      body: postData,
    })
    setCommonBarCopy({
      id: 6,
      type: null,
      icon_url: '',
      color: '#111111',
      link: 'https://tb1.sayweee.net/zh/account/login',
      priority: 1,
      bg_color: '#FFF9F1',
      pos: 'top',
      bg_img: '',
      title: {
        sub_text: null,
        text: '<span style=color: #111111;>新人前2单共可享</span><span style=font-weight:bold;color: #111111;>$20</span><span style=color: #111111;>优惠</span>',
      },
      close_cta: {
        icon_url: 'https://img06.weeecdn.com/growth/image/128/827/user_close.png',
        visible: 'true',
        link: '',
      },
      pages: [
        'mweb_home',
        'mweb_onboarding',
        'mweb_product',
        'mweb_search_result',
        'mweb_collection',
        'mweb_bogo',
        'mweb_category',
        'mweb_cart',
        'mweb_me',
        'mweb_login_signup',
        'mweb_phone_connect',
      ],
      countdown: {
        number_bg_color: '#CA3908',
        end_time: 1691471508,
        show_time: -1,
        server_timestamp: 1691471508,
        title: '',
        type: 1,
        number_color: '#FFFFFF',
      },
      right_cta: {
        link: null,
        title: null,
        type: null,
        title_bg_color: null,
      },
    })
  }

  const handleSpecialSet = () => {
    const domTimeBannerHeight = timeBannerRef?.current?.clientHeight
    const stickyTop = 48 + domTimeBannerHeight
    // const domPageSearch = document.querySelector('#sticky-header');
    // if (domPageSearch) {
    //   (domPageSearch as HTMLElement).style.top = `${stickyTop}px`;
    // }
    const domCategory = document.querySelector('#category_filter')
    if (domCategory) {
      ;(domCategory as HTMLElement).style.top = `${stickyTop}px`
    }
  }

  const releaseSpecialSet = () => {
    const domPageSearch = document.querySelector('#sticky-header')
    if (domPageSearch) {
      ;(domPageSearch as HTMLElement).style.top = ``
    }
    const domCategory = document.querySelector('#category_filter')
    if (domCategory) {
      ;(domCategory as HTMLElement).style.top = '48px'
    }
    const domToastContainerCheckout = document.querySelector('#toastContainerCheckout')
    if (domToastContainerCheckout) {
      ;(domToastContainerCheckout as HTMLDivElement).style.top = ``
    }
  }

  const refreshBar = async () => {
    let postData: {
      referrer_id?: string
      ep_partner?: string
      channel_type?: string
      referral_type?: string
    } = {
      referrer_id: '',
      ep_partner: '',
      // channel_type: (query.channel_type as string) || '',
      // referral_type: (query.referral_type as string) || '',
    }
    // const res = await getCommonBarInfo(postData)
    // if (res?.result) {
    // syncCommonBarCopy(res.object)
    // }
  }

  // countdown倒计时结束 || show_time模式自动关闭
  const onAutoClose = () => {
    visibleSet(false)
    releaseSpecialSet()
    refreshBar()
  }
  // 用户主动关闭
  const onClickClose = (e) => {
    e.stopPropagation()
    visibleSet(false)
    releaseSpecialSet()
    window.dispatchEvent(new CustomEvent('new-user-banner-change', { detail: { visible: false } }))
    // setCommonBarClose({ bar_id: copyInfo?.id }).then((res) => {
    //   refreshBar()
    // })
    props?.onClose?.()
  }

  const clickCountDown = () => {
    if (!!copyInfo?.link) {
      window.location.href = copyInfo?.link
    }
  }

  useEffect(() => {
    // if (!commonBarCopy) return
    // if ((commonBarCopy || [])?.length > 0) {
    //   // 接口已返回需要显示页面 & bar信息
    //   const data = commonBarCopy?.[0]
    //   const showPages = data?.pages || []
    //   const curPageKey = 'mweb_product'
    //   if (showPages?.includes(curPageKey)) {
    //     visibleSet(true)
    //     setTimeout(() => {
    //       window.dispatchEvent(new CustomEvent('new-user-banner-change', { detail: { visible: true } }))
    //     }, 30)
    //     setCopyIfo(data)
    //   } else {
    //     visibleSet(false)
    //     if (visible) {
    //       setTimeout(() => {
    //         window.dispatchEvent(new CustomEvent('new-user-banner-change', { detail: { visible: false } }))
    //       }, 30)
    //     }
    //   }
    // } else {
    //   if (visible) {
    //     setTimeout(() => {
    //       window.dispatchEvent(new CustomEvent('new-user-banner-change', { detail: { visible: false } }))
    //     }, 30)
    //   }
    //   visibleSet(false)
    // }
    getData()
  }, [])

  useEffect(() => {
    if (visible) {
      handleSpecialSet()
    }
  }, [visible])

  if (!visible) {
    return null
  }
  return (
    <div
      ref={timeBannerRef}
      id="timeBanner"
      className="min-h-[54px] px-3 flex items-center justify-between bg-surface-1-bg-idle"
      style={{ background: copyInfo?.bg_color, color: copyInfo?.color }}
      onClick={clickCountDown}
    >
      {!!copyInfo?.icon_url && (
        <div className="shrink-0 mr-2">
          <img width={30} src={copyInfo?.icon_url} alt="time icon" />
        </div>
      )}
      {!!copyInfo?.title && (
        <div className="flex-1 mr-2">
          <div className="enki-heading-sm py-1" dangerouslySetInnerHTML={{ __html: copyInfo?.title?.text }} />
          <div className="enki-body-sm" dangerouslySetInnerHTML={{ __html: copyInfo?.title?.sub_text }} />
        </div>
      )}
      {!!copyInfo?.countdown?.type && (
        <CountDownTimer cookieKey={cookieKey} data={copyInfo.countdown} onEnd={onAutoClose} syncTime={() => timeStampRef.current} />
      )}
      {!!copyInfo?.close_cta?.icon_url && (
        <div className="shrink-0 mr-[-8px] py-3 px-2" onClick={onClickClose}>
          <img width={20} src={copyInfo?.close_cta?.icon_url} alt="add icon" />
        </div>
      )}
    </div>
  )
}
interface ICountDownTimerProps extends Pick<Props, 'cookieKey'> {
  data: any
  onEnd: () => void
  syncTime?: (stamp: number) => void
}
function CountDownTimer(props: ICountDownTimerProps) {
  const { cookieKey, data, onEnd, syncTime } = props
  const { number_bg_color, number_color, title, end_time, show_time, type, server_timestamp } = data
  const { timeString, timeStamp } = useCountdown(() => end_time as number, {
    onEnd: () => {
      onEnd()
    },
  })
  // syncTime?.(timeStamp)

  useEffect(() => {
    if (type == 3) {
      // 不显示倒计时后台自动倒计时{show_time}s 结束自动关闭
      let timer = setTimeout(() => {
        onEnd()
      }, show_time || 10000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [type, show_time])

  if (!timeString) return null

  // 带方块背景色倒计时
  if (type == 1) {
    return (
      <div className="flex items-center">
        {!!title && <div className="enki-utility-sm mr-1" dangerouslySetInnerHTML={{ __html: title }} />}
        <div className="flex items-center enki-numeral-xs">
          {timeString.split(':').map((item, index) => {
            return (
              <div key={index}>
                {[item[0], item[1]].map((str, sIndex) => {
                  return (
                    <span
                      key={sIndex}
                      className="inline-block w-[15px] h-[22px] !leading-[22px] text-center ml-0.5 rounded-[5px]"
                      style={{ background: number_bg_color, color: number_color }}
                    >
                      {str || '0'}
                    </span>
                  )
                })}
                {index < timeString.split(':').length - 1 && (
                  <span className="inline-block !leading-[22px] ml-0.5" style={{ color: number_bg_color }}>
                    :
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // 无方块背景普通文本倒计时
  if (type == 2) {
    return (
      <div className="flex items-center">
        {!!title && <div className="enki-utility-sm mr-1" dangerouslySetInnerHTML={{ __html: title }} />}
        <div className="flex items-center enki-numeral-xs min-w-[55px]">
          {timeString.split(':').map((item, index) => {
            return (
              <div key={index} style={{ color: number_color }}>
                {[item[0], item[1]].map((str, sIndex) => {
                  return <span key={sIndex}>{str || '0'}</span>
                })}
                {index < timeString.split(':').length - 1 && <span className="inline-block mx-[1px]">:</span>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
