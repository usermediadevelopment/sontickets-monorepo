import { CitySelector } from '@/components/CitySelector';
import { RestaurantSearch } from '@/components/RestaurantSearch';

export function HeroSection() {
  return (
    <section className="relative">
      {/* Hero background */}
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60" />
      </div>
      
      {/* Hero content */}
      <div className="relative container mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Discover the Best Restaurants in Colombia
          </h1>
          <p className="text-lg md:text-xl text-white/90 mx-auto max-w-xl">
            Find amazing culinary experiences and read authentic reviews from food lovers.
          </p>
          
          <div className="mt-10 space-y-6">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 max-w-md mx-auto">
              <div className="w-full md:w-auto">
                <CitySelector />
              </div>
              <div className="w-full">
                <RestaurantSearch />
              </div>
            </div>
            
        
          </div>
        </div>
      </div>
    </section>
  );
} 