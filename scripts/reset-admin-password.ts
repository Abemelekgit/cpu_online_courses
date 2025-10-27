#!/usr/bin/env tsx
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

async function main() {
  const [, , email, password] = process.argv
  if (!email || !password) {
    console.error('Usage: npx tsx scripts/reset-admin-password.ts <email> <newPassword>')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const hashed = await bcrypt.hash(password, 12)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      await prisma.user.update({ where: { email }, data: { password: hashed, role: 'ADMIN' } })
      console.log(`Updated password for existing user ${email} and set role=ADMIN`)
    } else {
      await prisma.user.create({ data: { email, name: 'Admin', password: hashed, role: 'ADMIN' } })
      console.log(`Created new admin user ${email}`)
    }
  } catch (err) {
    console.error('Error resetting admin password', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
