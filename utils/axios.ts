import { getCookie } from 'cookies-next'

export const callApi = async (url, options) => {
  const { headers: oHeaders, method, log, ...rest } = options || {}
  const isGetMeghtod = method ? method.toUpperCase() === 'GET' : true
  let finalUrl = `${process.env.NEXT_PUBLIC_API_HOST || process.env.API_HOST}${url}`
  if (isGetMeghtod && options.body) {
    const params = Object.keys(options.body)
      .map((key) => {
        return `${key}=${options.body[key]}`
      })
      .join('&')
    finalUrl += `?${params}`
  }
  const finalOptions = {
    method: method || 'GET',
    headers: {
      ...oHeaders,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 100 },
    ...rest,
  }
  if (isGetMeghtod) {
    delete finalOptions.body
  }
  if (log) {
    console.log(finalUrl, 'finalUrl')
    console.log(finalOptions, 'finalOptions')
  }
  return fetch(finalUrl, finalOptions)
    .then((res) => {
      if (res.status >= 400) {
        return res.json().then((data) => {
          return Promise.reject(data)
        })
      }
      return res.json().then((data) => {
        if (data?.result) {
          return data.object
        }
        {
          console.error(`callApi error url: ${url}`, data)
          return {}
        }
      })
    })
    .catch((e) => {
      console.log(`callApi error url: ${url}`, e)
      return e
    })
}

export const getRequestHeadersInClient = () => {
  const requestHeader = {
    Platform: 'h5',
    'b-cookie': getCookie('b_cookie') || '',
    Authorization: `Bearer ${getCookie('auth_token')}`,
    'weee-session-token': getCookie('weee_session_token') || '',
    'Content-Type': 'application/json',
  }

  return requestHeader
}
