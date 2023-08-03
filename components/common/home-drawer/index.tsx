'use client'
import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'
import useLazy from '~/hooks/useLazyDynamic'

const CommonDrawerDynamic = dynamic(() => import('./drawer'), { ssr: false })

type CommonDrawer = {
  [key: string]: any
  children?: React.ReactNode
}
export default forwardRef(function CommonDrawer(props: CommonDrawer, ref) {
  const { show, hide, visible, loaded } = useLazy()
  useImperativeHandle(ref, () => {
    return {
      show,
    }
  })

  if (!loaded) return null

  return <CommonDrawerDynamic {...props} visible={visible} show={show} onCancel={hide} />
})
