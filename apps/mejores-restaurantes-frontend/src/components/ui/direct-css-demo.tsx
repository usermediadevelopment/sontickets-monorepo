'use client';

import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/providers/ThemeProvider';

export function DirectCssDemo() {
  const { isDarkTheme } = useTheme();
  
  return (
    <div className="container">
      <div className="py-10">
        <h1 className="heading-direct-1">Direct CSS Variables Demo</h1>
        <p className="body-direct">
          This is a demo using direct CSS variables instead of Tailwind classes.
          The current theme is: <Badge variant="outline">{isDarkTheme ? 'Dark' : 'Light'}</Badge>
        </p>
        
        <div className="mt-8">
          <h2 className="heading-direct-2">Typography</h2>
          <div className="mt-4 space-y-4">
            <h1 className="heading-direct-1">Heading 1</h1>
            <h2 className="heading-direct-2">Heading 2</h2>
            <h3 className="heading-direct-3">Heading 3</h3>
            <p className="body-direct">This is standard body text using direct CSS variables.</p>
            <p className="body-direct-large">This is large body text using direct CSS variables.</p>
            <p className="body-direct-small">This is small body text using direct CSS variables.</p>
            <p className="display-direct-1">Display Text</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="heading-direct-2">Buttons</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <button className="btn-direct btn-direct-primary">Primary Button</button>
            <button className="btn-direct btn-direct-secondary">Secondary Button</button>
            <button className="btn-direct btn-direct-destructive">Destructive Button</button>
            <button className="btn-direct btn-direct-outline">Outline Button</button>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="heading-direct-2">Cards</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card-direct">
              <div className="card-direct-header">
                <h3 className="card-direct-title">Card Title</h3>
                <p className="card-direct-description">Card description goes here explaining the card&apos;s purpose.</p>
              </div>
              <div className="card-direct-content">
                <p className="body-direct">This is the content of the card where the main information is displayed.</p>
              </div>
              <div className="card-direct-footer">
                <button className="btn-direct btn-direct-primary">Action</button>
              </div>
            </div>
            
            <div className="card-direct">
              <div className="card-direct-header">
                <h3 className="card-direct-title">Another Card</h3>
                <p className="card-direct-description">With CSS variables for consistent styling</p>
              </div>
              <div className="card-direct-content">
                <p className="body-direct">Using CSS variables ensures consistency across all components.</p>
              </div>
              <div className="card-direct-footer">
                <button className="btn-direct btn-direct-outline">Action</button>
              </div>
            </div>
            
            <div className="card-direct">
              <div className="card-direct-header">
                <h3 className="card-direct-title">Third Card</h3>
                <p className="card-direct-description">Using direct CSS variables for styling</p>
              </div>
              <div className="card-direct-content">
                <p className="body-direct">Direct CSS allows for more control when needed.</p>
              </div>
              <div className="card-direct-footer">
                <button className="btn-direct btn-direct-secondary">Action</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="heading-direct-2">Form Controls</h2>
          <div className="mt-4 max-w-md space-y-4">
            <div>
              <label className="form-direct-label" htmlFor="name">Name</label>
              <input type="text" id="name" className="form-direct-control mt-1" placeholder="Enter your name" />
            </div>
            <div>
              <label className="form-direct-label" htmlFor="email">Email</label>
              <input type="email" id="email" className="form-direct-control mt-1" placeholder="Enter your email" />
              <p className="form-direct-description mt-1">We&apos;ll never share your email with anyone else.</p>
            </div>
            <div>
              <label className="form-direct-label" htmlFor="message">Message</label>
              <textarea id="message" className="form-direct-control mt-1" rows={4} placeholder="Enter your message"></textarea>
            </div>
            <div>
              <button className="btn-direct btn-direct-primary">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 