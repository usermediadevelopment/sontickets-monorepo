'use client';

import { useState, useEffect } from 'react';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import {
  Box,
  Flex,
  Heading,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
} from '@chakra-ui/react';
import DateRangeComp from '~/components/Date/DateRange';
import PerformanceChart from './components/PerformanceChart';
import Locations from '~/pages/shared/components/Locations';
import { useAuth } from '~/hooks/useAuth';

import WhatsatppLeads from './components/WhatsatppLeads';
// Define types for our data
interface ChartDataPoint {
  month: string;
  date: Date;
  value: number;
}

interface TabData {
  metric: number;
  description: string;
  chartData: ChartDataPoint[];
}

interface TabDataState {
  [key: string]: TabData;
}

export default function PerformanceDashboard() {
  // Tab state
  const [tabIndex, setTabIndex] = useState(0); // Start with "Direcciones" tab

  const { user } = useAuth();

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: startOfDay(subDays(new Date(), 30)), // Oct 1, 2024
    endDate: endOfDay(new Date()), // Mar 31, 2025
  });

  const [selectedLocation, setSelectedLocation] = useState<string>();

  // Tab data state
  const [tabData, setTabData] = useState<TabDataState>({
    details: {
      metric: 1245,
      description: 'Leads de Whatsapp',
      chartData: [],
    },
    calls: {
      metric: 324,
      description: 'Clics en el botón de llamada desde tu Perfil de Negocio',
      chartData: [],
    },
    reservations: {
      metric: 156,
      description: 'Reservas realizadas desde tu Perfil de Negocio',
      chartData: [],
    },
    directions: {
      metric: 798,
      description:
        'Solicitudes de instrucciones sobre cómo llegar realizadas desde tu Perfil de Negocio',
      chartData: [],
    },
    websiteClicks: {
      metric: 432,
      description: 'Clics en el sitio web desde tu Perfil de Negocio',
      chartData: [],
    },
  });

  // Helper function to get months between dates
  const getMonthsBetweenDates = (startDate: Date, endDate: Date) => {
    const months = [];
    const monthNames = [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ];

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const monthStr = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      months.push({
        label: monthStr,
        date: new Date(currentDate),
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  };

  // Generate chart data based on the selected date range
  const generateChartData = (range: { startDate: Date; endDate: Date }) => {
    // Generate months between start and end dates
    const months = getMonthsBetweenDates(range.startDate, range.endDate);

    // Create new data for each tab
    const newTabData: TabDataState = {
      details: {
        metric: 0,
        description: 'Visitas a tu Perfil de Negocio',
        chartData: [],
      },
      calls: {
        metric: 0,
        description: 'Llamadas realizadas desde tu Perfil de Negocio',
        chartData: [],
      },
      reservations: {
        metric: 0,
        description: 'Reservas realizadas desde tu Perfil de Negocio',
        chartData: [],
      },
      directions: {
        metric: 0,
        description:
          'Solicitudes de instrucciones sobre cómo llegar realizadas desde tu Perfil de Negocio',
        chartData: [],
      },
      websiteClicks: {
        metric: 0,
        description: 'Clics en el sitio web desde tu Perfil de Negocio',
        chartData: [],
      },
    };

    // Generate random data for each tab and month
    Object.keys(newTabData).forEach((tabKey) => {
      const tabMetricMultiplier =
        {
          details: 5,
          calls: 1.5,
          reservations: 0.8,
          directions: 4,
          websiteClicks: 2.2,
        }[tabKey] || 1;

      newTabData[tabKey].chartData = months.map((month) => {
        // Generate a value that's somewhat consistent but with variation
        const baseValue = 50 + Math.floor(Math.random() * 100);
        const value = Math.floor(baseValue * tabMetricMultiplier);

        return {
          month: month.label,
          date: month.date,
          value: value,
        };
      });

      // Update the metric to be the sum of all values
      newTabData[tabKey].metric = newTabData[tabKey].chartData.reduce(
        (sum, item) => sum + item.value,
        0
      );
    });

    return newTabData;
  };

  // Update chart data when date range changes
  useEffect(() => {
    const newTabData = generateChartData(dateRange);
    setTabData(newTabData);
  }, [dateRange]);

  return (
    <Box>
      {/* Header */}
      {/*     <Flex
        justify='space-between'
        align='center'
        p={4}
        borderBottom='1px solid'
        borderColor='gray.700'
      >
        <Flex align='center'>
          <Heading size='md'>Rendimiento</Heading>
        </Flex>
        <Flex>
          <IconButton aria-label='More options' variant='ghost' color='white' mr={2} />
          <IconButton aria-label='Close' variant='ghost' color='white' />
        </Flex>
      </Flex> */}
      <Flex p={5}>
        {/* Date Range Selector */}
        <Box width={{ base: '100%', md: '250px' }}>
          <Locations
            companyUid={user.company?.id}
            onChange={(id) => {
              console.log('Selected location:', id);
              setSelectedLocation(id);
            }}
          />

          <Divider my={8} border={0} />

          <DateRangeComp
            startItem={{
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
              key: 'selection',
            }}
            onChange={(item) => {
              setDateRange({
                startDate: startOfDay(item.selection.startDate ?? new Date()),
                endDate: endOfDay(item.selection.endDate ?? new Date()),
              });
            }}
          />
        </Box>
        <Box flex='1' bg='white'>
          {/* Tabs */}
          <Tabs index={tabIndex} onChange={setTabIndex} variant='unstyled' isLazy>
            <TabList
              borderBottom='1px solid'
              borderColor='gray.300'
              overflowX='auto'
              css={{
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              <Tab
                _selected={{
                  color: 'teal.600',
                  borderBottom: '2px solid',
                  borderColor: 'teal.600',
                }}
                fontWeight='medium'
                px={4}
                py={3}
              >
                Whatsapp
              </Tab>
              <Tab
                _selected={{
                  color: 'teal.600',
                  borderBottom: '2px solid',
                  borderColor: 'teal.600',
                }}
                fontWeight='medium'
                px={4}
                py={3}
              >
                Llamadas
              </Tab>

              <Tab
                _selected={{
                  color: 'teal.600',
                  borderBottom: '2px solid',
                  borderColor: 'teal.600',
                }}
                fontWeight='medium'
                px={4}
                py={3}
              >
                Direcciones
              </Tab>
            </TabList>

            <TabPanels>
              {/* Generate tab panels dynamically */}
              {Object.keys(tabData).map((key, index) => (
                <TabPanel key={key} p={0}>
                  <Box p={6}>
                    {index === 0 && (
                      <WhatsatppLeads
                        locationId={selectedLocation ?? ''}
                        dateRange={{
                          startDate: dateRange.startDate.toISOString(),
                          endDate: dateRange.endDate.toISOString(),
                        }}
                      />
                    )}

                    {index !== 0 && (
                      <>
                        <Heading size='xl' mb={2}>
                          {tabData[key].metric}
                        </Heading>
                        <Text color='gray.300' mb={6}>
                          {tabData[key].description}
                        </Text>
                        <Box h='300px'>
                          <PerformanceChart data={tabData[key].chartData} />
                        </Box>
                      </>
                    )}
                  </Box>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Box>
  );
}
