'use client'
import React, { useEffect, useRef, useState } from 'react'

import { WeeeIcon } from '~/components/common/icon'
// import useDebounce from '@/hooks/debounce';
// import { ProductType } from '~/components/common/product-card/types';
// import { CartItemV2 } from '@/types/so';
import dynamic from 'next/dynamic'
import { twMerge } from 'tailwind-merge'
// const DynamicPantryTooltip = dynamic(() => import('@/components/pantry/PantryToolTip'), { ssr: false });
// const DynamicAlcoholTooltip = dynamic(() => import('@/components/alcohol/AlcoholTooltip'), { ssr: false });

export interface CartbtnProp {
  num?: number
  subtractCount: (e: React.SyntheticEvent) => any
  addCount: (e: React.SyntheticEvent, cb: (num: number) => void) => any
  max?: number
  min?: number
  renderCartCountText?: boolean
  className?: string
  text?: string
  minLimitArrowToTarget?: number
  preSell?: boolean
  is_pantry?: boolean
  isAlcohol?: boolean
  isInProductCard?: boolean
  link?: string
  data?: any
  showTooltip?: boolean
  showProductGrouping?: () => void
  defaultExpand?: boolean
}

const tooltipTextCls = 'enki-utility-xs text-surface-5-fg-default-idle w-max leading-3'
const tooltipTextIsInPdpCls = 'right-3 bottom-[60px]'
const tooltipCls = 'flex justify-center rounded-1 w-auto absolute right-0 bg-surface-5-bg-idle py-1 px-1.5'
const trangle = (
  <i className="absolute w-0 h-0 border-t-surface-5-bg-idle right-1.5 -bottom-3 border-solid border-8 border-b-transparent border-l-transparent border-r-transparent"></i>
)

