import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Appends an append-only event to organizations/{orgId}/usageEvents. Powers
 * the admin dashboard's "Recent Activity" feed and, in production, would
 * feed a metered billing job. Failures are swallowed (logging) so a usage
 * log write can never take down the request it's logging.
 */
export async function logUsage(input: { orgId: string; uid: string; type: string; route: string }): Promise<void> {
  try {
    await adminDb()
      .collection('organizations')
      .doc(input.orgId)
      .collection('usageEvents')
      .add({
        uid: input.uid,
        type: input.type,
        route: input.route,
        createdAt: FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('logUsage failed', error);
  }
}
