import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  Select,
  HStack,
} from '@chakra-ui/react';
import { collection, getDocs, orderBy, query, where, Timestamp } from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore/firestore';
import { format } from 'date-fns';
import { ActivityType } from '~/hooks/useActivityLogs';
import { DownloadIcon } from '@chakra-ui/icons';
import * as XLSX from 'xlsx';

type ActivityLog = {
  id: string;
  activityType: ActivityType;
  entityId?: string;
  entityType?: string;
  userId?: string;
  userEmail?: string;
  companyId: string;
  locationId?: string;
  timestamp: Timestamp;
  details?: Record<string, any>;
  amount?: number;
  paymentMethod?: string;
  status?: 'success' | 'pending' | 'failed';
};

type ActivityLogsProps = {
  companyId: string;
  startDate?: Date;
  endDate?: Date;
};

const activityTypeLabels: Record<ActivityType, string> = {
  transaction_payment: 'Payment Transaction',
  transaction_refund: 'Refund Transaction',
  reservation_create: 'Reservation Created',
  reservation_modify: 'Reservation Modified',
  reservation_delete: 'Reservation Deleted',
  settings_update: 'Settings Updated',
  email_template_edit: 'Email Template Edited',
  form_field_add: 'Form Field Added',
  form_field_edit: 'Form Field Edited',
  form_field_delete: 'Form Field Deleted',
  open_hours_update: 'Open Hours Updated',
  block_dates_add: 'Block Dates Added',
  block_dates_edit: 'Block Dates Edited',
  block_dates_delete: 'Block Dates Deleted',
};

const ActivityLogs: React.FC<ActivityLogsProps> = ({ companyId, startDate, endDate }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchActivities = async () => {
      if (!companyId) return;

      setLoading(true);
      try {
        const activitiesRef = collection(firebaseFirestore, 'activityLogs');
        let constraints = [
          where('companyId', '==', companyId),
          orderBy('timestamp', 'desc')
        ];

        // Add date range filters if provided
        if (startDate && endDate) {
          constraints.push(
            where('timestamp', '>=', Timestamp.fromDate(startDate)),
            where('timestamp', '<=', Timestamp.fromDate(endDate))
          );
        }

        const q = query(activitiesRef, ...constraints);
        const querySnapshot = await getDocs(q);

        const activityData: ActivityLog[] = [];
        querySnapshot.forEach((doc) => {
          activityData.push({
            id: doc.id,
            ...doc.data()
          } as ActivityLog);
        });

        setActivities(activityData);
        setFilteredActivities(activityData);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [companyId, startDate, endDate]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredActivities(activities);
    } else if (filter === 'transactions') {
      setFilteredActivities(activities.filter(a => 
        a.activityType === 'transaction_payment' || a.activityType === 'transaction_refund'));
    } else if (filter === 'reservations') {
      setFilteredActivities(activities.filter(a => 
        a.activityType === 'reservation_create' || 
        a.activityType === 'reservation_modify' || 
        a.activityType === 'reservation_delete'));
    } else if (filter === 'settings') {
      setFilteredActivities(activities.filter(a => 
        a.activityType === 'settings_update' || 
        a.activityType === 'email_template_edit' ||
        a.activityType === 'form_field_add' ||
        a.activityType === 'form_field_edit' ||
        a.activityType === 'form_field_delete'));
    } else if (filter === 'schedule') {
      setFilteredActivities(activities.filter(a => 
        a.activityType === 'open_hours_update' || 
        a.activityType === 'block_dates_add' ||
        a.activityType === 'block_dates_edit' ||
        a.activityType === 'block_dates_delete'));
    }
  }, [filter, activities]);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss');
  };

  const getBadgeColor = (activityType: ActivityType) => {
    if (activityType.startsWith('transaction_')) return 'green';
    if (activityType.startsWith('reservation_')) return 'blue';
    if (activityType === 'settings_update') return 'purple';
    if (activityType === 'email_template_edit') return 'orange';
    if (activityType.startsWith('form_field_')) return 'teal';
    if (activityType === 'open_hours_update') return 'yellow';
    if (activityType.startsWith('block_dates_')) return 'pink';
    return 'gray';
  };

  const handleExport = () => {
    const exportData = filteredActivities.map(log => ({
      Date: formatDate(log.timestamp),
      'Activity Type': activityTypeLabels[log.activityType] || log.activityType,
      'Entity ID': log.entityId || '',
      'Entity Type': log.entityType || '',
      User: log.userEmail || 'Anonymous',
      Amount: log.amount || '',
      Status: log.status || '',
      Details: log.details ? JSON.stringify(log.details) : '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activity Logs');
    XLSX.writeFile(wb, 'activity-logs.xlsx');
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Activity Logs</Heading>
        <HStack>
          <Select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            size="sm"
            width="200px"
          >
            <option value="all">All Activities</option>
            <option value="transactions">Transactions</option>
            <option value="reservations">Reservations</option>
            <option value="settings">Settings & Forms</option>
            <option value="schedule">Schedule & Dates</option>
          </Select>
          <Button leftIcon={<DownloadIcon />} onClick={handleExport} size="sm">
            Export
          </Button>
        </HStack>
      </Flex>
      
      {filteredActivities.length === 0 ? (
        <Text>No activity logs found for the selected period.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Activity</Th>
                <Th>User</Th>
                <Th>Entity ID</Th>
                <Th>Details</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredActivities.map((activity) => (
                <Tr key={activity.id}>
                  <Td>{formatDate(activity.timestamp)}</Td>
                  <Td>
                    <Badge colorScheme={getBadgeColor(activity.activityType)}>
                      {activityTypeLabels[activity.activityType] || activity.activityType}
                    </Badge>
                    {activity.amount && (
                      <Text fontSize="xs" mt={1}>
                        ${activity.amount} - {activity.paymentMethod}
                      </Text>
                    )}
                  </Td>
                  <Td>{activity.userEmail || 'Anonymous'}</Td>
                  <Td>{activity.entityId || 'N/A'}</Td>
                  <Td>
                    {activity.details && (
                      <Text fontSize="xs" noOfLines={2}>
                        {Object.entries(activity.details)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ')}
                      </Text>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default ActivityLogs; 