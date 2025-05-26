import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';
import firebaseFirestore from '~/config/firebase/firestore/firestore';

export type ActivityType =
  // Transaction types
  | 'transaction_payment'
  | 'transaction_refund'
  // Reservation types
  | 'reservation_create'
  | 'reservation_modify'
  | 'reservation_delete'
  // Settings types
  | 'settings_update'
  // Email template types
  | 'email_template_edit'
  // Form field types
  | 'form_field_add'
  | 'form_field_edit'
  | 'form_field_delete'
  // Schedule types
  | 'open_hours_update'
  | 'block_dates_add'
  | 'block_dates_edit'
  | 'block_dates_delete';

export type ActivityLogType = {
  id?: string;
  activityType: ActivityType;
  entityId?: string; // ID of the reservation, form, etc.
  entityType?: string; // 'reservation', 'form', 'settings', etc.
  userId?: string;
  userEmail?: string;
  companyId?: string;
  locationId?: string;
  timestamp?: Date;
  details?: Record<string, any>;
};

export const useActivityLogs = () => {
  const { user } = useAuth();

  const logActivity = async (
    activity: Omit<ActivityLogType, 'userId' | 'userEmail' | 'timestamp'>
  ) => {
    try {
      const logsCollection = collection(firebaseFirestore, 'activity_logs');

      const activityLog = {
        ...activity,
        companyId: activity.companyId || user?.company?.id,
        userId: user?.uid || null,
        userEmail: user?.email || null,
        timestamp: new Date(),
      };

      const docRef = await addDoc(logsCollection, activityLog);
      console.log(`Activity logged with ID: ${docRef.id}, type: ${activity.activityType}`);
      return docRef.id;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  };

  return { logActivity };
};
