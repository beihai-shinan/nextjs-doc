import { cookies, headers } from 'next/headers'
import Layout from '~/components/layout/simple'
import { PrefertchApiList } from '~/types/common'
import { callApi } from '~/utils/axios'
import HomeHeader from '~/components/biz/home/home-header'

export default async function Home({ params: { lang }, searchParams }) {
  const locale = lang === 'zht' ? 'zh-Hant' : lang
  const headerList = headers()
  const cookiesList = cookies()
  const requestHeader = {
    'User-Agent': headerList.get('user-agent'),
    Platform: headerList.get('platform') || 'h5',
    'b-cookie': cookiesList.get('b_cookie')?.value || '',
    Authorization: `Bearer ${cookiesList.get('auth_token')?.value}`,
    lang: locale,
    'weee-session-token': cookiesList.get('weee_session_token')?.value || '',
    'Content-Type': 'application/json',
  }
  const isShippingOrder = cookiesList.get('is_shipping_order_mobile') || ''
  const zipcode = cookiesList.get('NEW_ZIP_CODE')?.value || ''
  const isLogin = cookiesList.get('IS_LOGIN')?.value === '1' || ''
  const promiseList = [
    callApi(`/ec/item/store/is_select?zipcode=${zipcode}`, {
      method: 'GET',
      headers: requestHeader,
    }),
    callApi(`/ec/content/cms/page/sayweee_mobile_home`, {
      method: 'GET',
      headers: requestHeader,
      body: {
        lang: locale,
        zipcode,
        sales_org_id: 1,
      },
    }),
    callApi(`/ec/customer/account/info`, {
      method: 'GET',
      headers: requestHeader,
    }),
    callApi(`/ec/growth/seo/meta`, {
      method: 'GET',
      headers: requestHeader,
      body: {
        segment1: 'portal',
        segment2: 'index',
        store: (searchParams.get('grocery-store') as string) || '',
      },
    }),
  ]
  const [isSelectStore, homePage, userInfo, seoInfo] = await Promise.all(promiseList)

  return (
    <Layout
      headerWrapClassName="h-[48px]"
      seoInfo={seoInfo}
      header={<HomeHeader simple={userInfo} storeInfo={isSelectStore} />}
      prefetchApiList={[PrefertchApiList.CART]}
    >
      <div className="bg-white relative"></div>
    </Layout>
  )
}
