/**
 * سكريبت ترحيل البيانات من SQLite إلى PostgreSQL
 * الاستخدام:
 *   1. تأكد أن DATABASE_URL في .env يشير لـ PostgreSQL (Supabase)
 *   2. تأكد أن SQLITE_URL يشير للملف المحلي
 *   3. شغّل: npx ts-node prisma/migrate-to-postgres.ts
 */

import { PrismaClient as PgClient } from '@prisma/client';
// @ts-ignore
import Database from 'better-sqlite3';
import path from 'path';

const pg = new PgClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

const sqlitePath = path.join(__dirname, 'dev.db');
const sqlite = new Database(sqlitePath, { readonly: true });

async function migrate() {
  console.log('🚀 بدء الترحيل من SQLite إلى PostgreSQL...\n');

  try {
    // 1. Users
    const users = sqlite.prepare('SELECT * FROM User').all() as any[];
    console.log(`👥 ترحيل ${users.length} مستخدم...`);
    for (const u of users) {
      await pg.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          id: u.id,
          email: u.email,
          password: u.password,
          name: u.name,
          role: u.role || 'MEMBER',
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        }
      });
    }
    console.log('  ✅ تم\n');

    // 2. Projects
    const projects = sqlite.prepare('SELECT * FROM Project').all() as any[];
    console.log(`🏗️ ترحيل ${projects.length} مشروع...`);
    for (const p of projects) {
      await pg.project.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          name: p.name,
          location: p.location,
          description: p.description,
          status: p.status || 'UNDER_STUDY',
          totalValue: p.totalValue || 0,
          reservationFee: p.reservationFee || 0,
          installmentValue: p.installmentValue || 0,
          installmentsCount: p.installmentsCount || 0,
          reservationCode: p.reservationCode,
          phaseNumber: p.phaseNumber,
          neighborhood: p.neighborhood,
          plotArea: p.plotArea,
          pricePerMeter: p.pricePerMeter,
          reservationType: p.reservationType,
          bookingAccount: p.bookingAccount,
          exchangeRate: p.exchangeRate || 3.75,
          startDate: p.startDate ? new Date(p.startDate) : null,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }
      });
    }
    console.log('  ✅ تم\n');

    // 3. ProjectParticipation
    const parts = sqlite.prepare('SELECT * FROM ProjectParticipation').all() as any[];
    console.log(`🤝 ترحيل ${parts.length} مشاركة...`);
    for (const part of parts) {
      await pg.projectParticipation.upsert({
        where: { projectId_userId: { projectId: part.projectId, userId: part.userId } },
        update: {},
        create: {
          id: part.id,
          projectId: part.projectId,
          userId: part.userId,
          shareAmount: part.shareAmount || 0,
          percentage: part.percentage,
        }
      });
    }
    console.log('  ✅ تم\n');

    // 4. Transactions
    const txns = sqlite.prepare('SELECT * FROM "Transaction"').all() as any[];
    console.log(`💳 ترحيل ${txns.length} معاملة مالية...`);
    for (const t of txns) {
      try {
        await pg.transaction.upsert({
          where: { id: t.id },
          update: {},
          create: {
            id: t.id,
            projectId: t.projectId,
            userId: t.userId,
            type: t.type || 'AUTHORITY_PAYMENT',
            amount: t.amount || 0,
            officialAmount: t.officialAmount || 0,
            date: new Date(t.date),
            purpose: t.purpose || '',
            attachmentUrl: t.attachmentUrl,
            sharedExpense: Boolean(t.sharedExpense),
            egpRate: t.egpRate,
            createdAt: new Date(t.createdAt),
          }
        });
      } catch (e: any) {
        console.warn(`  ⚠️ تخطي معاملة ${t.id}: ${e.message}`);
      }
    }
    console.log('  ✅ تم\n');

    // 5. Obligations
    const obls = sqlite.prepare('SELECT * FROM Obligation').all() as any[];
    console.log(`📋 ترحيل ${obls.length} التزام...`);
    for (const o of obls) {
      await pg.obligation.upsert({
        where: { id: o.id },
        update: {},
        create: {
          id: o.id,
          projectId: o.projectId,
          type: o.type,
          title: o.title,
          amount: o.amount,
          dueDate: new Date(o.dueDate),
          status: o.status || 'PENDING',
          createdAt: new Date(o.createdAt),
        }
      });
    }
    console.log('  ✅ تم\n');

    // 6. Documents
    const docs = sqlite.prepare('SELECT * FROM Document').all() as any[];
    console.log(`📄 ترحيل ${docs.length} مستند...`);
    for (const d of docs) {
      await pg.document.upsert({
        where: { id: d.id },
        update: {},
        create: {
          id: d.id,
          projectId: d.projectId,
          phaseId: d.phaseId,
          name: d.name,
          type: d.type,
          url: d.url,
          version: d.version || 1,
          isCurrent: Boolean(d.isCurrent !== 0),
          tag: d.tag,
          createdAt: new Date(d.createdAt),
        }
      });
    }
    console.log('  ✅ تم\n');

    // 7. Activity Logs
    const logs = sqlite.prepare('SELECT * FROM ActivityLog').all() as any[];
    console.log(`📝 ترحيل ${logs.length} سجل نشاط...`);
    for (const l of logs) {
      await pg.activityLog.upsert({
        where: { id: l.id },
        update: {},
        create: {
          id: l.id,
          userId: l.userId,
          action: l.action,
          details: l.details,
          timestamp: new Date(l.timestamp),
        }
      });
    }
    console.log('  ✅ تم\n');

    console.log('🎉 اكتمل الترحيل بنجاح!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  المستخدمون:     ${users.length}`);
    console.log(`  المشاريع:       ${projects.length}`);
    console.log(`  المشاركات:      ${parts.length}`);
    console.log(`  المعاملات:      ${txns.length}`);
    console.log(`  الالتزامات:     ${obls.length}`);
    console.log(`  المستندات:      ${docs.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error: any) {
    console.error('❌ خطأ في الترحيل:', error.message);
    throw error;
  } finally {
    await pg.$disconnect();
    sqlite.close();
  }
}

migrate();
