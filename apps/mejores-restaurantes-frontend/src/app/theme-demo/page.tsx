import { ThemeDemo } from '@/components/ui/theme-demo';
import { UtilityClassDemo } from '@/components/ui/utility-class-demo';
import { DirectCssDemo } from '@/components/ui/direct-css-demo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ThemeDemoPage() {
  return (
    <div className="container py-10">
      <h1 className="heading-1 mb-6">Theme Styling Approaches</h1>
      <p className="body mb-10">
        This page demonstrates three different approaches to styling using our theme:
      </p>

      <Tabs defaultValue="utility-classes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="utility-classes">Utility Classes</TabsTrigger>
          <TabsTrigger value="imported-mixins">Imported Mixins</TabsTrigger>
          <TabsTrigger value="direct-css">Direct CSS Variables</TabsTrigger>
        </TabsList>
        
        <TabsContent value="utility-classes" className="p-4 bg-card rounded-b-lg border border-t-0">
          <div className="mb-4">
            <h2 className="heading-2">Utility Classes Approach</h2>
            <p className="body mt-2">
              This approach uses Tailwind utility classes defined in our globals.css file. 
              You simply add the class names directly to your HTML elements.
            </p>
          </div>
          <UtilityClassDemo />
        </TabsContent>
        
        <TabsContent value="imported-mixins" className="p-4 bg-card rounded-b-lg border border-t-0">
          <div className="mb-4">
            <h2 className="heading-2">Imported Mixins Approach</h2>
            <p className="body mt-2">
              This approach imports mixins from a central file and uses them in your components.
              This allows for more organized and reusable class combinations.
            </p>
          </div>
          <ThemeDemo />
        </TabsContent>
        
        <TabsContent value="direct-css" className="p-4 bg-card rounded-b-lg border border-t-0">
          <div className="mb-4">
            <h2 className="heading-2">Direct CSS Variables Approach</h2>
            <p className="body mt-2">
              This approach uses CSS variables directly in CSS classes.
              This gives you more control over styling and can be combined with Tailwind when needed.
            </p>
          </div>
          <DirectCssDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}
