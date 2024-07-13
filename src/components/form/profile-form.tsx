'use client'

import Image from 'next/image'
import { User } from 'next-auth'
import { useForm } from 'react-hook-form'
import { useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'

import { ProfileSchemaType, profileSchema } from '@/lib/schema-validations/profile.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { UploadIcon } from 'lucide-react'

export default function ProfileForm({ user }: { user: User }) {
  const [file, setFile] = useState<File | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileSchemaType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      image: user.image || undefined,
      name: user.name || undefined,
      password: '',
      newPassword: '',
      isTwoFactorEnabled: false,
    },
  })

  const image = form.watch('image')

  const previewImage = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return image
  }, [file, image])

  function onSubmit(values: ProfileSchemaType) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar */}
        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem className="flex flex-col items-center gap-1">
              <Avatar className="size-20">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt={user.name || 'User avatar'}
                    width={80}
                    height={80}
                    className="relative flex size-full shrink-0 overflow-hidden"
                    priority
                  />
                ) : (
                  <AvatarFallback className="text-2xl font-semibold">
                    {user.name
                      ? user.name.slice(0, 2).toLocaleUpperCase()
                      : user.email?.slice(0, 2).toLocaleUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <Input
                placeholder="Upload image"
                type="file"
                accept="image/*"
                className="hidden"
                ref={imageInputRef}
                onChange={(ev) => {
                  const file = ev.target.files?.[0]
                  file && setFile(file)
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="gap-1.5"
                onClick={() => imageInputRef.current?.click()}
              >
                <UploadIcon className="size-4" />
                <span>{previewImage ? 'Change image' : 'Upload image'}</span>
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <div className="flex items-center gap-4">
                {!form.getValues('image') && (
                  <div className="font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                {form.getValues('image') && (
                  <Image
                    src={form.getValues('image')!}
                    width={42}
                    height={42}
                    className="rounded-full"
                    alt="User Image"
                  />
                )}
                <UploadButton
                  className="ut-button:ring-primary ut-label:bg-red-50  ut-button:bg-primary/75  hover:ut-button:bg-primary/100  ut:button:transition-all ut-button:duration-500 ut-label:hidden  ut-allowed-content:hidden scale-75"
                  endpoint="avatarUploader"
                  onUploadBegin={() => {
                    setAvatarUploading(true)
                  }}
                  onUploadError={(error) => {
                    form.setError('image', {
                      type: 'validate',
                      message: error.message,
                    })
                    setAvatarUploading(false)
                  }}
                  onClientUploadComplete={(res) => {
                    form.setValue('image', res[0].url!)
                    setAvatarUploading(false)
                  }}
                  content={{
                    button({ ready }) {
                      if (ready) return <div>Change Avatar</div>
                      return <div>Uploading...</div>
                    },
                  }}
                />
              </div>
              <FormControl>
                <Input placeholder="User Image" type="hidden" disabled={status === 'executing'} {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Bruch Wayne" type="text" autoComplete="name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} placeholder="*********" type="password" autoComplete="current-password" />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* New password */}
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input {...field} placeholder="*********" type="password" autoComplete="new-password" />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Two Factor Enabled */}
        <FormField
          control={form.control}
          name="isTwoFactorEnabled"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormLabel>Two factor authentication</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormDescription>Enable two factor authentication for your account</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  )
}
