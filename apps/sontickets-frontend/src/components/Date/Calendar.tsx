import { Calendar } from 'react-date-range';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import esLocale from 'date-fns/locale/es';
import { Heading, VStack } from '@chakra-ui/react';
import { useState } from 'react';

type DateRangeCompProps = {
  onChange: (item: Date) => void;
};

const CalendarPicker = ({ onChange }: DateRangeCompProps) => {
  const [date, setDate] = useState(new Date());
  const handleOnChange = (date: Date) => {
    setDate(date);
    onChange(date);
  };

  return (
    <VStack spacing={2} justifyContent='flex-start' alignItems={'flex-start'}>
      <Heading fontSize={'large'}>Fecha</Heading>
      {/* @ts-expect-error - Calendar component type incompatibility */}
      <Calendar
        locale={esLocale}
        date={date}
        onChange={handleOnChange}
        className='calendarElement'
      />
    </VStack>
  );
};

export default CalendarPicker;
