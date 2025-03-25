import { Metadata } from 'next';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedRestaurants } from '@/components/FeaturedRestaurants';

export const metadata: Metadata = {
  title: 'Mejores Restaurantes | Find the Best Restaurants in Spain',
  description: 'Discover the best dining experiences in Spain with trusted reviews and recommendations.',
  keywords: 'restaurants, Spain, dining, food, cuisine, tapas, reviews',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mejores-restaurantes.com',
    title: 'Mejores Restaurantes | Best Restaurants in Spain',
    description: 'Discover the best dining experiences in Spain with trusted reviews and recommendations.',
    siteName: 'Mejores Restaurantes',
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Section 1 */}
        <HeroSection />
        
        {/* Featured Restaurants - Section 2 */}
        <section className="container mx-auto px-4 py-16">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Featured Restaurants</h2>
            <p className="text-muted-foreground max-w-3xl">
              Explore these highly rated dining experiences curated by our team of food experts.
            </p>
          </div>
          <FeaturedRestaurants />
        </section>
        
        {/* Testimonials Section 
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">What Foodies Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Read what restaurant enthusiasts and food lovers have to say about their experiences.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="font-medium text-primary">{String.fromCharCode(64 + i)}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">User {i}</h3>
                      <p className="text-xs text-muted-foreground">Food Enthusiast</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "This platform helped me discover amazing restaurants I never knew existed in my city. The reviews are authentic and the recommendations spot-on!"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        */}
        {/* CTA Section
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Discover New Flavors?</h2>
            <p className="mb-8 max-w-lg mx-auto">
              Join thousands of food lovers and start exploring the best culinary experiences today.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a 
                href="/sign-up" 
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary-foreground px-8 text-sm font-medium text-primary shadow transition-colors hover:bg-primary-foreground/90"
              >
                Get Started
              </a>
              <a 
                href="/restaurants" 
                className="inline-flex h-10 items-center justify-center rounded-md border border-primary-foreground bg-transparent px-8 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-foreground/10"
              >
                Explore Restaurants
              </a>
            </div>
          </div>
        </section>
        */}
      </main>
      
      <Footer />
    </div>
  );
}
