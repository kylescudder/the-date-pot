'use server'
//app/page.tsx
import { getUserInfo } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

async function Page() {
  const user = await currentUser()
  if (!user) return null

  const userInfo = await getUserInfo(user.id)

  if (!userInfo?.onboarded) redirect('/onboarding')

  return <div className='h-screen'></div>
}

export default Page
