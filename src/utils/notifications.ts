import { LocalNotifications } from '@capacitor/local-notifications';
import { BillPaymentRecord, MandatoryBill } from '../types/finance';
import { getBillPaymentForMonth } from './calculations';
import { formatRupiah, getCurrentMonthKey, getDueDateForMonth } from './format';
import { isNativeApp } from './platform';

export interface NotificationSyncStatus {
  supported: boolean;
  granted: boolean;
  scheduledCount: number;
}

function billIdToNotificationId(billId: string): number {
  let hash = 0;
  for (let i = 0; i < billId.length; i++) {
    hash = (hash * 31 + billId.charCodeAt(i)) % 200000000;
  }
  return Math.abs(hash) + 1000;
}

/**
 * Menjadwalkan pengingat lokal Android H-7 jam 09:00 waktu lokal untuk setiap tagihan wajib.
 * - Jika tagihan sudah LUNAS di bulan ini, batalkan jadwal bulan ini dan jadwalkan untuk bulan depan.
 * - Jika H-7 bulan ini sudah lewat, jadwalkan untuk bulan depan.
 * - Di Mode Preview Web, fungsi ini aman tidak melempar error.
 */
export async function syncBillReminders(
  bills: MandatoryBill[],
  billPayments: BillPaymentRecord[],
): Promise<NotificationSyncStatus> {
  if (!isNativeApp()) {
    return { supported: false, granted: false, scheduledCount: 0 };
  }

  try {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions();
    }
    if (perm.display !== 'granted') {
      return { supported: true, granted: false, scheduledCount: 0 };
    }

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }

    const now = new Date();
    const currentMonthKey = getCurrentMonthKey(now);
    const toSchedule = [];

    for (const bill of bills) {
      const isPaidThisMonth = Boolean(
        getBillPaymentForMonth(bill.id, currentMonthKey, billPayments),
      );

      let targetYear = now.getFullYear();
      let targetMonth = now.getMonth();

      if (isPaidThisMonth) {
        targetMonth += 1;
        if (targetMonth > 11) {
          targetMonth = 0;
          targetYear += 1;
        }
      }

      let dueDate = getDueDateForMonth(targetYear, targetMonth, bill.dueDay);
      let reminderDate = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      reminderDate.setHours(9, 0, 0, 0);

      if (reminderDate.getTime() <= now.getTime()) {
        targetMonth += 1;
        if (targetMonth > 11) {
          targetMonth = 0;
          targetYear += 1;
        }
        dueDate = getDueDateForMonth(targetYear, targetMonth, bill.dueDay);
        reminderDate = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        reminderDate.setHours(9, 0, 0, 0);
      }

      toSchedule.push({
        id: billIdToNotificationId(bill.id),
        title: `Pengingat Tagihan: ${bill.name}`,
        body: `Jatuh tempo 7 hari lagi (${formatRupiah(bill.amount)}). Yuk siapkan dananya di Catatan Dompet.`,
        schedule: {
          at: reminderDate,
          allowWhileIdle: true,
        },
      });
    }

    if (toSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: toSchedule });
    }

    return {
      supported: true,
      granted: true,
      scheduledCount: toSchedule.length,
    };
  } catch {
    return { supported: true, granted: false, scheduledCount: 0 };
  }
}
