import { NextRequest, NextResponse } from 'next/server'
import { getCookie, setCookie } from '~/utils/cookies'
import { getAppDeviceId, getValueFromReqHeaders, getWeeeSessionTokenFromHeaders, isSayweeeApp } from '~/utils/req-headers'
import * as jose from 'jose'
import { callApi } from '~/utils/axios'

async function generateSessionToken(request: NextRequest): Promise<string> {
  const authToken =
    getValueFromReqHeaders(request, 'weee-token') ||
    getValueFromReqHeaders(request, 'preorder_token') ||
    getValueFromReqHeaders(request, 'weee_token')
  if (authToken) {
    try {
      let info = jose.decodeJwt(authToken) || {}
      let expireTime = info.exp || 0
      const time = new Date().getTime() / 1000
      const isExpired = expireTime < time
      if (!isExpired) {
        // noHeadersAttrs = [];
      }
    } catch (error) {}
  }
  const url = request.url.replace(/^(\/)?(zht|zh|en|es|ko|ja|vi)?/, '')
  const source = new URL(url).searchParams.get('source') || ''
  return callApi(`/ec/tracking/session_id?source=${source}&url=${encodeURIComponent(url)}`, {
    method: 'GET',
  }).then((data) => {
    const { weee_session_token } = data
    return weee_session_token
  })
}

export default async function sessionTokenMiddware(request: NextRequest, response: NextResponse) {
  const token = request.headers.get('x-session-token')
  if (token) {
    response.headers.set('x-session-token', token)
  } else {
    response.headers.set('x-session-token', '123456789')
  }
  //app访问时，设置设备id到cookie
  const deviceId = getAppDeviceId(request)
  if (deviceId) {
    setCookie('deviceId', deviceId, response)
  }
  //检查weee_session_token是否存在，不存在则设置
  let sessionToken = getWeeeSessionTokenFromHeaders(request) || getCookie('weee_session_token', request)
  const bCookie = getCookie('b_cookie', request)
  const isApp = isSayweeeApp(request)
  const source = new URL(request.url).searchParams.get('source') || ''
  if (!sessionToken || (!isApp && source)) {
    sessionToken = await generateSessionToken(request)
  }
  setCookie('weee_session_token', sessionToken as string, response)
  if (!bCookie) {
    setCookie('b_cookie', sessionToken as string, response)
  }
  if (source && !isApp) {
    //
  }
  return {
    deviceId,
    sessionToken,
    bCookie,
  }
}
