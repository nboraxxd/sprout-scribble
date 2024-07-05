'use server'

import { db } from '@/server'
import { posts } from '@/server/schema'
import { revalidatePath } from 'next/cache'

export async function getPosts() {
  const posts = await db.query.posts.findMany()

  if (!posts) {
    throw new Error('Get posts failed')
  }

  return {
    message: 'Get posts success',
    data: posts,
  }
}

export async function createPost(formData: FormData) {
  const title = formData.get('title')?.toString()

  if (!title) {
    throw new Error('Title is required')
  }

  const post = await db.insert(posts).values({ title })

  revalidatePath('/')
  return {
    message: 'Create post success',
    data: post,
  }
}
