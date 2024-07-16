'use client'

import Image from 'next/image'
import omitBy from 'lodash/omitBy'
import isUndefined from 'lodash/isUndefined'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { LoaderCircleIcon, UploadIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { zodResolver } from '@hookform/resolvers/zod'

import { ExtendUser } from '@root/next-auth'
import { useUploadThing } from '@/utils/uploadthing'
import { useSessionData } from '@/hooks/useSessionData'
import { updateProfile } from '@/server/actions/user.action'
import { UpdateProfileSchemaType, updateProfileSchema } from '@/lib/schema-validations/profile.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormMessages } from '@/components/form'
import { UploadThingError } from 'uploadthing/server'

export default function UpdateProfileForm({ user }: { user: ExtendUser }) {
  const [errorMessage, setErrorMessage] = useState('')

  const [file, setFile] = useState<File | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const { isUploading, startUpload } = useUploadThing('imageUploader', {
    onUploadError: (error) => {
      throw error
    },
  })

  const { update: updateSession } = useSessionData()
  const { status, executeAsync } = useAction(updateProfile)

  const form = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name ?? '',
      image: user.image ?? undefined,
      password: undefined,
      newPassword: undefined,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      oAuthPassword: undefined,
    },
  })

  const image = form.watch('image')

  const previewImage = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return image
  }, [file, image])

  useEffect(() => {
    if (status === 'executing') {
      setErrorMessage('')
    }
  }, [status])

  useEffect(() => {
    form.reset({
      name: user.name ?? '',
      image: user.image ?? undefined,
      password: undefined,
      newPassword: undefined,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      oAuthPassword: undefined,
    })
  }, [form, user.image, user.isTwoFactorEnabled, user.name])

  async function onSubmit(values: UpdateProfileSchemaType) {
    if (status === 'executing') return

    const changes = omitBy(
      {
        name: user.name !== values.name ? values.name : undefined,
        image: user.image !== values.image ? values.image : undefined,
        password: values.password,
        newPassword: values.newPassword,
        isTwoFactorEnabled:
          user.isTwoFactorEnabled !== values.isTwoFactorEnabled ? values.isTwoFactorEnabled : undefined,
        oAuthPassword: values.oAuthPassword,
      },
      isUndefined
    )

    if (Object.keys(changes).length === 0 && !file) {
      toast.info('No changes detected')
      return
    }

    toast.promise(
      async () => {
        const body = { ...values }

        if (file) {
          const uploadImageResponse = await startUpload([file])
          if (uploadImageResponse) body.image = uploadImageResponse[0].url
        }

        return executeAsync(body)
      },
      {
        loading: 'Saving changes...',
        success: async (response) => {
          if (response?.data?.success === true) {
            setFile(null)

            await updateSession()
            return response.data.message
          } else if (response?.data?.success === false) {
            setErrorMessage(response.data.message)
            toast.dismiss()
          }
        },
        error: (error) => {
          if (error instanceof UploadThingError) {
            form.setError('image', { message: error.message })
          } else {
            setErrorMessage(error.message)
          }
          return toast.dismiss()
        },
      }
    )
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
              <FormDescription>Maxium image size: 2MB</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {user.hasPassword ? (
          <>
            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      onChange={(ev) => {
                        field.onChange(ev.target.value !== '' ? ev.target.value : undefined)

                        ev.target.value === '' && form.trigger('newPassword')
                      }}
                      placeholder="*********"
                      type="password"
                      autoComplete="current-password"
                    />
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
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      onChange={(ev) => {
                        field.onChange(ev.target.value !== '' ? ev.target.value : undefined)
                        ev.target.value === '' && form.trigger('password')
                      }}
                      placeholder="*********"
                      type="password"
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : null}

        {/* OAuth password */}
        {user.isOAuth && !user.hasPassword ? (
          <FormField
            control={form.control}
            name="oAuthPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Set password</FormLabel>
                <FormDescription>
                  Set a password to use with your account. You can use this password to login.
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    onChange={(ev) => field.onChange(ev.target.value !== '' ? ev.target.value : undefined)}
                    placeholder="*********"
                    type="password"
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        {/* Two Factor Enabled */}
        <FormField
          control={form.control}
          name="isTwoFactorEnabled"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormLabel>Two factor authentication</FormLabel>
                <FormControl>
                  <Switch
                    checked={user.hasPassword ? field.value : undefined}
                    onCheckedChange={user.hasPassword ? field.onChange : undefined}
                    disabled={!user.hasPassword}
                  />
                </FormControl>
              </div>
              <FormDescription>
                {user.hasPassword
                  ? `${user.isTwoFactorEnabled ? 'Disable' : 'Enable'} two factor authentication for your account.`
                  : 'Two factor authentication is only available for accounts with password.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Messages */}
        <FormMessages errorMessage={errorMessage} />

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" className="gap-1.5" disabled={status === 'executing' || isUploading}>
            {status === 'executing' || isUploading ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
            {isUploading ? 'Uploading image...' : status === 'executing' ? 'Updating profile...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