export default function Cartbtn({
  num = 0,
  subtractCount,
  addCount,
  renderCartCountText,
  max = 0,
  min = 0,
  className,
  text,
  preSell,
  is_pantry,
  isAlcohol,
  link,
  isInProductCard = false,
  defaultExpand = false,
  showProductGrouping,
}: CartbtnProp) {
  // const { t, lang } = useTranslation('common');
  const addBtnRef = useRef(null)
  const [maxQuntityTip, setMaxQuntityTip] = useState(false)
  const [minQuntityTip, setMinQuntityTip] = useState(false)
  const [pantryTityTip, setPantryTityTip] = useState(false)
  const [pantryTityTipInit, setPantryTityTipInit] = useState(false)
  const [alcoholTip, setAlcoholTip] = useState(false)
  const [alcoholTipInit, setAlcoholTipInit] = useState(false)
  const [isHandleAdd, setIsHandleAdd] = useState(false)
  const [innerFocus, setInnerFocus] = useState<boolean>(defaultExpand ? true : false)
  const [animationName, setAnimation] = useState<'left' | 'right' | ''>(defaultExpand ? 'left' : '')
  const refAnimation = useRef(defaultExpand ? 'left' : '')
  const [animationRightEnd, setAnimationRightEnd] = useState(defaultExpand ? false : true)
  const wrapperRef = useRef<any>()
  const toolTipRef = useRef(null)
  const handleAlcoholTip = () => {
    return new Promise((resolve, reject) => {
      if (!!isAlcohol && !localStorage?.getItem('showedAlcoholTooltip')) {
        if (!alcoholTipInit && isHandleAdd) {
          if (num >= 1 && num != max && (min === 1 || num != min)) {
            resolve(true)
          } else {
            setAlcoholTip(false)
          }
        }
        if (num === 0) {
          try {
            if (!localStorage?.getItem('showedAlcoholTooltip')) {
              setAlcoholTipInit(false)
            }
          } catch (error) {}
          setAlcoholTip(false)
        }
      }
      resolve(false)
    })
  }

  const handlePantryTip = () => {
    return new Promise((resolve, reject) => {
      if (is_pantry && !localStorage?.getItem('showedPantryTooltip')) {
        if (!pantryTityTipInit && isHandleAdd) {
          if (num >= 1 && num != max && (min === 1 || num != min)) {
            resolve(true)
          } else {
            setPantryTityTip(false)
          }
        }
        if (num === 0) {
          try {
            if (!localStorage?.getItem('showedPantryTooltip')) {
              setPantryTityTipInit(false)
            }
          } catch (error) {}
          setPantryTityTip(false)
        }
      }
      resolve(false)
    })
  }

  useEffect(() => {
    async function compareTwoTip() {
      const [showAlcoholTip, showPantryTip] = await Promise.all([handleAlcoholTip(), handlePantryTip()])

      if (showAlcoholTip) {
        setAlcoholTipInit(true)
        return
      }
      if (showPantryTip) {
        setPantryTityTipInit(true)
        return
      }
    }
    compareTwoTip()
  }, [num])

  const handleAddCount = (e) => {
    if (preSell) {
      if (!!link) {
        window.location.href = link
      }
      return
    }
    if (+num === 0 && showProductGrouping) {
      showProductGrouping()
      return
    }
    //加购是如果数量是0,直接加购, 否则先展开加购按钮
    if (num !== 0 && !innerFocus) {
      startToLeft(e)
      return
    } else {
      startToLeft(e)
    }
    if (+max !== +num) {
      if (addCount) {
        addCount(e, (curNum) => {
          setIsHandleAdd(true)
          checkMaxLimit(curNum)
          checkMinLimit(curNum)
        })
      }
    } else {
      checkMaxLimit(max)
    }
  }

  const handleSubtractCount = (e) => {
    setMaxQuntityTip(false)
    setMinQuntityTip(false)
    subtractCount && subtractCount(e)
    if (num <= min || num - 1 <= 0) {
      startToRight()
    }
  }

  const checkMaxLimit = (curNum: number) => {
    if (+max === +curNum) {
      // clearTimeout(toolTipRef.current);
      setMaxQuntityTip(true)
      // toolTipRef.current = setTimeout(() => {
      //   setMaxQuntityTip(false);
      // }, 2000);
    } else {
      setMaxQuntityTip(false)
    }
  }

  const checkMinLimit = (curNum: number) => {
    if (+min === +curNum && min > 1 && max !== min) {
      // clearTimeout(toolTipRef.current);
      setMinQuntityTip(true)
      // toolTipRef.current = setTimeout(() => {
      //   setMinQuntityTip(false);
      // }, 2000);
    } else {
      setMinQuntityTip(false)
    }
  }

  useEffect(() => {
    if (alcoholTipInit) {
      setAlcoholTip(true)
      localStorage?.setItem('showedAlcoholTooltip', '1')
      const timer = setTimeout(() => {
        setAlcoholTip(false)
      }, 2000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [alcoholTipInit])

  useEffect(() => {
    if (pantryTityTipInit) {
      setPantryTityTip(true)
      setAlcoholTip(false)
      localStorage?.setItem('showedPantryTooltip', '1')
      const timer = setTimeout(() => {
        setPantryTityTip(false)
      }, 2000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [pantryTityTipInit])

  /**inner模式下点击外部收起加购按钮 */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef && !wrapperRef.current?.contains(e.target)) {
        if (refAnimation.current === 'left') {
          startToRight()
        }
        setMaxQuntityTip(false)
        setMinQuntityTip(false)
      }
    }
    if (isInProductCard) {
      document.addEventListener('click', handleClickOutside, true)
      document.addEventListener('scroll', handleClickOutside, true)
    }
    return () => {
      if (isInProductCard) {
        document.removeEventListener('click', handleClickOutside, true)
        document.removeEventListener('scroll', handleClickOutside, true)
      }
    }
  }, [])

  const substractBtn =
    +num === +min || +num === 0 ? (
      <WeeeIcon
        className="leading-[34px] h-[34px] w-[34px] font-normal text-center"
        type={isInProductCard ? 'icontrash_fill' : 'icondelete'}
        style={{ fontSize: 16 }}
        role="addButtonTrasbin"
      />
    ) : (
      <WeeeIcon className="leading-[34px] h-[34px] w-[34px]" type="iconcolor-minus" style={{ fontSize: 22 }} role="addButtonMinusIcon" />
    )

  const minTipElement = minQuntityTip ? (
    <div className={twMerge(tooltipCls, isInProductCard && 'bottom-[42px]', !isInProductCard && tooltipTextIsInPdpCls)} role="tooltipBox">
      {trangle}
      <span className={tooltipTextCls} role="tooltipText">
        {/* {t('min_order_quantity_limit', { count: min })} */}
        最小限购{min}件
      </span>
    </div>
  ) : null

  const maxTipElement = maxQuntityTip ? (
    <div className={twMerge(tooltipCls, isInProductCard && 'bottom-[42px]', !isInProductCard && tooltipTextIsInPdpCls)} role="tooltipBox">
      {trangle}
      <span className={tooltipTextCls} role="tooltipText">
        {/* {t('max_order_quantity_limit', { count: max })} */}
        最大限购{max}件
      </span>
    </div>
  ) : null

  const btnBoxElement = (
    <div
      className={twMerge(
        'flex justify-between items-center rounded-4 z-20',
        animationRightEnd && 'invisible',
        animationName === '' && 'w-[34px]',
        animationName === 'left' && 'addCartToLeft',
        animationName === 'right' && 'addCartToRight',
      )}
      role="addButtonBox"
    >
      <div
        onClick={handleSubtractCount}
        className={twMerge(
          'text-black font-normal w-[34px] h-[34px] rounded-full text-center flex items-center justify-center cursor-pointer',
          animationName === 'left' && 'rotateLeft',
          animationName === 'right' && 'rotateRight',
        )}
        role="minusButton"
      >
        {substractBtn}
      </div>
    </div>
  )

  const startToRight = () => {
    setInnerFocus(false)
    refAnimation.current = 'right'
    setAnimation('right')
    const timer = setTimeout(() => {
      setAnimationRightEnd(true)
      clearTimeout(timer)
    }, 200)
  }

  const startToLeft = (e) => {
    setInnerFocus(true)
    refAnimation.current = 'left'
    setAnimation('left')
    setAnimationRightEnd(false)
  }

  const renderAddCartBtnByText = () => {
    //外部传入了文本
    if (text) {
      if (+num > 0) {
        return (
          <div role="current-qty" className="relative flex justify-between items-center px-0 h-full">
            <div onClick={handleSubtractCount} className="rounded-full flex items-center justify-center text-white">
              {substractBtn}
            </div>
            <span className="text-white">{renderCartCountText ? `加购${num}` : num}</span>
            <div className="rounded-full flex items-center justify-center">
              <WeeeIcon
                onClick={handleAddCount}
                type="iconcolor-plus"
                style={{ fontSize: 22 }}
                className={twMerge('text-[18px] font-normal text-center', +num === +max && 'text-[#b2b2b2]', +num !== +max && 'text-white')}
                role="addButtonPlusIcon"
              />
            </div>
          </div>
        )
      }
      return (
        <div className="w-full h-full flex justify-center items-center text-white" onClick={handleAddCount}>
          {text}
        </div>
      )
    }
  }

  const renderAddCartBtn = () => {
    const disabled = +max === +num || preSell
    //通用产品卡片加购按钮
    return (
      <div
        ref={addBtnRef}
        onClick={handleAddCount}
        className={twMerge(
          'w-[34px] h-[34px] rounded-full flex justify-center items-center shrink-0 relative z-[2]',
          disabled && 'cursor-not-allowed text-surface-1-fg-minor-idle',
          !disabled && 'text-black',
          +num > 0 && !innerFocus && 'bg-black',
        )}
        role={`addButton${+max === +num ? ' addButtonDisabled' : ''}`}
      >
        {+num > 0 && !innerFocus ? (
          <span className="text-white enki-numeral-base transition-all">{num}</span>
        ) : (
          <WeeeIcon
            style={{ fontSize: 22 }}
            type="iconcolor-plus"
            className="font-normal leading-[34px] h-[34px] w-[34px] text-center"
            role="addButtonPlusIcon"
          />
        )}
      </div>
    )
  }

  return (
    <div className={className} ref={wrapperRef}>
      {isInProductCard ? (
        <div
          data-count={num}
          className={twMerge(
            'z-[2] absolute right-0 top-0 flex items-center justify-center rounded-full bg-white',
            animationName === '' && 'w-[34px]',
            animationName === 'left' && 'addCartToLeft',
            animationName === 'right' && 'addCartToRight',
            isInProductCard && 'product-card-btn-shadow',
          )}
        >
          {animationName === 'left' && (
            <span className="absolute flex items-center justify-center z-[1] w-full h-full leading-7 text-surface-1-fg-default-idle enki-numeral-base">
              {num}
            </span>
          )}

          {btnBoxElement}
          {minTipElement}
          {maxTipElement}
        </div>
      ) : (
        <>
          {minTipElement}
          {maxTipElement}
        </>
      )}

      {text ? renderAddCartBtnByText() : renderAddCartBtn()}
      {/* 
      {pantryTityTip && <DynamicPantryTooltip visible={pantryTityTip} targetEl={addBtnRef} />}
      {alcoholTip && <DynamicAlcoholTooltip visible={alcoholTip} targetEl={addBtnRef} />} */}
    </div>
  )
}
