'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as mixins from '@/styles/theme/mixins';
import { useTheme } from '@/providers/ThemeProvider';


export function ThemeDemo() {
  const { isDarkTheme } = useTheme();
  
  return (
    <div className={mixins.container}>
      <div className="py-10">
        <h1 className={mixins.heading.h1}>Theme Demo</h1>
        <p className={mixins.paragraph}>
          This is a demo of the theme styles and components available in the project.
          The current theme is: <Badge variant="outline">{isDarkTheme ? 'Dark' : 'Light'}</Badge>
        </p>
        
        <div className="mt-8">
          <h2 className={mixins.heading.h2}>Typography</h2>
          <div className="mt-4 space-y-4">
            <h1 className={mixins.heading.h1}>Heading 1</h1>
            <h2 className={mixins.heading.h2}>Heading 2</h2>
            <h3 className={mixins.heading.h3}>Heading 3</h3>
            <h4 className={mixins.heading.h4}>Heading 4</h4>
            <h5 className={mixins.heading.h5}>Heading 5</h5>
            <h6 className={mixins.heading.h6}>Heading 6</h6>
            <p className={mixins.paragraph}>This is a paragraph with standard text styling.</p>
            <p className={mixins.lead}>This is a lead paragraph with larger, slightly muted text.</p>
            <p className={mixins.muted}>This is muted text, used for secondary information.</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className={mixins.heading.h2}>Colors & Buttons</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="link">Link Button</Button>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className={mixins.heading.h2}>Cards</h2>
          <div className={mixins.grid.cols3}>
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here explaining the card&apos;s purpose.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the content of the card where the main information is displayed.</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>
            
            <Card className={mixins.hoverCard}>
              <CardHeader>
                <CardTitle>Hover Card</CardTitle>
                <CardDescription>This card has a hover effect applied.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Hover over this card to see the shadow effect.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Action</Button>
              </CardFooter>
            </Card>
            
            <Card className={mixins.activeCard}>
              <CardHeader>
                <CardTitle>Active Card</CardTitle>
                <CardDescription>This card has both hover and active effects.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Click on this card to see the active state effect.</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className={mixins.heading.h2}>Layout</h2>
          <div className="mt-4 space-y-4">
            <div className={mixins.flexRow}>
              <span>Flex Row</span>
              <Badge className="ml-2">Items Center</Badge>
            </div>
            
            <div className={mixins.flexBetween}>
              <span>Flex Between</span>
              <Badge>Spaced Content</Badge>
            </div>
            
            <div className={mixins.flexCenter}>
              <span>Flex Center</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className={mixins.heading.h2}>Shadcn UI Components</h2>
          <div className="mt-4 space-y-8">
            <div>
              <h3 className={mixins.heading.h3}>Form Controls</h3>
              <div className="mt-4 max-w-md">
                <div className="mb-4">
                  <label className={mixins.formLabel}>Regular Input</label>
                  <Input type="text" placeholder="Enter some text" className="mt-1" />
                </div>
                <div className="mb-4">
                  <label className={mixins.formLabel}>Disabled Input</label>
                  <Input type="text" placeholder="This input is disabled" disabled className="mt-1" />
                </div>
              </div>
            </div>

            <div>
              <h3 className={mixins.heading.h3}>Accordion</h3>
              <div className="mt-4 max-w-md">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is the theme consistent across all components?</AccordionTrigger>
                    <AccordionContent>
                      Yes. The theme is applied consistently across all components using CSS variables and Tailwind CSS.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Can I use this theme in my project?</AccordionTrigger>
                    <AccordionContent>
                      Absolutely! This theme setup can be reused across your entire project for a consistent look and feel.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is dark mode supported?</AccordionTrigger>
                    <AccordionContent>
                      Yes, dark mode is fully supported and can be toggled using the theme switcher in the header.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <div>
              <h3 className={mixins.heading.h3}>Tabs</h3>
              <div className="mt-4 max-w-md">
                <Tabs defaultValue="theme" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="theme">Theme</TabsTrigger>
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="utilities">Utilities</TabsTrigger>
                  </TabsList>
                  <TabsContent value="theme" className="p-4 bg-card rounded-b-lg border border-t-0">
                    <p>The theme includes color schemes, typography, spacing, and shadows.</p>
                  </TabsContent>
                  <TabsContent value="components" className="p-4 bg-card rounded-b-lg border border-t-0">
                    <p>All components automatically adopt the theme styles for consistency.</p>
                  </TabsContent>
                  <TabsContent value="utilities" className="p-4 bg-card rounded-b-lg border border-t-0">
                    <p>Utilities like mixins help maintain consistent styling throughout the app.</p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

