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
import { useSessionData } from '@/hooks/useSessionData'
import { updateProfile } from '@/server/actions/user.action'
import { UpdateProfileSchemaType, updateProfileSchema } from '@/lib/schema-validations/profile.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormMessages } from '@/components/form'

export default function UpdateProfileForm({ user }: { user: ExtendUser }) {
  const [errorMessage, setErrorMessage] = useState('')

  const [file, setFile] = useState<File | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

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

    toast.promise(executeAsync(values), {
      loading: 'Saving changes...',
      success: async (response) => {
        if (response?.data?.success === true) {
          form.resetField('password')
          form.resetField('newPassword')
          form.resetField('oAuthPassword')

          await updateSession()
          return response.data.message
        } else if (response?.data?.success === false) {
          setErrorMessage(response.data.message)
          toast.dismiss()
        }
      },
      error: (error) => {
        setErrorMessage(error.message)
        return toast.dismiss()
      },
    })
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
          <Button type="submit" className="gap-1.5" disabled={status === 'executing'}>
            {status === 'executing' ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
