import { EditIcon } from '@chakra-ui/icons';
import { Box, Card, CardBody, Flex, Heading, IconButton } from '@chakra-ui/react';
import type { Identifier, XYCoord } from 'dnd-core';
import type { FC } from 'react';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FormField } from '~/core/types';

export const ItemTypes = {
  CARD: 'card',
};

export interface CardProps {
  field: FormField;
  isSelected: boolean;
  onClick: () => void;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const CardField: FC<CardProps> = ({ field, isSelected, onClick, index, moveCard }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },

    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action

      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id: field.slug, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <Card
      ref={ref}
      opacity={opacity}
      bg={isSelected ? '#2b7a7b' : 'white'}
      textColor={isSelected ? 'white' : 'black'}
      _hover={{
        bg: '#2b7a7b',
        opacity: '0.9',
        cursor: 'pointer',
        textColor: 'white',
      }}
      onClick={onClick}
      data-handler-id={handlerId}
    >
      <CardBody py={2}>
        <Flex gap='4'>
          <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap'>
            <Box>
              <Heading size='sm'>{field.name.es}</Heading>
            </Box>
          </Flex>
          <IconButton
            _hover={{ bgColor: '#2b7a7b' }}
            variant='ghost'
            colorScheme='gray'
            aria-label='Edit'
            icon={<EditIcon />}
          />
        </Flex>
      </CardBody>
    </Card>
  );
};
