import { createId } from '@paralleldrive/cuid2'
import type { AdapterAccountType } from 'next-auth/adapters'
import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  boolean,
  pgEnum,
  uniqueIndex,
  serial,
  real,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const RoleEnum = pgEnum('RoleEnum', ['user', 'admin'])

export const users = pgTable(
  'user',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: text('image'),
    password: text('password'),
    isTwoFactorEnabled: boolean('isTwoFactorEnabled').notNull().default(false),
    role: RoleEnum('roles').notNull().default('user'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: uniqueIndex('emailIdx').on(table.email),
  })
)

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
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
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

export const passwordResetTokens = pgTable(
  'passwordResetToken',
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

export const twoFactorCodes = pgTable(
  'twoFactorCode',
  {
    id: text('id')
      .notNull()
      .$defaultFn(() => createId()),
    code: text('code').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
    email: text('email').notNull(),
    ipAddress: text('ipAddress'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (vt) => ({
    compoundKey: primaryKey({
      columns: [vt.id, vt.code, vt.email],
    }),
  })
)

export const products = pgTable(
  'product',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    price: real('price').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIdx: uniqueIndex('slugIdx').on(table.slug),
  })
)

export const productVariants = pgTable('productVariant', {
  id: serial('id').primaryKey(),
  color: text('color').notNull(),
  productType: text('productType').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  productId: serial('productId')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
})

export const variantImages = pgTable('variantImage', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  name: text('name').notNull(),
  size: real('size').notNull(),
  order: real('order').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  variantId: serial('variantId')
    .notNull()
    .references(() => productVariants.id, { onDelete: 'cascade' }),
})

export const variantTags = pgTable('variantTag', {
  id: serial('id').primaryKey(),
  tag: text('tag').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  variantId: serial('variantId')
    .notNull()
    .references(() => productVariants.id, { onDelete: 'cascade' }),
})

export const productRelations = relations(products, ({ many }) => ({
  productVariants: many(productVariants, { relationName: 'productVariants' }),
}))

export const productVariantsRelations = relations(productVariants, ({ many, one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
    relationName: 'productVariants',
  }),
  variantImages: many(variantImages, { relationName: 'variantImages' }),
  variantTags: many(variantTags, { relationName: 'variantTags' }),
}))

export const variantImagesRelations = relations(variantImages, ({ one }) => ({
  productVariants: one(productVariants, {
    fields: [variantImages.variantId],
    references: [productVariants.id],
    relationName: 'variantImages',
  }),
}))

export const variantTagsRelations = relations(variantTags, ({ one }) => ({
  productVariants: one(productVariants, {
    fields: [variantTags.variantId],
    references: [productVariants.id],
    relationName: 'variantTags',
  }),
}))

export type ProductType = typeof products.$inferSelect
