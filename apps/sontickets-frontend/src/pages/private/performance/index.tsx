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

import { ButtonType, SBInteractionService } from '@package/sontickets-services';
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
    address: {
      metric: 1245,
      description: 'Leads de Whatsapp',
      chartData: [],
    },
    calls: {
      metric: 324,
      description: 'Clics en el botón de llamada desde tu Perfil de Negocio',
      chartData: [],
    },
    share: {
      metric: 798,
      description: 'Compartidos realizados desde tu Perfil de Negocio',
      chartData: [],
    },
  });

  // Generate chart data based on the selected date range
  const generateChartData = async () => {
    // Generate months between start and end dates

    // Create new data for each tab
    const newTabData: TabDataState = {
      details: {
        metric: 0,
        description: 'Visitas a tu Perfil de Negocio',
        chartData: [],
      },
      directions: {
        metric: 0,
        description:
          'Solicitudes de instrucciones sobre cómo llegar realizadas desde tu Perfil de Negocio',
        chartData: [],
      },
      calls: {
        metric: 0,
        description: 'Llamadas realizadas desde tu Perfil de Negocio',
        chartData: [],
      },
    };

    const response = await SBInteractionService.get({
      restaurant_id: user.company?.id,
      location_id: selectedLocation,
      start_date: dateRange.startDate.toISOString(),
      end_date: dateRange.endDate.toISOString(),
    });

    const interactions = response.data ?? [];

    const calls = interactions.filter((interaction) => {
      return interaction.button_type == ButtonType.CALL;
    });

    newTabData.calls.metric = calls.length;

    const directions = interactions.filter((interaction) => {
      return interaction.button_type == ButtonType.DIRECTION;
    });

    newTabData.directions.metric = directions.length;

    setTabData(newTabData);
  };

  // Update chart data when date range changes
  useEffect(() => {
    generateChartData();
  }, [dateRange, selectedLocation]);

  return (
    <Box>
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
                Direcciones
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
                LLamadas
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
                        <Text mb={6}>{tabData[key].description}</Text>
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
