import AccountProfile from '@/components/forms/AccountProfile'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import { redirect } from 'next/navigation'
import Logout from '@/components/shared/Logout'
import { getUserInfo } from '@/lib/actions/user.actions'
import { User } from '@/server/db/schema'
import { Users } from '@/lib/models/users'

export default async function page() {
  const user = await currentUser()
  if (!user) return null

  const userInfo: User | undefined = await getUserInfo(user.id)
  if (!userInfo) return null // Add this line

  if (userInfo.onboarded) redirect('/')

  const userData: Users = {
    clerkId: user.id,
    id: userInfo.id, // Now you can safely access the properties
    username: userInfo.username ?? user.emailAddresses[0]!.emailAddress,
    name: userInfo.name ?? user.firstName,
    bio: userInfo.bio ?? '',
    image: user.imageUrl,
    onboarded: userInfo.onboarded ?? false
  }
  return (
    <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
      <div className='flex justify-between'>
        <h1 className='head-text text-3xl leading-6 font-bold'>Onboarding</h1>
        <Logout />
      </div>
      <p className='mt-3 text-base leading-6 font-normal'>
        Complete your profile now to use the Date Pot
      </p>
      <section className='mt-9 p-10'>
        <AccountProfile user={userData} btnTitle='Continue' />
      </section>
    </main>
  )
}
