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
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Stack,
  Divider,
  ButtonGroup,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
  limit,
  startAfter,
  endBefore,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore';
import { format } from 'date-fns';
import { ActivityType } from '~/hooks/useActivityLogs';
import { ViewIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

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
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
};

type Company = {
  id: string;
  name: string;
};

const activityTypeLabels: Record<ActivityType, string> = {
  transaction_payment: 'Payment Transaction',
  transaction_refund: 'Refund Transaction',
  reservation_create: 'Reservation Created',
  reservation_modify: 'Reservation Modified',
  reservation_delete: 'Reservation Deleted',
  reservation_cancel: '🚫 Reservation Cancelled',
  reservation_cancel_location_update_before: 'Cancel Location Update - Before',
  reservation_cancel_location_update_after: 'Cancel Location Update - After',
  reservation_cancel_complete: '✅ Reservation Cancellation Complete',
  reservation_cancel_error: '❌ Reservation Cancellation Error',
  reservation_cancellation_complete: 'Reservation Cancellation Complete ',
  reservation_cancellation_error: '❌ Reservation Cancellation Error',
  reservation_modification_complete: '📋 Reservation Modified (Complete)',
  reservation_location_update_before: 'Location Update - Before',
  reservation_location_update_after: 'Location Update - After',
  location_reservations_updated: 'Location Reservations Updated',
  reservation_hour_change: 'Reservation Hour Changed',
  reservation_location_change: 'Reservation Location Changed',
  reservation_debug_info: 'Reservation Debug Info',
  reservation_error: '❌ Reservation Error',
  location_update_error: '❌ Location Update Error',
  firestore_error: '❌ Firestore Error',
  validation_error: '❌ Validation Error',
  general_error: '❌ General Error',
  settings_update: 'Settings Updated',
  email_template_edit: 'Email Template Edited',
  form_field_add: 'Reservation Form Field Added',
  form_field_edit: 'Reservation Form Field Edited',
  form_field_delete: 'Reservation Form Field Deleted',
  open_hours_update: 'Open Hours Updated',
  block_dates_add: 'Block Dates Added',
  block_dates_edit: 'Block Dates Edited',
  block_dates_delete: 'Block Dates Deleted',
};

