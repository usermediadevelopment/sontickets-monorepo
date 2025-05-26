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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Tooltip,
  IconButton,
  Stack,
  Divider,
  ButtonGroup,
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
import { InfoOutlineIcon, ViewIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

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
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);

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
    if (activityType.startsWith('reservation_')) return 'blue';
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

  return (
    <Box>
      <Heading size='md' mb={4}>
        Activity Logs
      </Heading>

      <Box mb={6} p={4} bg='gray.50' borderRadius='md'>
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
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
      </Box>

      <Flex gap={4} align='center' mb={4}>
        <Text fontWeight='medium'>
          {totalCount > 0
            ? `${totalCount} records found`
            : `${filteredActivities.length} records found`}
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
      ) : filteredActivities.length === 0 ? (
        <Text>No activity logs found for the selected filters.</Text>
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
                {currentActivities.map((activity) => (
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
                        <Popover placement='left' isLazy>
                          <PopoverTrigger>
                            <IconButton
                              aria-label='View details'
                              icon={<ViewIcon />}
                              size='xs'
                              variant='outline'
                            />
                          </PopoverTrigger>
                          <PopoverContent width='auto' maxWidth='400px'>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverBody p={4}>
                              <Heading size='xs' mb={2}>
                                {activity.entityType ? `${activity.entityType} Details` : 'Details'}
                                {activity.entityId && (
                                  <Tooltip label={activity.entityId} placement='top'>
                                    <InfoOutlineIcon ml={1} boxSize={3} />
                                  </Tooltip>
                                )}
                              </Heading>
                              {formatDetails(activity)}
                            </PopoverBody>
                          </PopoverContent>
                        </Popover>
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

          {/* Pagination Controls */}
          {(totalCount > itemsPerPage || hasNextPage || hasPrevPage) && (
            <Flex
              justify='space-between'
              align='center'
              mt={4}
              p={4}
              bg='gray.50'
              borderRadius='md'
            >
              <Text fontSize='sm' color='gray.600'>
                Showing{' '}
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  totalCount || filteredActivities.length
                )}{' '}
                to {Math.min(currentPage * itemsPerPage, totalCount || filteredActivities.length)}{' '}
                of {totalCount || filteredActivities.length} results
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
        </>
      )}
    </Box>
  );
};

export default ActivityLogs;
