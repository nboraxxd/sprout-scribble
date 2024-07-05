import Button from '@/components/common/button'
import { createPost, getPosts } from '@/server/actions/post.action'

export default async function Homepgae() {
  const response = await getPosts()
  console.log('🔥 ~ Homepgae ~ response:', response)

  return (
    <div>
      <form className="flex max-w-40 flex-col gap-y-3" action={createPost}>
        <input type="text" name="title" placeholder="Title" />
        <Button type="submit">Submit</Button>
      </form>
      <div>
        {response.data.map((post) => (
          <div key={post.id}>{post.title}</div>
        ))}
      </div>
    </div>
  )
}
