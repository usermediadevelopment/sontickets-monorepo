import { useMemo, useState } from 'react';
import { DateRange, RangeKeyDict } from 'react-date-range';
import format from 'date-fns/format';
import esLocale from 'date-fns/locale/es';
import { Box, Heading, Input, Popover, PopoverContent, PopoverTrigger } from '@chakra-ui/react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './DateRange.style.css';
export type StartItemType = {
  startDate: Date;
  endDate: Date;
  key: string;
};
type DateRangeCompProps = {
  onChange: (item: RangeKeyDict) => void;
  startItem: StartItemType;
};

const initialStart = {
  startDate: new Date(),
  endDate: new Date(),
  key: 'selection',
};

const DateRangeComp = ({ onChange, startItem = initialStart }: DateRangeCompProps) => {
  // date state
  const [range, setRange] = useState<any>([startItem]);

  const dateRangePicked = useMemo(() => {
    return `${format(range[0].startDate, 'dd/MMM/yyyy')} - ${format(
      range[0].endDate,
      'dd/MMM/yyyy'
    )}`;
  }, [range]);

  const handleOnChange = (item: RangeKeyDict) => {
    setRange([item.selection]);
    onChange(item);
  };

  return (
    <Box>
      <Heading mb={2} fontSize={'large'}>
        Fechas
      </Heading>
      <Popover>
        <PopoverTrigger>
          <Input
            height={'35px'}
            width={'260px'}
            fontSize={12}
            value={dateRangePicked}
            readOnly
            className='inputBox'
          />
        </PopoverTrigger>
        <PopoverContent>
          {/* @ts-expect-error - DateRange component type incompatibility */}
          <DateRange
            ref={undefined}
            onChange={handleOnChange}
            editableDateInputs={true}
            moveRangeOnFirstSelection={false}
            ranges={range}
            months={1}
            direction='vertical'
            className='calendarElement'
            locale={esLocale}
            showPreview
          />
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default DateRangeComp;