const ActivityLogs: React.FC<ActivityLogsProps> = () => {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Filter state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Pagination state for server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Back to 25 for production
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [pageSnapshots, setPageSnapshots] = useState<
    Map<number, QueryDocumentSnapshot<DocumentData> | null>
  >(new Map());
  const [currentActivities, setCurrentActivities] = useState<ActivityLog[]>([]);
  const [_filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);

  // Modal state for showing detailed activity information
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const companiesRef = collection(firebaseFirestore, 'companies');
        const q = query(companiesRef, orderBy('name'));
        const querySnapshot = await getDocs(q);

        const companyData: Company[] = [];
        querySnapshot.forEach((doc) => {
          companyData.push({
            id: doc.id,
            name: doc.data().name,
          });
        });

        setCompanies(companyData);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const fetchActivities = async (
    pageNumber: number = 1,
    direction: 'next' | 'prev' | 'first' = 'first'
  ) => {
    if (!selectedCompanyId) return;

    setLoading(true);
    try {
      const activitiesRef = collection(firebaseFirestore, 'activity_logs');
      let constraints: QueryConstraint[] = [
        where('companyId', '==', selectedCompanyId),
        orderBy('timestamp', 'desc'),
        limit(itemsPerPage + 1), // Get one extra to check if there's a next page
      ];

      // Add activity type filters at the Firestore query level
      if (filter !== 'all') {
        if (filter === 'transactions') {
          constraints.push(
            where('activityType', 'in', ['transaction_payment', 'transaction_refund'])
          );
        } else if (filter === 'reservations') {
          constraints.push(
            where('activityType', 'in', [
              'reservation_create',
              'reservation_modify',
              'reservation_delete',
              'reservation_cancel',
              'reservation_cancel_location_update_before',
              'reservation_cancel_location_update_after',
              'reservation_cancel_complete',
              'reservation_cancel_error',
              'reservation_cancellation_complete',
              'reservation_cancellation_error',
              'reservation_modification_complete',
            ])
          );
        } else if (filter === 'settings') {
          constraints.push(
            where('activityType', 'in', [
              'settings_update',
              'email_template_edit',
              'form_field_add',
              'form_field_edit',
              'form_field_delete',
            ])
          );
        } else if (filter === 'schedule') {
          constraints.push(
            where('activityType', 'in', [
              'open_hours_update',
              'block_dates_add',
              'block_dates_edit',
              'block_dates_delete',
            ])
          );
        }
      }

      // Add date range filters if provided
      if (startDateFilter && endDateFilter) {
        const startDate = new Date(startDateFilter);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(endDateFilter);
        endDate.setHours(23, 59, 59, 999);

        constraints.push(
          where('timestamp', '>=', Timestamp.fromDate(startDate)),
          where('timestamp', '<=', Timestamp.fromDate(endDate))
        );
      }

      // Handle pagination cursors
      if (direction === 'next' && pageNumber > 1) {
        const lastDocSnapshot = pageSnapshots.get(pageNumber - 1);
        if (lastDocSnapshot) {
          constraints.push(startAfter(lastDocSnapshot));
        }
      } else if (direction === 'prev' && pageNumber > 1) {
        const firstDocSnapshot = pageSnapshots.get(pageNumber + 1);
        if (firstDocSnapshot) {
          constraints.push(endBefore(firstDocSnapshot));
        }
      }

      const q = query(activitiesRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const docs = querySnapshot.docs;
      const hasMore = docs.length > itemsPerPage;
      const actualDocs = hasMore ? docs.slice(0, itemsPerPage) : docs;

      // Store the last document for next page navigation
      if (actualDocs.length > 0) {
        const newSnapshots = new Map(pageSnapshots);
        newSnapshots.set(pageNumber, actualDocs[actualDocs.length - 1]);
        setPageSnapshots(newSnapshots);
      }

      const activityData: ActivityLog[] = actualDocs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ActivityLog)
      );

      // For the first page, also get total count (this is expensive, so only do it once)
      if (pageNumber === 1) {
        const countConstraints: QueryConstraint[] = [
          where('companyId', '==', selectedCompanyId),
          orderBy('timestamp', 'desc'),
        ];

        // Add the same activity type filter for count
        if (filter !== 'all') {
          if (filter === 'transactions') {
            countConstraints.push(
              where('activityType', 'in', ['transaction_payment', 'transaction_refund'])
            );
          } else if (filter === 'reservations') {
            countConstraints.push(
              where('activityType', 'in', [
                'reservation_create',
                'reservation_modify',
                'reservation_delete',
                'reservation_cancel',
                'reservation_cancel_location_update_before',
                'reservation_cancel_location_update_after',
                'reservation_cancel_complete',
                'reservation_cancel_error',
                'reservation_cancellation_complete',
                'reservation_cancellation_error',
                'reservation_modification_complete',
              ])
            );
          } else if (filter === 'settings') {
            countConstraints.push(
              where('activityType', 'in', [
                'settings_update',
                'email_template_edit',
                'form_field_add',
                'form_field_edit',
                'form_field_delete',
              ])
            );
          } else if (filter === 'schedule') {
            countConstraints.push(
              where('activityType', 'in', [
                'open_hours_update',
                'block_dates_add',
                'block_dates_edit',
                'block_dates_delete',
              ])
            );
          }
        }

        if (startDateFilter && endDateFilter) {
          const startDate = new Date(startDateFilter);
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(endDateFilter);
          endDate.setHours(23, 59, 59, 999);

          countConstraints.push(
            where('timestamp', '>=', Timestamp.fromDate(startDate)),
            where('timestamp', '<=', Timestamp.fromDate(endDate))
          );
        }

        const countQuery = query(activitiesRef, ...countConstraints);
        const countSnapshot = await getDocs(countQuery);
        setTotalCount(countSnapshot.size);
      }

      setCurrentActivities(activityData);
      setFilteredActivities(activityData); // Since filtering is now done at query level
      setHasNextPage(hasMore);
      setHasPrevPage(pageNumber > 1);
      setCurrentPage(pageNumber);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when company or filter changes
  useEffect(() => {
    if (selectedCompanyId) {
      setCurrentPage(1);
      setPageSnapshots(new Map());
      fetchActivities(1, 'first');
    }
  }, [filter, selectedCompanyId]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setPageSnapshots(new Map());
    fetchActivities(1, 'first');
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchActivities(currentPage - 1, 'prev');
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      fetchActivities(currentPage + 1, 'next');
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss');
  };

  const getBadgeColor = (activityType: ActivityType) => {
    if (activityType.startsWith('transaction_')) return 'green';
    if (activityType.startsWith('reservation_cancel')) return 'red';
    if (activityType.startsWith('reservation_')) return 'blue';
    if (activityType.endsWith('_error')) return 'red';
    if (activityType === 'settings_update') return 'purple';
    if (activityType === 'email_template_edit') return 'orange';
    if (activityType.startsWith('form_field_')) return 'teal';
    if (activityType === 'open_hours_update') return 'yellow';
    if (activityType.startsWith('block_dates_')) return 'pink';
    return 'gray';
  };

  // Function to format details based on activity type
  const formatDetails = (activity: ActivityLog) => {
    if (!activity.details) return null;

    const details = activity.details;

    // Handle open hours updates
    if (activity.activityType === 'open_hours_update') {
      const locationName = details.locationName || 'Unknown Location';
      const modifiedDays = details.modifiedDays || [];

      return (
        <Stack spacing={3}>
          {/* Location Header */}
          <Box borderBottom='1px' borderColor='gray.200' pb={2}>
            <Text fontWeight='bold'>
              Location:{' '}
              <Text as='span' color='yellow.600'>
                {locationName}
              </Text>
            </Text>
          </Box>

          {/* Modified Days */}
          <Box>
            <Text fontWeight='bold' mb={2}>
              Hours Changes
            </Text>
            <Stack spacing={3}>
              {modifiedDays.map((dayChange: any, idx: number) => {
                const dayName = dayChange.dayName || `Day ${dayChange.index}`;
                const newValues = dayChange.newValues || {};
                const previousValues = dayChange.previousValues || {};

                return (
                  <Box
                    key={idx}
                    pl={3}
                    borderLeft='3px'
                    borderColor='yellow.400'
                    bg='yellow.50'
                    p={3}
                    borderRadius='md'
                  >
                    <Text fontWeight='medium' mb={2} color='yellow.800'>
                      {dayName}
                    </Text>

                    <Stack spacing={2}>
                      {/* Opening Hours */}
                      {(newValues.opening !== undefined ||
                        previousValues.opening !== undefined) && (
                        <Box>
                          <Text fontSize='sm' fontWeight='medium'>
                            Opening Time
                          </Text>
                          <Flex gap={2} alignItems='center'>
                            {previousValues.opening !== undefined && (
                              <Text color='red.500' fontSize='sm'>
                                {previousValues.opening}
                              </Text>
                            )}
                            {previousValues.opening !== undefined &&
                              newValues.opening !== undefined && <Text>→</Text>}
                            {newValues.opening !== undefined && (
                              <Text color='green.500' fontSize='sm'>
                                {newValues.opening}
                              </Text>
                            )}
                          </Flex>
                        </Box>
                      )}

                      {/* Closing Hours */}
                      {(newValues.closing !== undefined ||
                        previousValues.closing !== undefined) && (
                        <Box>
                          <Text fontSize='sm' fontWeight='medium'>
                            Closing Time
                          </Text>
                          <Flex gap={2} alignItems='center'>
                            {previousValues.closing !== undefined && (
                              <Text color='red.500' fontSize='sm'>
                                {previousValues.closing}
                              </Text>
                            )}
                            {previousValues.closing !== undefined &&
                              newValues.closing !== undefined && <Text>→</Text>}
                            {newValues.closing !== undefined && (
                              <Text color='green.500' fontSize='sm'>
                                {newValues.closing}
                              </Text>
                            )}
                          </Flex>
                        </Box>
                      )}

                      {/* Other properties if any */}
                      {Object.keys(newValues)
                        .filter((key) => !['opening', 'closing'].includes(key))
                        .map((key) => {
                          const prevVal = previousValues[key];
                          const newVal = newValues[key];

                          if (JSON.stringify(prevVal) === JSON.stringify(newVal)) return null;

                          return (
                            <Box key={key}>
                              <Text fontSize='sm' fontWeight='medium'>
                                {key}
                              </Text>
                              <Flex gap={2} alignItems='center'>
                                {prevVal !== undefined && (
                                  <Text color='red.500' fontSize='sm'>
                                    {JSON.stringify(prevVal)}
                                  </Text>
                                )}
                                {prevVal !== undefined && newVal !== undefined && <Text>→</Text>}
                                {newVal !== undefined && (
                                  <Text color='green.500' fontSize='sm'>
                                    {JSON.stringify(newVal)}
                                  </Text>
                                )}
                              </Flex>
                            </Box>
                          );
                        })}
                    </Stack>
                  </Box>
                );
              })}

              {modifiedDays.length === 0 && (
                <Text fontSize='sm' color='gray.500'>
                  No specific day changes recorded
                </Text>
              )}
            </Stack>
          </Box>
        </Stack>
      );
    }

    // Handle form field editing
    if (activity.activityType === 'form_field_edit') {
      const currentValue = details.currentValue || {};
      const previousValue = details.previousValue || {};

      const fieldName = details.fieldName;
      const fieldType = details.fieldType;

      // Get all unique keys from both objects

      // Separate important field properties from others
      const configKeys = ['name', 'defaultValue', 'options'];

      // Helper function to format values properly
      const formatValue = (value: any, key: string): React.ReactNode => {
        if (value === undefined) return '(none)';

        // Handle multilingual objects (like fieldName, name, placeholder)
        if (key === 'fieldName' || key === 'name' || key === 'placeholder') {
          if (typeof value === 'object' && value !== null) {
            const languages = Object.keys(value).sort((a, b) => a.localeCompare(b));
            return (
              <Stack spacing={1}>
                {languages.map((lang) => (
                  <Text key={lang} fontSize='xs'>
                    <Badge size='sm' mr={1}>
                      {lang}
                    </Badge>
                    {value[lang]}
                  </Text>
                ))}
              </Stack>
            );
          }
        }

        // Handle options array
        if (key === 'options' && Array.isArray(value)) {
          return (
            <Stack spacing={1}>
              {value.map((option, idx) => (
                <Box key={idx} pl={2} borderLeft='1px' borderColor='gray.300'>
                  {typeof option === 'object' && option !== null ? (
                    <Stack spacing={0}>
                      {option.id && <Text fontSize='xs'>ID: {option.id}</Text>}
                      {option.value && typeof option.value === 'object' ? (
                        <Box>
                          <Text fontSize='xs' fontWeight='medium'>
                            Value:
                          </Text>
                          {Object.entries(option.value).map(([lang, val]) => (
                            <Text key={lang} fontSize='xs' ml={2}>
                              <Badge size='sm' mr={1}>
                                {lang}
                              </Badge>
                              {String(val)}
                            </Text>
                          ))}
                        </Box>
                      ) : (
                        option.value && <Text fontSize='xs'>Value: {option.value}</Text>
                      )}
                    </Stack>
                  ) : (
                    <Text fontSize='xs'>{String(option)}</Text>
                  )}
                </Box>
              ))}
            </Stack>
          );
        }

        // Default case
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }

        return String(value);
      };

      return (
        <Stack spacing={3}>
          {/* Field Header */}
          <Box borderBottom='1px' borderColor='gray.200' pb={2}>
            <Text fontWeight='bold'>
              Form Field:{' '}
              <Text as='span' color='teal.500'>
                {fieldName}
              </Text>
            </Text>
            <Text fontSize='sm' color='gray.600'>
              Type: {fieldType}
            </Text>
            {details.updatedBy && (
              <Text fontSize='xs' color='gray.500'>
                Updated by: {details.updatedBy}
              </Text>
            )}
          </Box>

          {/* Configuration Changes */}
          {configKeys.some(
            (key) => JSON.stringify(previousValue[key]) !== JSON.stringify(currentValue[key])
          ) && (
            <Box>
              <Text fontWeight='bold' mb={1}>
                Configuration Changes
              </Text>
              <Stack spacing={2} pl={2} borderLeft='2px' borderColor='orange.400'>
                {configKeys
                  .map((key) => {
                    const prevVal = previousValue[key];
                    const currVal = currentValue[key];
                    const hasChanged = JSON.stringify(prevVal) !== JSON.stringify(currVal);

                    if (!hasChanged) return null;

                    return (
                      <Box key={key}>
                        <Text fontWeight='medium'>{key}</Text>
                        <Flex gap={2} alignItems='flex-start'>
                          <Box color='red.500' fontSize='sm'>
                            {formatValue(prevVal, key)}
                          </Box>
                          {prevVal !== undefined && currVal !== undefined && <Text mt={1}>→</Text>}
                          {currVal !== undefined && (
                            <Box color='green.500' fontSize='sm'>
                              {formatValue(currVal, key)}
                            </Box>
                          )}
                        </Flex>
                      </Box>
                    );
                  })
                  .filter(Boolean)}
              </Stack>
            </Box>
          )}
        </Stack>
      );
    }

    // Handle reservation cancellation activity types
    if (activity.activityType === 'reservation_cancel') {
      return (
        <Stack spacing={3}>
          <Box borderBottom='1px' borderColor='red.200' pb={2}>
            <Text fontWeight='bold' color='red.600'>
              🚫 Reservation Cancellation Initiated
            </Text>
            {details?.reservationCode && (
              <Text fontSize='sm' color='gray.600'>
                Reservation: {details?.reservationCode}
              </Text>
            )}
            {details?.customerName && (
              <Text fontSize='sm' color='gray.600'>
                Customer: {details?.customerName}
              </Text>
            )}
          </Box>

          <Stack spacing={2}>
            <Box>
              <Text fontWeight='bold' mb={1}>
                Cancellation Details
              </Text>
              <Stack spacing={2} pl={2} borderLeft='2px' borderColor='red.400'>
                <Box>
                  <Text fontSize='sm' fontWeight='medium'>
                    Cancelled By
                  </Text>
                  <Text
                    fontSize='sm'
                    color={details.cancelledBy === 'system' ? 'blue.600' : 'orange.600'}
                  >
                    {details.cancelledBy === 'system' ? 'Admin/System' : 'Customer'}
                  </Text>
                </Box>

                {details?.cancellationReason && (
                  <Box>
                    <Text fontSize='sm' fontWeight='medium'>
                      Reason
                    </Text>
                    <Text fontSize='sm'>{details?.cancellationReason}</Text>
                  </Box>
                )}

                {details?.startDate && details?.startHour && (
                  <Box>
                    <Text fontSize='sm' fontWeight='medium'>
                      Original Reservation
                    </Text>
                    <Text fontSize='sm'>
                      {details?.startDate} at {details?.startHour}
                      {details?.endHour && ` until ${details?.endHour}`}
                    </Text>
                    {details?.numberPeople && (
                      <Text fontSize='sm' color='gray.600'>
                        For {details?.numberPeople} people
                      </Text>
                    )}
                  </Box>
                )}
              </Stack>
            </Box>

            {details?.systemInfo && (
              <Box>
                <Text fontWeight='bold' mb={1}>
                  System Information
                </Text>
                <Box p={2} bg='gray.50' borderRadius='md' fontSize='xs'>
                  <Text>Time: {details?.systemInfo?.timestamp}</Text>
                  <Text>URL: {details?.systemInfo?.url}</Text>
                </Box>
              </Box>
            )}
          </Stack>
        </Stack>
      );
    }

    if (activity.activityType === 'reservation_cancel_complete') {
      return (
        <Stack spacing={3}>
          <Box borderBottom='1px' borderColor='red.200' pb={2}>
            <Text fontWeight='bold' color='red.600'>
              ✅ Reservation Cancellation Completed
            </Text>
            {details?.reservationCode && (
              <Text fontSize='sm' color='gray.600'>
                Reservation: {details?.reservationCode}
              </Text>
            )}
            {details?.customerName && (
              <Text fontSize='sm' color='gray.600'>
                Customer: {details?.customerName}
              </Text>
            )}
          </Box>

          {/* Cancellation Summary */}
          <Box>
            <Text fontWeight='bold' mb={2} color='green.600'>
              🎯 Cancellation Summary
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='red.50'>
                <Text fontSize='sm' fontWeight='bold' color='red.700' mb={1}>
                  Cancelled By
                </Text>
                <Text fontSize='sm' color='red.800'>
                  {details?.cancellationInfo?.cancelledBy === 'system'
                    ? 'Admin/System'
                    : 'Customer'}
                </Text>
              </Box>

              <Box p={3} borderWidth='1px' borderRadius='md' bg='blue.50'>
                <Text fontSize='sm' fontWeight='bold' color='blue.700' mb={1}>
                  Method
                </Text>
                <Text fontSize='sm' color='blue.800'>
                  {details?.cancellationInfo?.cancellationMethod || 'Unknown'}
                </Text>
              </Box>

              <Box p={3} borderWidth='1px' borderRadius='md' bg='gray.50'>
                <Text fontSize='sm' fontWeight='bold' color='gray.700' mb={1}>
                  Cancelled At
                </Text>
                <Text fontSize='sm' color='gray.800'>
                  {details?.cancellationInfo?.cancelledAt
                    ? new Date(details?.cancellationInfo?.cancelledAt).toLocaleString()
                    : 'Unknown'}
                </Text>
              </Box>
            </Stack>
          </Box>

          {/* Original Reservation Details */}
          {details?.reservationDetails && (
            <Box>
              <Text fontWeight='bold' mb={2} color='orange.600'>
                📅 Original Reservation Details
              </Text>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='orange.50'>
                <Stack spacing={1}>
                  <Text fontSize='sm'>
                    <strong>Date & Time:</strong> {details?.reservationDetails?.originalStartDate}{' '}
                    at {details?.reservationDetails?.originalStartHour}
                    {details?.reservationDetails?.originalEndHour &&
                      ` until ${details?.reservationDetails?.originalEndHour}`}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>People:</strong> {details?.reservationDetails?.originalNumberPeople}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>Location:</strong>{' '}
                    {details?.reservationDetails?.originalLocation?.name || 'Unknown'}
                  </Text>
                </Stack>
              </Box>
            </Box>
          )}

          {/* Location Updates */}
          {details?.locationUpdates && (
            <Box>
              <Text fontWeight='bold' mb={2} color='purple.600'>
                🔄 Location Data Updates
              </Text>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='purple.50'>
                <Stack spacing={1}>
                  <Text fontSize='sm'>
                    <strong>Location ID:</strong> {details?.locationUpdates?.locationId}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>Affected Date:</strong> {details?.locationUpdates?.affectedDate}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>Hours Cleared:</strong>{' '}
                    {details?.locationUpdates?.hoursCleared?.length || 0} time slots
                  </Text>
                  {details?.locationUpdates?.hoursCleared?.length > 0 && (
                    <Text fontSize='xs' color='gray.600'>
                      Cleared hours: {details?.locationUpdates?.hoursCleared?.join(', ')}
                    </Text>
                  )}
                </Stack>
              </Box>
            </Box>
          )}

          {/* User Information */}
          {details?.cancellationInfo?.userInfo && (
            <Box>
              <Text fontWeight='bold' mb={2} color='teal.600'>
                👤 User Information
              </Text>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='teal.50'>
                <Stack spacing={1}>
                  <Text fontSize='sm'>
                    <strong>User ID:</strong> {details?.cancellationInfo?.userInfo?.userId}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>Email:</strong> {details?.cancellationInfo?.userInfo?.userEmail}
                  </Text>
                </Stack>
              </Box>
            </Box>
          )}
        </Stack>
      );
    }

    if (
      activity.activityType === 'reservation_cancel_location_update_before' ||
      activity.activityType === 'reservation_cancel_location_update_after'
    ) {
      const isBefore = activity.activityType === 'reservation_cancel_location_update_before';
      const locationData = details?.locationReservationsData;

      return (
        <Stack spacing={3}>
          <Box borderBottom='1px' borderColor={isBefore ? 'yellow.200' : 'green.200'} pb={2}>
            <Text fontWeight='bold' color={isBefore ? 'yellow.600' : 'green.600'}>
              {isBefore
                ? '📋 Before Cancellation Location Update'
                : '✅ After Cancellation Location Update'}
            </Text>
            <Text fontSize='sm' color='gray.600'>
              Location ID: {details.locationId} | Date: {details.formattedDate}
            </Text>
            {details.reservationCode && (
              <Text fontSize='sm' color='blue.600'>
                For Reservation: {details.reservationCode}
              </Text>
            )}
          </Box>

          {locationData && (
            <Box>
              <Text fontWeight='bold' mb={2}>
                Location Reservations Data
              </Text>

              {isBefore ? (
                <Box>
                  <Text fontSize='sm' mb={2} color='yellow.700'>
                    Data state before removing the cancelled reservation:
                  </Text>
                  {locationData.targetReservation && (
                    <Text fontSize='sm' mb={2} color='red.600'>
                      Target reservation to remove: {locationData.targetReservation}
                    </Text>
                  )}
                  <Box
                    bg='yellow.50'
                    p={3}
                    borderRadius='md'
                    fontSize='xs'
                    fontFamily='mono'
                    maxH='200px'
                    overflowY='auto'
                  >
                    <Text whiteSpace='pre-wrap'>
                      {JSON.stringify(locationData.beforeUpdate || {}, null, 2)}
                    </Text>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Text fontSize='sm' mb={2} color='green.700'>
                    Data state after removing the cancelled reservation:
                  </Text>
                  {locationData.hoursAffected?.length > 0 && (
                    <Text fontSize='sm' mb={2} color='green.600'>
                      Hours affected: {locationData.hoursAffected.join(', ')}
                    </Text>
                  )}
                  <Box
                    bg='green.50'
                    p={3}
                    borderRadius='md'
                    fontSize='xs'
                    fontFamily='mono'
                    maxH='200px'
                    overflowY='auto'
                  >
                    <Text whiteSpace='pre-wrap'>
                      {JSON.stringify(locationData.afterUpdate || {}, null, 2)}
                    </Text>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      );
    }

    if (activity.activityType === 'reservation_cancel_error') {
      return (
        <Stack spacing={3}>
          <Box borderBottom='1px' borderColor='red.200' pb={2}>
            <Text fontWeight='bold' color='red.600'>
              ❌ Reservation Cancellation Error
            </Text>
            {details.reservationCode && (
              <Text fontSize='sm' color='gray.600'>
                Reservation: {details.reservationCode}
              </Text>
            )}
            {details.customerName && (
              <Text fontSize='sm' color='gray.600'>
                Customer: {details.customerName}
              </Text>
            )}
          </Box>

          {/* Error Details */}
          <Box>
            <Text fontWeight='bold' mb={2} color='red.600'>
              Error Information
            </Text>
            <Stack spacing={2}>
              <Box p={3} bg='red.50' borderWidth='1px' borderColor='red.200' borderRadius='md'>
                <Text fontSize='sm' fontWeight='bold' color='red.700' mb={1}>
                  Error Message
                </Text>
                <Text fontSize='sm' color='red.800'>
                  {details.errorMessage || 'Unknown error occurred'}
                </Text>
              </Box>

              {details.errorStack && (
                <Box
                  p={3}
                  bg='gray.900'
                  color='white'
                  borderRadius='md'
                  fontSize='xs'
                  fontFamily='mono'
                  maxH='150px'
                  overflowY='auto'
                >
                  <Text whiteSpace='pre-wrap'>{details.errorStack}</Text>
                </Box>
              )}

              {details.attemptedOperation && (
                <Box
                  p={3}
                  bg='orange.50'
                  borderWidth='1px'
                  borderColor='orange.200'
                  borderRadius='md'
                >
                  <Text fontSize='sm' fontWeight='bold' color='orange.700' mb={1}>
                    Failed Operation
                  </Text>
                  <Text fontSize='sm' color='orange.800'>
                    {details.attemptedOperation}
                  </Text>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Cancellation Context */}
          {details.cancellationContext && (
            <Box>
              <Text fontWeight='bold' mb={2} color='purple.600'>
                Cancellation Context
              </Text>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='purple.50'>
                <Stack spacing={1}>
                  <Text fontSize='sm'>
                    <strong>Attempted By:</strong>{' '}
                    {details.cancellationContext.cancelledBy === 'system'
                      ? 'Admin/System'
                      : 'Customer'}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>Method:</strong>{' '}
                    {details.cancellationContext.cancellationMethod || 'Unknown'}
                  </Text>
                </Stack>
              </Box>
            </Box>
          )}

          {/* System Information */}
          {details.systemInfo && (
            <Box>
              <Text fontWeight='bold' mb={2} color='gray.600'>
                System Information
              </Text>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='gray.50'>
                <Stack spacing={1}>
                  <Text fontSize='xs'>
                    <strong>Timestamp:</strong> {details.systemInfo.timestamp}
                  </Text>
                  <Text fontSize='xs'>
                    <strong>URL:</strong> {details.systemInfo.url}
                  </Text>
                  {details.systemInfo.userAgent && (
                    <Text fontSize='xs'>
                      <strong>Browser:</strong> {details.systemInfo.userAgent}
                    </Text>
                  )}
                </Stack>
              </Box>
            </Box>
          )}
        </Stack>
      );
    }

    // Handle comprehensive reservation cancellation activity types
    if (activity.activityType === 'reservation_cancellation_complete') {
      return (
        <Stack spacing={4}>
          {/* Header with timing and summary */}
          <Box borderBottom='1px' borderColor='red.200' pb={3}>
            <Text fontWeight='bold' color='red.600' fontSize='lg'>
              🎯 Comprehensive Reservation Cancellation
            </Text>
            <Flex gap={4} mt={2} flexWrap='wrap'>
              {details.processingTime && (
                <Badge colorScheme='gray' size='sm'>
                  Processed in {details.processingTime}ms
                </Badge>
              )}
              {details.processedAt && (
                <Text fontSize='xs' color='gray.500'>
                  Completed: {new Date(details.processedAt).toLocaleString()}
                </Text>
              )}
            </Flex>
          </Box>

          {/* Cancellation Summary */}
          <Box>
            <Text fontWeight='bold' mb={2} color='red.600'>
              🚫 Cancellation Summary
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Box p={3} borderWidth='2px' borderColor='red.300' borderRadius='md' bg='red.50'>
                <Text fontSize='sm' fontWeight='bold' color='red.700' mb={1}>
                  Cancelled By
                </Text>
                <Text fontSize='lg' color='red.800' fontWeight='bold'>
                  {details.cancellationInfo?.cancelledBy === 'system' ? 'Admin/System' : 'Customer'}
                </Text>
              </Box>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='blue.50'>
                <Text fontSize='sm' fontWeight='bold' color='blue.700' mb={1}>
                  Method
                </Text>
                <Text fontSize='sm' color='blue.800'>
                  {details.cancellationInfo?.cancellationMethod || 'Unknown'}
                </Text>
              </Box>
              <Box
                p={3}
                borderWidth='1px'
                borderRadius='md'
                bg={details.summary?.wasSuccessful ? 'green.50' : 'red.50'}
              >
                <Text
                  fontSize='sm'
                  fontWeight='bold'
                  color={details.summary?.wasSuccessful ? 'green.700' : 'red.700'}
                  mb={1}
                >
                  Status
                </Text>
                <Text
                  fontSize='sm'
                  color={details.summary?.wasSuccessful ? 'green.800' : 'red.800'}
                  fontWeight='bold'
                >
                  {details.summary?.wasSuccessful ? '✅ Success' : '❌ Failed'}
                </Text>
              </Box>
            </Stack>
          </Box>

          {/* Original Reservation Details */}
          {details.originalReservation && (
            <Box>
              <Text fontWeight='bold' mb={2} color='orange.600'>
                📅 Original Reservation Details
              </Text>
              <Box
                p={4}
                borderWidth='2px'
                borderColor='orange.200'
                borderRadius='md'
                bg='orange.50'
              >
                <Stack spacing={2}>
                  <Text fontSize='sm'>
                    <strong>Date & Time:</strong> {details.originalReservation.startDate} at{' '}
                    {details.originalReservation.startHour}
                    {details.originalReservation.endHour &&
                      ` until ${details.originalReservation.endHour}`}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>People:</strong> {details.originalReservation.numberPeople}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>Location:</strong>{' '}
                    {details.originalReservation.location?.name || 'Unknown'}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>Reservation Code:</strong> {details.originalReservation.code}
                  </Text>
                </Stack>
              </Box>
            </Box>
          )}

          {/* Location Updates Performed */}
          {details.locationUpdates && (
            <Box>
              <Text fontWeight='bold' mb={3} color='purple.600'>
                🔄 Location Data Updates
              </Text>
              <Box p={4} borderWidth='1px' borderRadius='md' bg='purple.50'>
                <Stack spacing={3}>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box>
                      <Text fontSize='sm' fontWeight='bold' color='purple.700'>
                        Hours Cleared
                      </Text>
                      <Text fontSize='lg' fontWeight='bold' color='purple.800'>
                        {details.summary?.totalHoursCleared || 0}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize='sm' fontWeight='bold' color='purple.700'>
                        Operations
                      </Text>
                      <Text fontSize='lg' fontWeight='bold' color='purple.800'>
                        {details.summary?.locationOperations || 0}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize='sm' fontWeight='bold' color='purple.700'>
                        Affected Date
                      </Text>
                      <Text fontSize='sm' color='purple.800'>
                        {details.locationUpdates.affectedDate}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {details.locationUpdates.hoursCleared?.length > 0 && (
                    <Box>
                      <Text fontSize='sm' fontWeight='bold' color='purple.700' mb={2}>
                        Cleared Time Slots
                      </Text>
                      <Box p={2} bg='purple.100' borderRadius='md'>
                        <Text fontSize='xs' color='purple.800'>
                          {details.locationUpdates.hoursCleared.join(', ')}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Box>
          )}

          {/* User Information (if system cancellation) */}
          {details.cancellationInfo?.userInfo && (
            <Box>
              <Text fontWeight='bold' mb={2} color='teal.600'>
                👤 Admin User Information
              </Text>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='teal.50'>
                <Stack spacing={1}>
                  <Text fontSize='sm'>
                    <strong>User ID:</strong> {details.cancellationInfo.userInfo.userId}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>Email:</strong> {details.cancellationInfo.userInfo.userEmail}
                  </Text>
                </Stack>
              </Box>
            </Box>
          )}

          {/* System Information */}
          <Box>
            <Text fontWeight='bold' mb={2} color='gray.600'>
              🖥️ System Information
            </Text>
            <Box p={3} borderWidth='1px' borderRadius='md' bg='gray.50'>
              <Stack spacing={1}>
                <Text fontSize='xs'>
                  <strong>Timestamp:</strong> {details.systemInfo?.timestamp}
                </Text>
                <Text fontSize='xs'>
                  <strong>URL:</strong> {details.systemInfo?.url}
                </Text>
                <Text fontSize='xs'>
                  <strong>Source:</strong> {details.summary?.cancellationSource}
                </Text>
                {details.systemInfo?.userAgent && (
                  <Text fontSize='xs'>
                    <strong>Browser:</strong> {details.systemInfo.userAgent}
                  </Text>
                )}
              </Stack>
            </Box>
          </Box>
        </Stack>
      );
    }

    if (activity.activityType === 'reservation_cancellation_error') {
      return (
        <Stack spacing={4}>
          {/* Header */}
          <Box borderBottom='1px' borderColor='red.200' pb={3}>
            <Text fontWeight='bold' color='red.600' fontSize='lg'>
              ❌ Comprehensive Reservation Cancellation Failed
            </Text>
            {details.processedAt && (
              <Text fontSize='xs' color='gray.500' mt={1}>
                Failed at: {new Date(details.processedAt).toLocaleString()}
              </Text>
            )}
          </Box>

          {/* Error Summary */}
          <Box>
            <Text fontWeight='bold' mb={2} color='red.600'>
              🚨 Error Summary
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Box p={3} borderWidth='2px' borderColor='red.300' borderRadius='md' bg='red.50'>
                <Text fontSize='sm' fontWeight='bold' color='red.700' mb={1}>
                  Attempted By
                </Text>
                <Text fontSize='sm' color='red.800'>
                  {details.cancellationContext?.cancelledBy === 'system'
                    ? 'Admin/System'
                    : 'Customer'}
                </Text>
              </Box>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='orange.50'>
                <Text fontSize='sm' fontWeight='bold' color='orange.700' mb={1}>
                  Failure Stage
                </Text>
                <Text fontSize='sm' color='orange.800'>
                  {details.summary?.failureStage || 'Unknown'}
                </Text>
              </Box>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='gray.50'>
                <Text fontSize='sm' fontWeight='bold' color='gray.700' mb={1}>
                  Source
                </Text>
                <Text fontSize='sm' color='gray.800'>
                  {details.summary?.cancellationSource || 'Unknown'}
                </Text>
              </Box>
            </Stack>
          </Box>

          {/* Error Details */}
          <Box>
            <Text fontWeight='bold' mb={2} color='red.600'>
              Error Details
            </Text>
            <Stack spacing={3}>
              <Box p={4} bg='red.50' borderWidth='2px' borderColor='red.200' borderRadius='md'>
                <Text fontSize='sm' fontWeight='bold' color='red.700' mb={2}>
                  Error Message
                </Text>
                <Text fontSize='sm' color='red.800'>
                  {details.errorMessage || 'Unknown error occurred'}
                </Text>
              </Box>

              {details.errorStack && (
                <Box>
                  <Text fontSize='sm' fontWeight='bold' color='red.700' mb={2}>
                    Stack Trace
                  </Text>
                  <Box
                    p={3}
                    bg='gray.900'
                    color='white'
                    borderRadius='md'
                    fontSize='xs'
                    fontFamily='mono'
                    maxH='200px'
                    overflowY='auto'
                  >
                    <Text whiteSpace='pre-wrap'>{details.errorStack}</Text>
                  </Box>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Original Reservation Context */}
          {details.originalReservation && (
            <Box>
              <Text fontWeight='bold' mb={2} color='orange.600'>
                📅 Original Reservation Context
              </Text>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='orange.50'>
                <Stack spacing={1}>
                  <Text fontSize='sm'>
                    <strong>Reservation Code:</strong> {details.originalReservation.code}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>Date & Time:</strong> {details.originalReservation.startDate} at{' '}
                    {details.originalReservation.startHour}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>Location:</strong>{' '}
                    {details.originalReservation.location?.name || 'Unknown'}
                  </Text>
                  <Text fontSize='sm'>
                    <strong>People:</strong> {details.originalReservation.numberPeople}
                  </Text>
                </Stack>
              </Box>
            </Box>
          )}

          {/* System Information */}
          <Box>
            <Text fontWeight='bold' mb={2} color='gray.600'>
              🖥️ System Information
            </Text>
            <Box p={3} borderWidth='1px' borderRadius='md' bg='gray.50'>
              <Stack spacing={1}>
                <Text fontSize='xs'>
                  <strong>Timestamp:</strong> {details.systemInfo?.timestamp}
                </Text>
                <Text fontSize='xs'>
                  <strong>URL:</strong> {details.systemInfo?.url}
                </Text>
                {details.systemInfo?.userAgent && (
                  <Text fontSize='xs'>
                    <strong>Browser:</strong> {details.systemInfo.userAgent}
                  </Text>
                )}
              </Stack>
            </Box>
          </Box>
        </Stack>
      );
    }

    // Handle reservation debugging activity types
    if (activity.activityType === 'reservation_modification_complete') {
      const modifications = details.modifications || {};
      const prevReservation = details.previousReservation || {};
      const updatedReservation = details.updatedReservation || {};
      const locationUpdates = details.locationUpdates || [];
      const formData = details.formData || {};
      const systemInfo = details.systemInfo || {};

      return (
        <Stack spacing={4}>
          {/* Header with timing and summary */}
          <Box borderBottom='1px' borderColor='blue.200' pb={3}>
            <Text fontWeight='bold' color='blue.600' fontSize='lg'>
              📋 Comprehensive Reservation Modification
            </Text>
            <Flex gap={4} mt={2} flexWrap='wrap'>
              {details.processingTime && (
                <Badge colorScheme='gray' size='sm'>
                  Processed in {details.processingTime}ms
                </Badge>
              )}
              {details.processedAt && (
                <Text fontSize='xs' color='gray.500'>
                  Completed: {new Date(details.processedAt).toLocaleString()}
                </Text>
              )}
            </Flex>
          </Box>

          {/* Modification Summary */}
          <Box>
            <Text fontWeight='bold' mb={2} color='orange.600'>
              🔄 Changes Made
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Box
                p={3}
                borderWidth='1px'
                borderRadius='md'
                bg={modifications.isLocationChanging ? 'orange.50' : 'gray.50'}
              >
                <Text
                  fontSize='sm'
                  fontWeight='bold'
                  color={modifications.isLocationChanging ? 'orange.700' : 'gray.600'}
                >
                  Location {modifications.isLocationChanging ? '✅ Changed' : '➖ Unchanged'}
                </Text>
              </Box>
              <Box
                p={3}
                borderWidth='1px'
                borderRadius='md'
                bg={modifications.isTimeChanging ? 'purple.50' : 'gray.50'}
              >
                <Text
                  fontSize='sm'
                  fontWeight='bold'
                  color={modifications.isTimeChanging ? 'purple.700' : 'gray.600'}
                >
                  Date/Time {modifications.isTimeChanging ? '✅ Changed' : '➖ Unchanged'}
                </Text>
              </Box>
              <Box
                p={3}
                borderWidth='1px'
                borderRadius='md'
                bg={modifications.isNumberPeopleChanging ? 'blue.50' : 'gray.50'}
              >
                <Text
                  fontSize='sm'
                  fontWeight='bold'
                  color={modifications.isNumberPeopleChanging ? 'blue.700' : 'gray.600'}
                >
                  People Count{' '}
                  {modifications.isNumberPeopleChanging ? '✅ Changed' : '➖ Unchanged'}
                </Text>
              </Box>
            </Stack>
          </Box>

          {/* Before and After Comparison */}
          <Box>
            <Text fontWeight='bold' mb={3} color='green.600'>
              📊 Before & After Comparison
            </Text>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
              {/* Previous State */}
              <Box borderWidth='2px' borderColor='red.200' borderRadius='md' p={4} bg='red.50'>
                <Text fontWeight='bold' color='red.700' mb={3}>
                  ⬅️ Previous State
                </Text>
                <Stack spacing={2}>
                  <Box>
                    <Text fontSize='sm' fontWeight='bold'>
                      Location
                    </Text>
                    <Text fontSize='sm'>{prevReservation.location?.name || 'Unknown'}</Text>
                    <Text fontSize='xs' color='gray.600'>
                      ID: {prevReservation.location?.id}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize='sm' fontWeight='bold'>
                      Date & Time
                    </Text>
                    <Text fontSize='sm'>
                      {prevReservation.startDate} at {prevReservation.startHour}
                    </Text>
                    {prevReservation.endHour && (
                      <Text fontSize='sm'>Until: {prevReservation.endHour}</Text>
                    )}
                  </Box>
                  <Box>
                    <Text fontSize='sm' fontWeight='bold'>
                      People Count
                    </Text>
                    <Text fontSize='sm'>{prevReservation.numberPeople}</Text>
                  </Box>
                </Stack>
              </Box>

              {/* New State */}
              <Box borderWidth='2px' borderColor='green.200' borderRadius='md' p={4} bg='green.50'>
                <Text fontWeight='bold' color='green.700' mb={3}>
                  ➡️ Updated State
                </Text>
                <Stack spacing={2}>
                  <Box>
                    <Text fontSize='sm' fontWeight='bold'>
                      Location
                    </Text>
                    <Text fontSize='sm'>{updatedReservation.location?.name || 'Unknown'}</Text>
                    <Text fontSize='xs' color='gray.600'>
                      ID: {updatedReservation.location?.id}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize='sm' fontWeight='bold'>
                      Date & Time
                    </Text>
                    <Text fontSize='sm'>
                      {updatedReservation.startDate} at {updatedReservation.startHour}
                    </Text>
                    {updatedReservation.endHour && (
                      <Text fontSize='sm'>Until: {updatedReservation.endHour}</Text>
                    )}
                  </Box>
                  <Box>
                    <Text fontSize='sm' fontWeight='bold'>
                      People Count
                    </Text>
                    <Text fontSize='sm'>{updatedReservation.numberPeople}</Text>
                  </Box>
                </Stack>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Location Updates Performed */}
          {locationUpdates.length > 0 && (
            <Box>
              <Text fontWeight='bold' mb={2} color='purple.600'>
                🔄 Location Data Updates
              </Text>
              <Stack spacing={2}>
                {locationUpdates.map((update: any, idx: number) => (
                  <Box key={idx} p={3} borderWidth='1px' borderRadius='md' bg='purple.50'>
                    <Text fontSize='sm' fontWeight='bold' color='purple.700'>
                      Update #{idx + 1}: {update.type}
                    </Text>
                    <Text fontSize='xs' color='gray.600'>
                      Location ID: {update.locationId}
                    </Text>
                    {update.affectedDates && (
                      <Text fontSize='xs' color='gray.600'>
                        Affected Dates: {update.affectedDates.join(', ')}
                      </Text>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Form Data Submitted */}
          <Box>
            <Text fontWeight='bold' mb={2} color='teal.600'>
              📝 Form Data Submitted
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
              {Object.entries(formData).map(([key, value]) => (
                <Box key={key} p={2} borderWidth='1px' borderRadius='md' bg='teal.50'>
                  <Text fontSize='xs' fontWeight='bold' color='teal.700' mb={1}>
                    {key}
                  </Text>
                  <Text fontSize='sm' color='teal.800'>
                    {String(value)}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          {/* System Information */}
          {systemInfo.timestamp && (
            <Box>
              <Text fontWeight='bold' mb={2} color='gray.600'>
                🖥️ System Information
              </Text>
              <Box p={3} borderWidth='1px' borderRadius='md' bg='gray.50'>
                <Stack spacing={1}>
                  <Text fontSize='xs'>
                    <strong>Timestamp:</strong> {systemInfo.timestamp}
                  </Text>
                  <Text fontSize='xs'>
                    <strong>URL:</strong> {systemInfo.url}
                  </Text>
                  {systemInfo.userAgent && (
                    <Text fontSize='xs'>
                      <strong>Browser:</strong> {systemInfo.userAgent}
                    </Text>
                  )}
                </Stack>
              </Box>
            </Box>
          )}

          {/* Errors (if any) */}
          {details.errors && details.errors.length > 0 && (
            <Box>
              <Text fontWeight='bold' mb={2} color='red.600'>
                ⚠️ Errors Encountered
              </Text>
              <Stack spacing={2}>
                {details.errors.map((error: any, idx: number) => (
                  <Box
                    key={idx}
                    p={3}
                    borderWidth='1px'
                    borderColor='red.200'
                    borderRadius='md'
                    bg='red.50'
                  >
                    <Text fontSize='sm' color='red.800'>
                      {JSON.stringify(error)}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      );
    }

    if (activity.activityType === 'reservation_debug_info') {
      const message = details.message || 'Debug information';

      return (
        <Stack spacing={3}>
          <Box borderBottom='1px' borderColor='blue.200' pb={2}>
            <Text fontWeight='bold' color='blue.600'>
              🔍 {message}
            </Text>
            {details.reservationCode && (
              <Text fontSize='sm' color='gray.600'>
                Reservation: {details.reservationCode}
              </Text>
            )}
          </Box>

          {/* Location Information */}
          {details.currentLocation && details.newLocation && (
            <Box>
              <Text fontWeight='bold' mb={1}>
                Location Information
              </Text>
              <Stack spacing={2} pl={2} borderLeft='2px' borderColor='blue.400'>
                <Box>
                  <Text fontSize='sm' fontWeight='medium'>
                    Current Location
                  </Text>
                  <Text fontSize='sm'>
                    {details.currentLocation.name} (ID: {details.currentLocation.id})
                  </Text>
                </Box>
                <Box>
                  <Text fontSize='sm' fontWeight='medium'>
                    New Location
                  </Text>
                  <Text fontSize='sm'>
                    {details.newLocation.name} (ID: {details.newLocation.id})
                  </Text>
                </Box>
                {details.isLocationChanging && (
                  <Badge colorScheme='orange' size='sm' alignSelf='flex-start'>
                    Location is changing
                  </Badge>
                )}
              </Stack>
            </Box>
          )}

          {/* Date/Time Information */}
          {details.currentDateTime && details.newDateTime && (
            <Box>
              <Text fontWeight='bold' mb={1}>
                Date/Time Changes
              </Text>
              <Stack spacing={2} pl={2} borderLeft='2px' borderColor='blue.400'>
                <Box>
                  <Text fontSize='sm' fontWeight='medium'>
                    Current
                  </Text>
                  <Text fontSize='sm'>
                    {details.currentDateTime.startDate} at {details.currentDateTime.startHour}
                    {details.currentDateTime.endHour && ` - ${details.currentDateTime.endHour}`}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize='sm' fontWeight='medium'>
                    New
                  </Text>
                  <Text fontSize='sm'>
                    {details.newDateTime.startDate} at {details.newDateTime.startHour}
                    {details.newDateTime.endHour && ` - ${details.newDateTime.endHour}`}
                  </Text>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Number of People */}
          {details.numberPeople && (
            <Box>
              <Text fontWeight='bold' mb={1}>
                People Count
              </Text>
              <Text fontSize='sm'>
                {details.numberPeople.current !== details.numberPeople.new ? (
                  <>
                    <Text as='span' color='red.500'>
                      {details.numberPeople.current}
                    </Text>
                    {' → '}
                    <Text as='span' color='green.500'>
                      {details.numberPeople.new}
                    </Text>
                  </>
                ) : (
                  details.numberPeople.current
                )}
              </Text>
            </Box>
          )}

          {/* Final State Information */}
          {details.finalReservationsState && (
            <Box>
              <Text fontWeight='bold' mb={1}>
                Final State Info
              </Text>
              <Stack spacing={1} fontSize='sm'>
                {details.finalLocationName && (
                  <Text>
                    <strong>Final Location:</strong> {details.finalLocationName}
                  </Text>
                )}
                {details.formattedStartDate && (
                  <Text>
                    <strong>Date:</strong> {details.formattedStartDate}
                  </Text>
                )}
                {details.hoursList && (
                  <Text>
                    <strong>Hours Affected:</strong>{' '}
                    {Array.isArray(details.hoursList)
                      ? details.hoursList.join(', ')
                      : details.hoursList}
                  </Text>
                )}
                {details.wasExistingReservation !== undefined && (
                  <Badge colorScheme={details.wasExistingReservation ? 'blue' : 'green'} size='sm'>
                    {details.wasExistingReservation ? 'Update' : 'New Reservation'}
                  </Badge>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      );
    }

    if (activity.activityType === 'reservation_location_change') {
      return (
        <Stack spacing={3}>
          <Box borderBottom='1px' borderColor='orange.200' pb={2}>
            <Text fontWeight='bold' color='orange.600'>
              📍 Location Changed
            </Text>
            {details.reservationCode && (
              <Text fontSize='sm' color='gray.600'>
                Reservation: {details.reservationCode}
              </Text>
            )}
            {details.customerName && (
              <Text fontSize='sm' color='gray.600'>
                Customer: {details.customerName}
              </Text>
            )}
          </Box>

          <Stack spacing={2}>
            <Box>
              <Text fontWeight='bold' color='red.500' mb={1}>
                From
              </Text>
              <Text fontSize='sm'>
                {details.previousLocation?.name} ({details.previousLocation?.address})
              </Text>
              <Text fontSize='xs' color='gray.500'>
                ID: {details.previousLocation?.id}
              </Text>
            </Box>

            <Box>
              <Text fontWeight='bold' color='green.500' mb={1}>
                To
              </Text>
              <Text fontSize='sm'>
                {details.newLocation?.name} ({details.newLocation?.address})
              </Text>
              <Text fontSize='xs' color='gray.500'>
                ID: {details.newLocation?.id}
              </Text>
            </Box>
          </Stack>
        </Stack>
      );
    }

    if (activity.activityType === 'reservation_hour_change') {
      return (
        <Stack spacing={3}>
          <Box borderBottom='1px' borderColor='purple.200' pb={2}>
            <Text fontWeight='bold' color='purple.600'>
              🕐 Hours Changed
            </Text>
            {details.reservationCode && (
              <Text fontSize='sm' color='gray.600'>
                Reservation: {details.reservationCode}
              </Text>
            )}
            {details.customerName && (
              <Text fontSize='sm' color='gray.600'>
                Customer: {details.customerName}
              </Text>
            )}
          </Box>

          <Stack spacing={2}>
            <Box>
              <Text fontWeight='bold' color='red.500' mb={1}>
                Previous Hours
              </Text>
              <Text fontSize='sm'>
                {details.previousHours?.startDate} from {details.previousHours?.startHour}
                {details.previousHours?.endHour && ` to ${details.previousHours?.endHour}`}
              </Text>
            </Box>

            <Box>
              <Text fontWeight='bold' color='green.500' mb={1}>
                New Hours
              </Text>
              <Text fontSize='sm'>
                {details.newHours?.startDate} from {details.newHours?.startHour}
                {details.newHours?.endHour && ` to ${details.newHours?.endHour}`}
              </Text>
            </Box>
          </Stack>
        </Stack>
      );
    }

    if (
      activity.activityType === 'reservation_location_update_before' ||
      activity.activityType === 'reservation_location_update_after'
    ) {
      const isBefore = activity.activityType === 'reservation_location_update_before';
      const reservationsData = isBefore
        ? details.allReservationsBeforeUpdate
        : details.allReservationsAfterUpdate;
      const dayReservationsData = isBefore
        ? details.reservationsBeforeUpdate
        : details.reservationsAfterUpdate;

      return (
        <Stack spacing={3}>
          <Box borderBottom='1px' borderColor={isBefore ? 'yellow.200' : 'cyan.200'} pb={2}>
            <Text fontWeight='bold' color={isBefore ? 'yellow.600' : 'cyan.600'}>
              {isBefore ? '📋 Before Location Update' : '✅ After Location Update'}
            </Text>
            <Text fontSize='sm' color='gray.600'>
              Location ID: {details.locationId} | Date: {details.formattedDate}
            </Text>
          </Box>

          <Box>
            <Text fontWeight='bold' mb={1}>
              Day Reservations State
            </Text>
            <Box bg='gray.50' p={3} borderRadius='md' fontSize='xs' fontFamily='mono'>
              <Text whiteSpace='pre-wrap'>
                {dayReservationsData
                  ? JSON.stringify(JSON.parse(dayReservationsData), null, 2)
                  : 'No data'}
              </Text>
            </Box>
          </Box>

          {reservationsData && (
            <Box>
              <Text fontWeight='bold' mb={1}>
                Full Location Reservations
              </Text>
              <Box
                bg='gray.50'
                p={3}
                borderRadius='md'
                fontSize='xs'
                fontFamily='mono'
                maxH='200px'
                overflowY='auto'
              >
                <Text whiteSpace='pre-wrap'>
                  {JSON.stringify(JSON.parse(reservationsData), null, 2)}
                </Text>
              </Box>
            </Box>
          )}
        </Stack>
      );
    }

    if (activity.activityType === 'location_reservations_updated') {
      return (
        <Stack spacing={3}>
          <Box borderBottom='1px' borderColor='green.200' pb={2}>
            <Text fontWeight='bold' color='green.600'>
              💾 Location Reservations Updated in Firestore
            </Text>
            <Text fontSize='sm' color='gray.600'>
              Location ID: {details.locationId} | Date: {details.formattedDate}
            </Text>
          </Box>

          <Box>
            <Text fontSize='sm' color='green.600'>
              ✅ Successfully updated location reservations in Firestore database
            </Text>
          </Box>
        </Stack>
      );
    }

    // Handle reservation creation
    if (activity.activityType === 'reservation_create') {
      // Format date and time nicely
      const formatDateTime = (date: string, hour: string) => {
        if (!date || !hour) return 'Not specified';
        return `${date} at ${hour}`;
      };

      const startDateTime = formatDateTime(details.startDate, details.startHour);
      const endDateTime =
        details.endDate && details.endHour
          ? formatDateTime(details.endDate, details.endHour)
          : null;

      return (
        <Stack spacing={3}>
          {/* Reservation Code */}
          {details.reservationCode && (
            <Box borderBottom='1px' borderColor='gray.200' pb={2}>
              <Text fontWeight='bold'>
                Reservation:{' '}
                <Text as='span' color='blue.500'>
                  {details.reservationCode}
                </Text>
              </Text>
            </Box>
          )}

          {/* Time Information */}
          <Box>
            <Text fontWeight='bold' mb={1}>
              Reservation Details
            </Text>
            <Stack spacing={2} pl={2} borderLeft='2px' borderColor='green.400'>
              <Box>
                <Text fontWeight='medium'>Start Time</Text>
                <Text>{startDateTime}</Text>
              </Box>

              {endDateTime && (
                <Box>
                  <Text fontWeight='medium'>End Time</Text>
                  <Text>{endDateTime}</Text>
                </Box>
              )}

              <Box>
                <Text fontWeight='medium'>Customer</Text>
                <Text>
                  {details.customerName || 'Anonymous'}
                  {details.numberPeople && ` (${details.numberPeople} people)`}
                </Text>
              </Box>

              {details.from && (
                <Box>
                  <Text fontWeight='medium'>Created Via</Text>
                  <Badge colorScheme='purple'>{details.from}</Badge>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Additional Information */}
          <Box>
            <Text fontWeight='bold' mb={1}>
              Additional Information
            </Text>
            <Stack spacing={1}>
              {Object.entries(details)
                .filter(
                  ([key]) =>
                    ![
                      'reservationCode',
                      'startDate',
                      'startHour',
                      'endDate',
                      'endHour',
                      'customerName',
                      'numberPeople',
                      'from',
                    ].includes(key)
                )
                .map(([key, value]) => {
                  // Skip rendering complex nested objects directly
                  if (typeof value === 'object' && value !== null) {
                    return (
                      <Text key={key} fontSize='sm'>
                        <b>{key}:</b> {'{...}'}
                      </Text>
                    );
                  }

                  return (
                    <Text key={key} fontSize='sm'>
                      <b>{key}:</b> {String(value)}
                    </Text>
                  );
                })}
            </Stack>
          </Box>
        </Stack>
      );
    }

    // Handle reservation changes
    if (activity.activityType === 'reservation_modify') {
      // Check if we have the previousReservation/updatedReservation structure
      if (details.previousReservation && details.updatedReservation) {
        const previousReservation = details.previousReservation;
        const updatedReservation = details.updatedReservation;

        // Format date and time nicely
        const formatDateTime = (date: string, hour: string) => {
          if (!date || !hour) return 'Not specified';
          return `${date} at ${hour}`;
        };

        // Highlight time changes first
        const timeFields = [
          {
            label: 'Start Time',
            prev: formatDateTime(previousReservation.startDate, previousReservation.startHour),
            curr: formatDateTime(updatedReservation.startDate, updatedReservation.startHour),
            changed:
              previousReservation.startDate !== updatedReservation.startDate ||
              previousReservation.startHour !== updatedReservation.startHour,
          },
          {
            label: 'End Time',
            prev: formatDateTime(previousReservation.endDate, previousReservation.endHour),
            curr: formatDateTime(updatedReservation.endDate, updatedReservation.endHour),
            changed:
              previousReservation.endDate !== updatedReservation.endDate ||
              previousReservation.endHour !== updatedReservation.endHour,
          },
        ];

        // Get all other keys to compare
        const allKeys = [
          ...new Set([...Object.keys(previousReservation), ...Object.keys(updatedReservation)]),
        ].filter((key) => !['startDate', 'endDate', 'startHour', 'endHour'].includes(key));

        return (
          <Stack spacing={3}>
            {/* Show reservation code if available */}
            {(previousReservation.reservationCode || updatedReservation.reservationCode) && (
              <Box borderBottom='1px' borderColor='gray.200' pb={2}>
                <Text fontWeight='bold'>
                  Reservation:{' '}
                  {updatedReservation.reservationCode || previousReservation.reservationCode}
                </Text>
              </Box>
            )}

            {/* Time changes section */}
            <Box>
              <Text fontWeight='bold' mb={1}>
                Time Changes
              </Text>
              <Stack spacing={2}>
                {timeFields.map(
                  (field, idx) =>
                    field.changed && (
                      <Box key={idx} pl={2} borderLeft='2px' borderColor='blue.400'>
                        <Text fontWeight='medium'>{field.label}</Text>
                        <Flex gap={2} alignItems='center'>
                          <Text color='red.500'>{field.prev}</Text>
                          <Text>→</Text>
                          <Text color='green.500'>{field.curr}</Text>
                        </Flex>
                      </Box>
                    )
                )}
                {!timeFields.some((f) => f.changed) && (
                  <Text fontSize='sm' color='gray.500'>
                    No time changes
                  </Text>
                )}
              </Stack>
            </Box>

            {/* Other changes */}
            {allKeys.length > 0 && (
              <Box>
                <Text fontWeight='bold' mb={1}>
                  Other Changes
                </Text>
                <Stack spacing={2} divider={<Divider />}>
                  {allKeys
                    .map((key) => {
                      const prevVal = previousReservation[key];
                      const currVal = updatedReservation[key];
                      const hasChanged = JSON.stringify(prevVal) !== JSON.stringify(currVal);

                      if (!hasChanged) return null;

                      return (
                        <Box key={key} fontSize='sm'>
                          <Text fontWeight='medium'>{key}</Text>
                          <Flex gap={2} alignItems='center'>
                            <Text
                              color='red.500'
                              textDecoration={currVal === undefined ? 'line-through' : 'none'}
                            >
                              {prevVal !== undefined ? JSON.stringify(prevVal) : '(none)'}
                            </Text>
                            {prevVal !== undefined && currVal !== undefined && <Text>→</Text>}
                            {currVal !== undefined && (
                              <Text color='green.500'>{JSON.stringify(currVal)}</Text>
                            )}
                          </Flex>
                        </Box>
                      );
                    })
                    .filter(Boolean)}
                </Stack>
              </Box>
            )}

            {/* Customer information */}
            {details.customerName && (
              <Box mt={2} pt={2} borderTop='1px' borderColor='gray.200'>
                <Text fontSize='sm'>
                  <b>Customer:</b> {details.customerName}
                  {details.numberPeople && ` (${details.numberPeople} people)`}
                </Text>
              </Box>
            )}
          </Stack>
        );
      }

      // Try to extract before/after changes if available
      const beforeValues = details.before || {};
      const afterValues = details.after || {};

      // If we have proper before/after structure
      if (Object.keys(beforeValues).length > 0 && Object.keys(afterValues).length > 0) {
        // Get all unique keys from both objects
        const allKeys = [...new Set([...Object.keys(beforeValues), ...Object.keys(afterValues)])];

        return (
          <Stack spacing={2} divider={<Divider />}>
            {allKeys
              .map((key) => {
                const beforeVal = beforeValues[key];
                const afterVal = afterValues[key];
                const hasChanged = JSON.stringify(beforeVal) !== JSON.stringify(afterVal);

                // Skip unchanged values
                if (!hasChanged) return null;

                return (
                  <Box key={key} fontSize='sm'>
                    <Text fontWeight='bold'>{key}</Text>
                    <Flex gap={2} alignItems='center'>
                      <Text
                        color='red.500'
                        textDecoration={afterVal === undefined ? 'line-through' : 'none'}
                      >
                        {beforeVal !== undefined ? JSON.stringify(beforeVal) : '(none)'}
                      </Text>
                      {beforeVal !== undefined && afterVal !== undefined && <Text>→</Text>}
                      {afterVal !== undefined && (
                        <Text color='green.500'>{JSON.stringify(afterVal)}</Text>
                      )}
                    </Flex>
                  </Box>
                );
              })
              .filter(Boolean)}
          </Stack>
        );
      }
    }

    // Handle settings updates
    if (activity.activityType === 'settings_update') {
      // Check for before/after values
      const previousValue = details.previousValue;
      const newValue = details.newValue;
      const settingName =
        details.settingDisplayName || details.displayName || details.name || 'Setting';

      // If we have both values, display the changes
      if (previousValue !== undefined || newValue !== undefined) {
        return (
          <Stack spacing={2}>
            <Box fontSize='sm'>
              <Text fontWeight='bold'>{settingName}</Text>
              <Flex gap={2} alignItems='center'>
                <Text
                  color='red.500'
                  textDecoration={newValue !== undefined ? 'none' : 'line-through'}
                >
                  {previousValue !== undefined ? JSON.stringify(previousValue) : '(none)'}
                </Text>
                {previousValue !== undefined && newValue !== undefined && <Text>→</Text>}
                {newValue !== undefined && (
                  <Text color='green.500'>{JSON.stringify(newValue)}</Text>
                )}
              </Flex>
            </Box>

            {details.path && (
              <Text fontSize='xs' color='gray.500'>
                Path: {details.path}
              </Text>
            )}

            {details.description && <Text fontSize='xs'>{details.description}</Text>}
          </Stack>
        );
      }

      // Fallback for older format where settings might be directly on the details object
      if (details.setting || details.value) {
        return (
          <Stack spacing={1}>
            <Text fontWeight='bold'>{details.setting || 'Setting updated'}</Text>
            <Text>New value: {JSON.stringify(details.value)}</Text>
          </Stack>
        );
      }
    }

    // For payment transactions, format amount and method
    if (activity.activityType.includes('transaction_')) {
      return (
        <Stack spacing={1}>
          {details.description && (
            <Text>
              <b>Description:</b> {details.description}
            </Text>
          )}
          {details.paymentId && (
            <Text>
              <b>Payment ID:</b> {details.paymentId}
            </Text>
          )}
          {details.customer && (
            <Text>
              <b>Customer:</b> {details.customer}
            </Text>
          )}
        </Stack>
      );
    }

    // Default case - render all details as key-value pairs
    return (
      <Stack spacing={1}>
        {Object.entries(details).map(([key, value]) => {
          // Skip rendering complex nested objects directly
          if (typeof value === 'object' && value !== null) {
            return (
              <Text key={key}>
                <b>{key}:</b> {'{...}'}
              </Text>
            );
          }

          return (
            <Text key={key}>
              <b>{key}:</b> {String(value)}
            </Text>
          );
        })}
      </Stack>
    );
  };

  // Function to extract reservation code or location name
  const getContextInfo = (activity: ActivityLog) => {
    if (!activity.details) return null;

    // For reservation activities, try to get reservation code
    if (activity.activityType.includes('reservation_')) {
      // For modified reservations, check both before and after values
      if (activity.activityType === 'reservation_modify' && activity.details.after) {
        return (
          activity.details.after.reservationCode ||
          activity.details.after.code ||
          activity.details.after.id
        );
      }

      // For other reservation activities, check direct properties
      return activity.details.reservationCode || activity.details.code || activity.details.id;
    }

    // For location-specific activities

    // Try to get location name from details
    return activity.details.locationName || activity.locationId;

    return null;
  };

  // Function to get activity summary for detailed view
  const getActivitySummary = (activity: ActivityLog) => {
    const details = activity.details || {};
    let summary = {
      title: activityTypeLabels[activity.activityType] || activity.activityType,
      subtitle: '',
      keyInfo: [] as Array<{ label: string; value: string; color?: string }>,
      hasChanges: false,
      reservationCode: '',
      customerName: '',
      locationInfo: '',
    };

    // Extract reservation code
    summary.reservationCode =
      details.reservationCode || details.code || getContextInfo(activity) || '';
    summary.customerName = details.customerName || '';

    // Extract location information
    summary.locationInfo =
      details.originalReservation?.location?.name ||
      details.previousReservation?.location?.name ||
      details.updatedReservation?.location?.name ||
      details.currentLocation?.name ||
      details.newLocation?.name ||
      details.previousLocation?.name ||
      details.locationName ||
      '';

    switch (activity.activityType) {
      case 'reservation_modification_complete':
        summary.subtitle = `Comprehensive reservation modification`;
        summary.hasChanges = true;

        // Extract key modification information
        if (details.modifications) {
          const mods = details.modifications;
          let changes = [];
          if (mods.isLocationChanging) changes.push('Location');
          if (mods.isTimeChanging) changes.push('Time');
          if (mods.isNumberPeopleChanging) changes.push('People Count');

          if (changes.length > 0) {
            summary.subtitle = `Modified: ${changes.join(', ')}`;
          }
        }

        // Show previous and new states
        if (details.previousReservation && details.updatedReservation) {
          const prev = details.previousReservation;
          const updated = details.updatedReservation;

          if (details.modifications?.isLocationChanging) {
            summary.keyInfo.push({
              label: 'Location Change',
              value: `${prev.location?.name || 'Unknown'} → ${updated.location?.name || 'Unknown'}`,
              color: 'orange.500',
            });
          }

          if (details.modifications?.isTimeChanging) {
            summary.keyInfo.push({
              label: 'Time Change',
              value: `${prev.startDate} ${prev.startHour} → ${updated.startDate} ${updated.startHour}`,
              color: 'purple.500',
            });
          }

          if (details.modifications?.isNumberPeopleChanging) {
            summary.keyInfo.push({
              label: 'People Count',
              value: `${prev.numberPeople} → ${updated.numberPeople}`,
              color: 'blue.500',
            });
          }
        }

        if (details.processingTime) {
          summary.keyInfo.push({
            label: 'Processing Time',
            value: `${details.processingTime}ms`,
            color: 'gray.500',
          });
        }

        if (details.locationUpdates && details.locationUpdates.length > 0) {
          summary.keyInfo.push({
            label: 'Location Updates',
            value: `${details.locationUpdates.length} operations`,
            color: 'green.500',
          });
        }
        break;

      case 'reservation_debug_info':
        summary.subtitle = details.message || 'Debug information';
        if (details.isLocationChanging) {
          summary.keyInfo.push({
            label: 'Location Change',
            value: `${details.currentLocation?.name} → ${details.newLocation?.name}`,
            color: 'orange.500',
          });
        }
        if (details.currentDateTime && details.newDateTime) {
          const timeChange = `${details.currentDateTime.startHour} → ${details.newDateTime.startHour}`;
          if (details.currentDateTime.startHour !== details.newDateTime.startHour) {
            summary.keyInfo.push({
              label: 'Time Change',
              value: timeChange,
              color: 'purple.500',
            });
          }
        }
        break;

      case 'reservation_location_change':
        summary.subtitle = `Moved from ${details.previousLocation?.name} to ${details.newLocation?.name}`;
        summary.hasChanges = true;
        summary.keyInfo.push({
          label: 'From',
          value: details.previousLocation?.name || 'Unknown',
          color: 'red.500',
        });
        summary.keyInfo.push({
          label: 'To',
          value: details.newLocation?.name || 'Unknown',
          color: 'green.500',
        });
        break;

      case 'reservation_hour_change':
        summary.subtitle = `Time changed`;
        summary.hasChanges = true;
        if (details.previousHours && details.newHours) {
          summary.keyInfo.push({
            label: 'Previous',
            value: `${details.previousHours.startDate} ${details.previousHours.startHour}`,
            color: 'red.500',
          });
          summary.keyInfo.push({
            label: 'New',
            value: `${details.newHours.startDate} ${details.newHours.startHour}`,
            color: 'green.500',
          });
        }
        break;

      case 'reservation_create':
        summary.subtitle = `New reservation created`;
        if (details.startDate && details.startHour) {
          summary.keyInfo.push({
            label: 'Date & Time',
            value: `${details.startDate} at ${details.startHour}`,
          });
        }
        if (details.numberPeople) {
          summary.keyInfo.push({
            label: 'People',
            value: details.numberPeople.toString(),
          });
        }
        break;

      case 'reservation_cancel':
        summary.subtitle = `Cancellation initiated`;
        summary.hasChanges = true;
        if (details.cancelledBy) {
          summary.keyInfo.push({
            label: 'Cancelled By',
            value: details.cancelledBy === 'system' ? 'Admin/System' : 'Customer',
            color: 'red.600',
          });
        }
        if (details.startDate && details.startHour) {
          summary.keyInfo.push({
            label: 'Original Date & Time',
            value: `${details.startDate} at ${details.startHour}`,
          });
        }
        if (details.cancellationReason) {
          summary.keyInfo.push({
            label: 'Reason',
            value: details.cancellationReason,
            color: 'gray.600',
          });
        }
        break;

      case 'reservation_cancel_complete':
        summary.subtitle = `Cancellation completed successfully`;
        summary.hasChanges = true;
        if (details.cancellationInfo?.cancelledBy) {
          summary.keyInfo.push({
            label: 'Cancelled By',
            value: details.cancellationInfo.cancelledBy === 'system' ? 'Admin/System' : 'Customer',
            color: 'red.600',
          });
        }
        if (
          details.reservationDetails?.originalStartDate &&
          details.reservationDetails?.originalStartHour
        ) {
          summary.keyInfo.push({
            label: 'Original Date & Time',
            value: `${details.reservationDetails.originalStartDate} at ${details.reservationDetails.originalStartHour}`,
          });
        }
        if (details.locationUpdates?.hoursCleared?.length > 0) {
          summary.keyInfo.push({
            label: 'Hours Cleared',
            value: `${details.locationUpdates.hoursCleared.length} time slots`,
            color: 'green.600',
          });
        }
        break;

      case 'reservation_cancel_error':
        summary.subtitle = details.errorMessage || 'Cancellation failed';
        summary.hasChanges = true;
        if (details.attemptedOperation) {
          summary.keyInfo.push({
            label: 'Failed Operation',
            value: details.attemptedOperation,
            color: 'red.500',
          });
        }
        if (details.cancellationContext?.cancelledBy) {
          summary.keyInfo.push({
            label: 'Attempted By',
            value:
              details.cancellationContext.cancelledBy === 'system' ? 'Admin/System' : 'Customer',
            color: 'red.500',
          });
        }
        if (details.systemInfo?.timestamp) {
          summary.keyInfo.push({
            label: 'Error Time',
            value: new Date(details.systemInfo.timestamp).toLocaleString(),
            color: 'gray.500',
          });
        }
        break;

      case 'reservation_cancellation_complete':
        summary.subtitle = `Comprehensive cancellation completed`;
        summary.hasChanges = true;
        if (details.cancellationInfo?.cancelledBy) {
          summary.keyInfo.push({
            label: 'Cancelled By',
            value: details.cancellationInfo.cancelledBy === 'system' ? 'Admin/System' : 'Customer',
            color: 'red.600',
          });
        }
        if (details.originalReservation?.startDate && details.originalReservation?.startHour) {
          summary.keyInfo.push({
            label: 'Original Date & Time',
            value: `${details.originalReservation.startDate} at ${details.originalReservation.startHour}`,
          });
        }
        if (details.summary?.totalHoursCleared > 0) {
          summary.keyInfo.push({
            label: 'Hours Cleared',
            value: `${details.summary.totalHoursCleared} time slots`,
            color: 'green.600',
          });
        }
        // Show location reservations changes summary
        if (details.locationUpdates?.affectedDate) {
          summary.keyInfo.push({
            label: 'Location Data',
            value: `${details.locationUpdates.affectedDate} modified`,
            color: 'purple.600',
          });
        }
        if (details.processingTime) {
          summary.keyInfo.push({
            label: 'Processing Time',
            value: `${details.processingTime}ms`,
            color: 'gray.500',
          });
        }
        break;

      case 'reservation_cancellation_error':
        summary.subtitle = details.errorMessage || 'Comprehensive cancellation failed';
        summary.hasChanges = true;
        if (details.attemptedOperation) {
          summary.keyInfo.push({
            label: 'Failed Operation',
            value: details.attemptedOperation,
            color: 'red.500',
          });
        }
        if (details.cancellationContext?.cancelledBy) {
          summary.keyInfo.push({
            label: 'Attempted By',
            value:
              details.cancellationContext.cancelledBy === 'system' ? 'Admin/System' : 'Customer',
            color: 'red.500',
          });
        }
        if (details.originalReservation?.startDate && details.originalReservation?.startHour) {
          summary.keyInfo.push({
            label: 'Original Date & Time',
            value: `${details.originalReservation.startDate} at ${details.originalReservation.startHour}`,
            color: 'red.500',
          });
        }
        if (details.summary?.failureStage) {
          summary.keyInfo.push({
            label: 'Failure Stage',
            value: details.summary.failureStage,
            color: 'red.500',
          });
        }
        break;

      case 'reservation_modify':
        summary.subtitle = `Reservation modified`;
        summary.hasChanges = true;
        break;

      case 'reservation_cancel_location_update_before':
        summary.subtitle = `Before cancellation location update - ${details.formattedDate}`;
        summary.keyInfo.push({
          label: 'Location',
          value: details.locationId || 'Unknown',
        });
        if (details.reservationCode) {
          summary.keyInfo.push({
            label: 'For Reservation',
            value: details.reservationCode,
            color: 'blue.600',
          });
        }
        if (details.locationReservationsData?.targetReservation) {
          summary.keyInfo.push({
            label: 'Target to Remove',
            value: details.locationReservationsData.targetReservation,
            color: 'red.600',
          });
        }
        break;

      case 'reservation_cancel_location_update_after':
        summary.subtitle = `After cancellation location update - ${details.formattedDate}`;
        summary.keyInfo.push({
          label: 'Location',
          value: details.locationId || 'Unknown',
        });
        if (details.reservationCode) {
          summary.keyInfo.push({
            label: 'For Reservation',
            value: details.reservationCode,
            color: 'blue.600',
          });
        }
        if (details.locationReservationsData?.hoursAffected?.length > 0) {
          summary.keyInfo.push({
            label: 'Hours Affected',
            value: `${details.locationReservationsData.hoursAffected.length} slots`,
            color: 'green.600',
          });
        }
        break;

      case 'reservation_location_update_before':
        summary.subtitle = `Before location update - ${details.formattedDate}`;
        summary.keyInfo.push({
          label: 'Location',
          value: details.locationId || 'Unknown',
        });
        if (details.reservationCode) {
          summary.keyInfo.push({
            label: 'For Reservation',
            value: details.reservationCode,
            color: 'blue.600',
          });
        }
        break;

      case 'reservation_location_update_after':
        summary.subtitle = `After location update - ${details.formattedDate}`;
        summary.keyInfo.push({
          label: 'Location',
          value: details.locationId || 'Unknown',
        });
        if (details.reservationCode) {
          summary.keyInfo.push({
            label: 'For Reservation',
            value: details.reservationCode,
            color: 'blue.600',
          });
        }
        break;

      case 'location_reservations_updated':
        summary.subtitle = `Firestore update completed`;
        summary.keyInfo.push({
          label: 'Location',
          value: details.locationId || 'Unknown',
        });
        if (details.reservationCode) {
          summary.keyInfo.push({
            label: 'For Reservation',
            value: details.reservationCode,
            color: 'blue.600',
          });
        }
        break;

      case 'reservation_error':
      case 'location_update_error':
      case 'firestore_error':
      case 'validation_error':
      case 'general_error':
        summary.subtitle = details.errorMessage || 'An error occurred';
        summary.hasChanges = true; // Mark as important

        // Extract key error information
        if (details.attemptedOperation) {
          summary.keyInfo.push({
            label: 'Operation',
            value: details.attemptedOperation,
            color: 'red.500',
          });
        }

        if (details.formData?.date && details.formData?.startHour) {
          summary.keyInfo.push({
            label: 'Target Time',
            value: `${details.formData.date} at ${details.formData.startHour}`,
            color: 'red.500',
          });
        }

        if (
          details.locationInfo?.currentLocationId &&
          details.locationInfo?.newLocationId &&
          details.locationInfo.currentLocationId !== details.locationInfo.newLocationId
        ) {
          summary.keyInfo.push({
            label: 'Location Change',
            value: `${details.locationInfo.currentLocationId} → ${details.locationInfo.newLocationId}`,
            color: 'red.500',
          });
        }

        if (details.systemInfo?.timestamp) {
          summary.keyInfo.push({
            label: 'Error Time',
            value: new Date(details.systemInfo.timestamp).toLocaleString(),
            color: 'gray.500',
          });
        }
        break;

      default:
        summary.subtitle = activity.entityType || '';
        break;
    }

    return summary;
  };

  // Filter activities based on search and entity filter
  const getFilteredActivities = () => {
    let filtered = currentActivities;

    if (searchQuery) {
      filtered = filtered.filter((activity) => {
        const summary = getActivitySummary(activity);
        const searchTerm = searchQuery.toLowerCase();

        return (
          summary.reservationCode.toLowerCase().includes(searchTerm) ||
          summary.customerName.toLowerCase().includes(searchTerm) ||
          summary.title.toLowerCase().includes(searchTerm) ||
          summary.subtitle.toLowerCase().includes(searchTerm) ||
          activity.userEmail?.toLowerCase().includes(searchTerm) ||
          activity.locationId?.toLowerCase().includes(searchTerm)
        );
      });
    }

    if (entityFilter) {
      filtered = filtered.filter((activity) => {
        const summary = getActivitySummary(activity);
        return summary.reservationCode === entityFilter || activity.entityId === entityFilter;
      });
    }

    return filtered;
  };

  const openDetailModal = (activity: ActivityLog) => {
    setSelectedActivity(activity);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedActivity(null);
    setIsDetailModalOpen(false);
  };

  // Component for detailed modal content
  const ActivityDetailModal = ({ activity }: { activity: ActivityLog }) => {
    const summary = getActivitySummary(activity);
    const details = activity.details || {};

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
    };

    const formatJsonData = (data: any) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;

        // Sort time slots chronologically for location reservations data
        const sortedData = sortLocationReservationsData(parsed);

        return JSON.stringify(sortedData, null, 2);
      } catch {
        return String(data);
      }
    };

    const sortLocationReservationsData = (data: any): any => {
      if (!data || typeof data !== 'object') return data;

      const sortedData = { ...data };

      // Check if this looks like location reservations data (has date keys with hour objects)
      for (const key in sortedData) {
        const value = sortedData[key];

        // Check if this is a date key (YYYY-MM-DD format) with hour data
        if (typeof value === 'object' && value !== null && /^\d{4}-\d{2}-\d{2}$/.test(key)) {
          // Sort the hours chronologically
          const sortedHours: any = {};
          const hourKeys = Object.keys(value).sort((a, b) => {
            // Convert time format (HH:MM) to minutes for comparison
            const timeToMinutes = (timeStr: string) => {
              const [hours, minutes] = timeStr.split(':').map(Number);
              return hours * 60 + minutes;
            };

            return timeToMinutes(a) - timeToMinutes(b);
          });

          hourKeys.forEach((hour) => {
            sortedHours[hour] = value[hour];
          });

          sortedData[key] = sortedHours;
        }
      }

      return sortedData;
    };

    return (
      <>
        {/* Header */}
        <Box borderBottom='1px' borderColor='gray.200' pb={4} mb={4}>
          <Flex align='center' gap={3} mb={2}>
            <Badge colorScheme={getBadgeColor(activity.activityType)} fontSize='md' px={3} py={1}>
              {summary.title}
            </Badge>
            <Text fontSize='sm' color='gray.500'>
              {formatDate(activity.timestamp)}
            </Text>
          </Flex>

          <Text fontSize='lg' fontWeight='medium' mb={3}>
            {summary.subtitle}
          </Text>

          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            {summary.reservationCode && (
              <Box>
                <Text fontSize='sm' fontWeight='bold' color='blue.600'>
                  Reservation: {summary.reservationCode}
                </Text>
              </Box>
            )}
            {summary.customerName && (
              <Box>
                <Text fontSize='sm' color='gray.700'>
                  Customer: {summary.customerName}
                </Text>
              </Box>
            )}
            <Box>
              <Text fontSize='sm' color='gray.600'>
                User: {activity.userEmail || 'Anonymous'}
              </Text>
            </Box>
            {activity.locationId && (
              <Box>
                <Text fontSize='sm' color='gray.600'>
                  Location: {activity.locationId}
                </Text>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Key Information */}
        {summary.keyInfo.length > 0 && (
          <Box mb={6}>
            <Text fontSize='lg' fontWeight='bold' mb={3}>
              Key Information
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {summary.keyInfo.map((info, index) => (
                <Box key={index} p={3} borderWidth='1px' borderRadius='md' bg='gray.50'>
                  <Text fontSize='xs' fontWeight='bold' color='gray.500' mb={1}>
                    {info.label}
                  </Text>
                  <Text fontSize='sm' color={info.color || 'gray.700'} fontWeight='medium'>
                    {info.value}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Error Information */}
        {activity.activityType.endsWith('_error') && details.errorMessage && (
          <Box mb={6}>
            <Text fontSize='lg' fontWeight='bold' mb={3} color='red.600'>
              Error Details
            </Text>
            <Stack spacing={4}>
              <Box p={4} bg='red.50' borderWidth='1px' borderColor='red.200' borderRadius='md'>
                <Text fontSize='sm' fontWeight='bold' color='red.700' mb={2}>
                  Error Message
                </Text>
                <Text fontSize='sm' color='red.800'>
                  {details.errorMessage}
                </Text>
              </Box>

              {details.errorStack && (
                <Box>
                  <Flex align='center' gap={2} mb={2}>
                    <Text fontSize='sm' fontWeight='bold' color='red.700'>
                      Stack Trace
                    </Text>
                    <Button size='xs' onClick={() => copyToClipboard(details.errorStack)}>
                      Copy
                    </Button>
                  </Flex>
                  <Box
                    bg='gray.900'
                    color='white'
                    p={3}
                    borderRadius='md'
                    fontSize='xs'
                    fontFamily='mono'
                    maxH='200px'
                    overflowY='auto'
                  >
                    <Text whiteSpace='pre-wrap'>{details.errorStack}</Text>
                  </Box>
                </Box>
              )}

              {details.systemInfo && (
                <Box p={3} bg='gray.50' borderRadius='md'>
                  <Text fontSize='sm' fontWeight='bold' mb={2}>
                    System Information
                  </Text>
                  <Stack spacing={1}>
                    <Text fontSize='xs'>
                      <strong>Browser:</strong> {details.systemInfo.userAgent}
                    </Text>
                    <Text fontSize='xs'>
                      <strong>URL:</strong> {details.systemInfo.url}
                    </Text>
                    <Text fontSize='xs'>
                      <strong>Timestamp:</strong> {details.systemInfo.timestamp}
                    </Text>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* Form Data */}
        {details.formData && (
          <Box mb={6}>
            <Text fontSize='lg' fontWeight='bold' mb={3}>
              Form Data
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              {Object.entries(details.formData).map(([key, value]) => (
                <Box key={key} p={3} borderWidth='1px' borderRadius='md' bg='blue.50'>
                  <Text fontSize='xs' fontWeight='bold' color='blue.700' mb={1}>
                    {key}
                  </Text>
                  <Text fontSize='sm' color='blue.800'>
                    {String(value)}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Location Information */}
        {details.locationInfo && (
          <Box mb={6}>
            <Text fontSize='lg' fontWeight='bold' mb={3}>
              Location Information
            </Text>
            <Stack spacing={3}>
              {Object.entries(details.locationInfo).map(([key, value]) => (
                <Box key={key} p={3} borderWidth='1px' borderRadius='md' bg='orange.50'>
                  <Text fontSize='xs' fontWeight='bold' color='orange.700' mb={1}>
                    {key}
                  </Text>
                  <Text fontSize='sm' color='orange.800'>
                    {String(value)}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Reservation Linking Information */}
        {(details.linkingInfo || details.reservationCode) && (
          <Box mb={6}>
            <Text fontSize='lg' fontWeight='bold' mb={3} color='blue.600'>
              🔗 Reservation Linking
            </Text>
            <Stack spacing={3}>
              {details.reservationCode && (
                <Box p={3} borderWidth='2px' borderColor='blue.300' borderRadius='md' bg='blue.50'>
                  <Text fontSize='sm' fontWeight='bold' color='blue.700' mb={1}>
                    Reservation Code
                  </Text>
                  <Text fontSize='lg' color='blue.800' fontFamily='mono' fontWeight='bold'>
                    {details.reservationCode}
                  </Text>
                </Box>
              )}

              {details.linkingInfo && (
                <Box p={3} borderWidth='1px' borderColor='blue.200' borderRadius='md' bg='blue.25'>
                  <Text fontSize='sm' fontWeight='bold' color='blue.700' mb={2}>
                    Linking Context
                  </Text>
                  {Object.entries(details.linkingInfo).map(([key, value]) => (
                    <Text key={key} fontSize='sm' color='blue.800' mb={1}>
                      <strong>{key}:</strong> {String(value)}
                    </Text>
                  ))}
                </Box>
              )}

              {details.message && (
                <Box p={3} borderWidth='1px' borderColor='blue.200' borderRadius='md' bg='blue.25'>
                  <Text fontSize='sm' fontWeight='bold' color='blue.700' mb={1}>
                    Context Message
                  </Text>
                  <Text fontSize='sm' color='blue.800'>
                    {details.message}
                  </Text>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* Location Reservations Data (Before/After) */}
        {(details.locationReservationsData || details.locationUpdates) && (
          <Box mb={6}>
            <Text fontSize='lg' fontWeight='bold' mb={3} color='indigo.600'>
              🗂️ Location Reservations Data Changes
            </Text>
            <Box p={3} borderWidth='1px' borderRadius='md' bg='indigo.50' mb={3}>
              <Text fontSize='sm' fontWeight='bold' color='indigo.700' mb={1}>
                Affected Location:{' '}
                {details.locationReservationsData?.affectedLocationId ||
                  details.locationUpdates?.locationId ||
                  activity.locationId}
              </Text>
              <Text fontSize='xs' color='gray.600'>
                Affected Dates:{' '}
                {details.locationReservationsData?.affectedDates?.join(', ') ||
                  details.locationUpdates?.affectedDate ||
                  'N/A'}
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
              {/* Before Update */}
              <Box>
                <Flex align='center' gap={2} mb={2}>
                  <Text fontSize='md' fontWeight='bold' color='red.700'>
                    📋 Before Update
                  </Text>
                  <Button
                    size='xs'
                    onClick={() => {
                      const data =
                        details.locationReservationsData?.beforeUpdate ||
                        details.locationUpdates?.beforeUpdate;
                      const sortedData = sortLocationReservationsData(data);
                      copyToClipboard(JSON.stringify(sortedData, null, 2));
                    }}
                  >
                    Copy JSON
                  </Button>
                </Flex>
                <Box
                  bg='red.50'
                  borderWidth='2px'
                  borderColor='red.200'
                  p={3}
                  borderRadius='md'
                  fontSize='xs'
                  fontFamily='mono'
                  maxH='400px'
                  overflowY='auto'
                >
                  <Text whiteSpace='pre-wrap'>
                    {formatJsonData(
                      details.locationReservationsData?.beforeUpdate ||
                        details.locationUpdates?.beforeUpdate
                    )}
                  </Text>
                </Box>
              </Box>

              {/* After Update */}
              <Box>
                <Flex align='center' gap={2} mb={2}>
                  <Text fontSize='md' fontWeight='bold' color='green.700'>
                    📋 After Update
                  </Text>
                  <Button
                    size='xs'
                    onClick={() => {
                      const data =
                        details.locationReservationsData?.afterUpdate ||
                        details.locationUpdates?.afterUpdate;
                      const sortedData = sortLocationReservationsData(data);
                      copyToClipboard(JSON.stringify(sortedData, null, 2));
                    }}
                  >
                    Copy JSON
                  </Button>
                </Flex>
                <Box
                  bg='green.50'
                  borderWidth='2px'
                  borderColor='green.200'
                  p={3}
                  borderRadius='md'
                  fontSize='xs'
                  fontFamily='mono'
                  maxH='400px'
                  overflowY='auto'
                >
                  <Text whiteSpace='pre-wrap'>
                    {formatJsonData(
                      details.locationReservationsData?.afterUpdate ||
                        details.locationUpdates?.afterUpdate
                    )}
                  </Text>
                </Box>
              </Box>
            </SimpleGrid>

            {/* Summary of Changes */}
            <Box mt={4} p={3} borderWidth='1px' borderRadius='md' bg='yellow.50'>
              <Text fontSize='sm' fontWeight='bold' color='yellow.700' mb={2}>
                📊 Data Change Summary
              </Text>
              <Stack spacing={1}>
                <Text fontSize='xs' color='yellow.800'>
                  <strong>Location:</strong>{' '}
                  {details.locationReservationsData?.affectedLocationId ||
                    details.locationUpdates?.locationId ||
                    activity.locationId}
                </Text>
                <Text fontSize='xs' color='yellow.800'>
                  <strong>Dates Modified:</strong>{' '}
                  {details.locationReservationsData?.affectedDates?.join(', ') ||
                    details.locationUpdates?.affectedDate ||
                    'N/A'}
                </Text>
                <Text fontSize='xs' color='yellow.800'>
                  <strong>Before Keys:</strong>{' '}
                  {
                    Object.keys(
                      details.locationReservationsData?.beforeUpdate ||
                        details.locationUpdates?.beforeUpdate ||
                        {}
                    ).length
                  }{' '}
                  dates
                </Text>
                <Text fontSize='xs' color='yellow.800'>
                  <strong>After Keys:</strong>{' '}
                  {
                    Object.keys(
                      details.locationReservationsData?.afterUpdate ||
                        details.locationUpdates?.afterUpdate ||
                        {}
                    ).length
                  }{' '}
                  dates
                </Text>
              </Stack>
            </Box>

            {/* Detailed Hour-by-Hour Analysis */}
            {(details.locationReservationsData?.beforeUpdate ||
              details.locationUpdates?.beforeUpdate) &&
              (details.locationReservationsData?.afterUpdate ||
                details.locationUpdates?.afterUpdate) && (
                <Box mt={4} p={3} borderWidth='1px' borderRadius='md' bg='blue.50'>
                  <Text fontSize='sm' fontWeight='bold' color='blue.700' mb={3}>
                    🔍 Detailed Hour-by-Hour Changes
                  </Text>
                  {(() => {
                    const before =
                      details.locationReservationsData?.beforeUpdate ||
                      details.locationUpdates?.beforeUpdate;
                    const after =
                      details.locationReservationsData?.afterUpdate ||
                      details.locationUpdates?.afterUpdate;
                    const analysisResults = [];

                    for (const date in before) {
                      if (before[date] && typeof before[date] === 'object') {
                        // Sort hours chronologically for this date
                        const sortedHours = Object.keys(before[date]).sort((a, b) => {
                          const timeToMinutes = (timeStr: string) => {
                            const [hours, minutes] = timeStr.split(':').map(Number);
                            return hours * 60 + minutes;
                          };
                          return timeToMinutes(a) - timeToMinutes(b);
                        });

                        for (const hour of sortedHours) {
                          const beforeHour = before[date][hour] || [];
                          const afterHour = after[date]?.[hour] || [];

                          if (JSON.stringify(beforeHour) !== JSON.stringify(afterHour)) {
                            analysisResults.push({
                              date,
                              hour,
                              before: beforeHour,
                              after: afterHour,
                              action:
                                beforeHour.length > afterHour.length
                                  ? 'removed'
                                  : beforeHour.length < afterHour.length
                                  ? 'added'
                                  : 'modified',
                            });
                          }
                        }
                      }
                    }

                    return analysisResults.length > 0 ? (
                      <Stack spacing={2}>
                        {analysisResults.map((change, idx) => (
                          <Box key={idx} p={2} bg='white' borderRadius='md' borderWidth='1px'>
                            <Flex align='center' gap={2} mb={1}>
                              <Badge
                                colorScheme={
                                  change.action === 'removed'
                                    ? 'red'
                                    : change.action === 'added'
                                    ? 'green'
                                    : 'orange'
                                }
                                size='sm'
                              >
                                {change.action.toUpperCase()}
                              </Badge>
                              <Text fontSize='xs' fontWeight='bold'>
                                {change.date} at {change.hour}
                              </Text>
                            </Flex>
                            <Stack spacing={1}>
                              <Text fontSize='xs'>
                                <strong>Before:</strong> [{change.before.join(', ')}] (
                                {change.before.length} reservations)
                              </Text>
                              <Text fontSize='xs'>
                                <strong>After:</strong> [{change.after.join(', ')}] (
                                {change.after.length} reservations)
                              </Text>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Text fontSize='xs' color='gray.600'>
                        No hour-level changes detected
                      </Text>
                    );
                  })()}
                </Box>
              )}
          </Box>
        )}

        {/* JSON Data Sections */}
        {(details.allReservationsBeforeUpdate || details.allReservationsAfterUpdate) && (
          <Box mb={6}>
            <Text fontSize='lg' fontWeight='bold' mb={3}>
              Reservations Data
            </Text>
            <Stack spacing={4}>
              {details.allReservationsBeforeUpdate && (
                <Box>
                  <Flex align='center' gap={2} mb={2}>
                    <Text fontSize='md' fontWeight='bold' color='yellow.700'>
                      Before Update
                    </Text>
                    <Button
                      size='xs'
                      onClick={() => copyToClipboard(details.allReservationsBeforeUpdate)}
                    >
                      Copy JSON
                    </Button>
                  </Flex>
                  <Box
                    bg='yellow.50'
                    borderWidth='1px'
                    borderColor='yellow.200'
                    p={3}
                    borderRadius='md'
                    fontSize='xs'
                    fontFamily='mono'
                    maxH='300px'
                    overflowY='auto'
                  >
                    <Text whiteSpace='pre-wrap'>
                      {formatJsonData(details.allReservationsBeforeUpdate)}
                    </Text>
                  </Box>
                </Box>
              )}

              {details.allReservationsAfterUpdate && (
                <Box>
                  <Flex align='center' gap={2} mb={2}>
                    <Text fontSize='md' fontWeight='bold' color='cyan.700'>
                      After Update
                    </Text>
                    <Button
                      size='xs'
                      onClick={() => copyToClipboard(details.allReservationsAfterUpdate)}
                    >
                      Copy JSON
                    </Button>
                  </Flex>
                  <Box
                    bg='cyan.50'
                    borderWidth='1px'
                    borderColor='cyan.200'
                    p={3}
                    borderRadius='md'
                    fontSize='xs'
                    fontFamily='mono'
                    maxH='300px'
                    overflowY='auto'
                  >
                    <Text whiteSpace='pre-wrap'>
                      {formatJsonData(details.allReservationsAfterUpdate)}
                    </Text>
                  </Box>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* Other Details */}
        <Box>
          <Text fontSize='lg' fontWeight='bold' mb={3}>
            Additional Details
          </Text>
          {formatDetails(activity)}
        </Box>
      </>
    );
  };

  return (
    <Box>
      <Heading size='md' mb={4}>
        Activity Logs
      </Heading>

      <Box mb={6} p={4} bg='gray.50' borderRadius='md'>
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={4}>
          <FormControl>
            <FormLabel>Company</FormLabel>
            <Select
              placeholder='Select company'
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              isDisabled={loadingCompanies}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input
              type='date'
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>End Date</FormLabel>
            <Input
              type='date'
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
          </FormControl>

          <FormControl alignSelf='flex-end'>
            <Button onClick={handleApplyFilters} colorScheme='blue' isLoading={loading} mb='1px'>
              Apply Filters
            </Button>
          </FormControl>
        </Flex>

        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <FormControl>
            <FormLabel>Search</FormLabel>
            <Input
              placeholder='Search by reservation code, customer name, email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Reservation Code</FormLabel>
            <Input
              placeholder='Filter by specific reservation'
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>View Mode</FormLabel>
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'table' | 'cards')}
            >
              <option value='cards'>Detailed Cards</option>
              <option value='table'>Compact Table</option>
            </Select>
          </FormControl>
        </Flex>
      </Box>

      <Flex gap={4} align='center' mb={4}>
        <Text fontWeight='medium'>
          {totalCount > 0
            ? `${totalCount} records found`
            : `${getFilteredActivities().length} records found`}
          {totalCount > itemsPerPage && (
            <Text as='span' color='gray.600' fontWeight='normal'>
              {' '}
              (showing {itemsPerPage} per page)
            </Text>
          )}
        </Text>
        <HStack>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            size='sm'
            width='200px'
          >
            <option value='all'>All Activities</option>
            <option value='reservations'>Reservations</option>
            <option value='settings'>Settings & Forms</option>
            <option value='schedule'>Schedule & Dates</option>
          </Select>
        </HStack>
      </Flex>

      {loading ? (
        <Flex justify='center' align='center' height='200px'>
          <Spinner />
        </Flex>
      ) : getFilteredActivities().length === 0 ? (
        <Text>No activity logs found for the selected filters.</Text>
      ) : viewMode === 'cards' ? (
        <Stack spacing={4}>
          {getFilteredActivities().map((activity) => {
            const summary = getActivitySummary(activity);
            return (
              <Box
                key={activity.id}
                borderWidth='1px'
                borderRadius='lg'
                p={5}
                bg='white'
                shadow='sm'
                _hover={{ shadow: 'md' }}
              >
                <Flex direction={{ base: 'column', lg: 'row' }} gap={4}>
                  {/* Left Column - Main Info */}
                  <Box flex={1}>
                    <Flex align='center' gap={3} mb={3}>
                      <Badge
                        colorScheme={getBadgeColor(activity.activityType)}
                        fontSize='sm'
                        px={3}
                        py={1}
                      >
                        {summary.title}
                      </Badge>
                      <Text fontSize='sm' color='gray.500'>
                        {formatDate(activity.timestamp)}
                      </Text>
                    </Flex>

                    <Text fontSize='lg' fontWeight='medium' mb={2}>
                      {summary.subtitle}
                    </Text>

                    <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={3}>
                      {summary.reservationCode && (
                        <Box>
                          <Text fontSize='sm' fontWeight='bold' color='blue.600'>
                            Reservation: {summary.reservationCode}
                          </Text>
                        </Box>
                      )}
                      {summary.customerName && (
                        <Box>
                          <Text fontSize='sm' color='gray.700'>
                            Customer: {summary.customerName}
                          </Text>
                        </Box>
                      )}
                      <Box>
                        <Text fontSize='sm' color='gray.600'>
                          User: {activity.userEmail || 'Anonymous'}
                        </Text>
                      </Box>
                      {activity.locationId && (
                        <Box>
                          <Text fontSize='sm' color='purple.600' fontWeight='medium'>
                            Location: {summary.locationInfo || activity.locationId}
                          </Text>
                        </Box>
                      )}
                    </Stack>

                    {/* Key Information */}
                    {summary.keyInfo.length > 0 && (
                      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={3}>
                        {summary.keyInfo.map((info, index) => (
                          <Box key={index}>
                            <Text fontSize='xs' fontWeight='bold' color='gray.500' mb={1}>
                              {info.label}
                            </Text>
                            <Text
                              fontSize='sm'
                              color={info.color || 'gray.700'}
                              fontWeight='medium'
                            >
                              {info.value}
                            </Text>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>

                  {/* Right Column - Details */}
                  <Box minW={{ base: 'auto', lg: '300px' }}>
                    {activity.details ? (
                      <Box
                        borderLeft={{ base: 'none', lg: '1px' }}
                        borderTop={{ base: '1px', lg: 'none' }}
                        borderColor='gray.200'
                        pl={{ base: 0, lg: 4 }}
                        pt={{ base: 4, lg: 0 }}
                      >
                        <Button
                          size='sm'
                          colorScheme='blue'
                          variant='outline'
                          onClick={() => openDetailModal(activity)}
                          leftIcon={<ViewIcon />}
                        >
                          View Details
                        </Button>
                      </Box>
                    ) : (
                      <Text fontSize='xs' color='gray.500'>
                        No details
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <>
          <Box overflowX='auto'>
            <Table variant='simple' size='sm'>
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Activity</Th>
                  <Th>User</Th>
                  <Th>Entity</Th>
                  <Th>Context</Th>
                  <Th>Details</Th>
                </Tr>
              </Thead>
              <Tbody>
                {getFilteredActivities().map((activity) => (
                  <Tr key={activity.id}>
                    <Td>{formatDate(activity.timestamp)}</Td>
                    <Td>
                      <Badge colorScheme={getBadgeColor(activity.activityType)}>
                        {activityTypeLabels[activity.activityType] || activity.activityType}
                      </Badge>
                      {activity.amount && (
                        <Text fontSize='xs' mt={1}>
                          ${activity.amount} - {activity.paymentMethod}
                        </Text>
                      )}
                    </Td>
                    <Td>{activity.userEmail || 'Anonymous'}</Td>
                    <Td>{activity.entityType || 'N/A'}</Td>
                    <Td>
                      {getContextInfo(activity) ? (
                        <Text fontSize='sm' fontFamily='mono'>
                          {getContextInfo(activity)}
                        </Text>
                      ) : (
                        <Text fontSize='xs' color='gray.500'>
                          -
                        </Text>
                      )}
                    </Td>
                    <Td>
                      {activity.details ? (
                        <Button
                          size='xs'
                          colorScheme='blue'
                          variant='outline'
                          onClick={() => openDetailModal(activity)}
                          leftIcon={<ViewIcon />}
                        >
                          Details
                        </Button>
                      ) : (
                        <Text fontSize='xs' color='gray.500'>
                          No details
                        </Text>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      )}

      {/* Pagination Controls */}
      {(totalCount > itemsPerPage || hasNextPage || hasPrevPage) && (
        <Flex justify='space-between' align='center' mt={6} p={4} bg='gray.50' borderRadius='md'>
          <Text fontSize='sm' color='gray.600'>
            Showing{' '}
            {Math.min(
              (currentPage - 1) * itemsPerPage + 1,
              totalCount || getFilteredActivities().length
            )}{' '}
            to {Math.min(currentPage * itemsPerPage, totalCount || getFilteredActivities().length)}{' '}
            of {totalCount || getFilteredActivities().length} results
          </Text>

          <ButtonGroup size='sm' isAttached variant='outline'>
            <IconButton
              aria-label='Previous page'
              icon={<ChevronLeftIcon />}
              onClick={handlePreviousPage}
              isDisabled={!hasPrevPage}
            />

            {/* Page numbers - simplified for server-side pagination */}
            <Button colorScheme='blue' variant='solid'>
              {currentPage}
            </Button>

            <IconButton
              aria-label='Next page'
              icon={<ChevronRightIcon />}
              onClick={handleNextPage}
              isDisabled={!hasNextPage}
            />
          </ButtonGroup>
        </Flex>
      )}

      {/* Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} size='6xl'>
        <ModalOverlay />
        <ModalContent maxH='90vh'>
          <ModalHeader>Activity Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY='auto'>
            {selectedActivity && <ActivityDetailModal activity={selectedActivity} />}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeDetailModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ActivityLogs;
