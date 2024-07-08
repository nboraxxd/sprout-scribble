import { createId } from '@paralleldrive/cuid2'
import type { AdapterAccountType } from 'next-auth/adapters'
import { timestamp, pgTable, text, primaryKey, integer, boolean, pgEnum } from 'drizzle-orm/pg-core'

export const RoleEnum = pgEnum('RoleEnum', ['user', 'admin'])

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: text('password'),
  twoFactorEnabled: boolean('twoFactorEnabled').default(false),
  role: RoleEnum('roles').default('user'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const emailVerificationTokens = pgTable(
  'emailVerificationToken',
  {
    id: text('id')
      .notNull()
      .$defaultFn(() => createId()),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
    email: text('email').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (vt) => ({
    compoundKey: primaryKey({
      columns: [vt.id, vt.token, vt.email],
    }),
  })
)
