import { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";

// Import Swiper React components
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
// Import Swiper styles
import "swiper/css";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Asset } from "@/types/sanity.custom.type";

type ImageSwiperProps = {
  photos: Asset[];
  restaurantName: string;
  width?: number;
  height?: number;
};

const ImageSwiper = ({
  photos,
  restaurantName,
  width = 600,
  height = 300,
}: ImageSwiperProps) => {
  const swiperRef = useRef(null);

  return (
    <Swiper
      ref={swiperRef}
      navigation
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      breakpoints={{
        640: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      }}
    >
      <SwiperButtonsC photosNumber={photos.length} />
      {photos.map((photo, index) => {
        return (
          <SwiperSlide key={`index-${index}`}>
            <Image
              priority
              src={photo?.asset?.url}
              alt={restaurantName}
              width={width}
              height={height}
              style={{
                width,
                height,
              }}
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default memo(ImageSwiper);

const SwiperButtons = ({ photosNumber }: { photosNumber: number }) => {
  const swiper = useSwiper();
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    swiper.on("slideChange", () => {
      setIsBeginning(swiper.isBeginning);
      setIsEnd(swiper.isEnd);
    });
  }, [swiper]);

  return (
    <div className="">
      {!isBeginning && (
        <div className="swiper-button-prev absolute z-[1000] top-1/2  left-4  -translate-y-1/2 ">
          <div
            className={`flex items-center justify-center rounded-[50%]   w-10 md:w-12  h-10  md:h-12  bg-black opacity-70  cursor-pointer`}
          >
            <ArrowLeft
              color="white"
              onClick={() => {
                swiper.slidePrev();
              }}
            />
          </div>
        </div>
      )}
      {!isEnd && photosNumber > 3 && (
        <div className="swiper-button-next absolute z-[1000] top-1/2  right-4  -translate-y-1/2 ">
          <div className="flex items-center justify-center rounded-[50%]   w-10 md:w-12  h-10  md:h-12  bg-black   opacity-70  cursor-pointer">
            <ArrowRight color="white" onClick={() => swiper.slideNext()} />
          </div>
        </div>
      )}
    </div>
  );
};

const SwiperButtonsC = memo(SwiperButtons);
