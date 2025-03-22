'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/providers/ThemeProvider';

export function UtilityClassDemo() {
  const { isDarkTheme } = useTheme();
  
  return (
    <div className="container">
      <div className="py-10">
        <h1 className="heading-1">Utility Class Demo</h1>
        <p className="body">
          This is a demo using utility classes instead of imported mixins.
          The current theme is: <Badge variant="outline">{isDarkTheme ? 'Dark' : 'Light'}</Badge>
        </p>
        
        <div className="mt-8">
          <h2 className="heading-2">Typography</h2>
          <div className="mt-4 space-y-4">
            <h1 className="heading-1">Heading 1</h1>
            <h2 className="heading-2">Heading 2</h2>
            <h3 className="heading-3">Heading 3</h3>
            <h4 className="heading-4">Heading 4</h4>
            <h5 className="heading-5">Heading 5</h5>
            <h6 className="heading-6">Heading 6</h6>
            <p className="body">This is standard body text.</p>
            <p className="body-large">This is large body text.</p>
            <p className="body-small">This is small body text.</p>
            <p className="lead">This is a lead paragraph with larger, slightly muted text.</p>
            <p className="muted">This is muted text, used for secondary information.</p>
            <p className="display-3">Display text</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="heading-2">Buttons & Badges</h2>
          <div className="mt-4 grid-cols-4">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-destructive">Destructive Button</button>
            <button className="btn-outline">Outline Button</button>
            <button className="btn-ghost">Ghost Button</button>
            <button className="btn-link">Link Button</button>
            
            <div className="mt-4 flex-row space-x-2">
              <span className="badge-primary">Primary Badge</span>
              <span className="badge-secondary">Secondary Badge</span>
              <span className="badge-destructive">Destructive Badge</span>
              <span className="badge-outline">Outline Badge</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="heading-2">Cards</h2>
          <div className="grid-cols-3">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Card Title</h3>
                <p className="card-description">Card description goes here explaining the card&apos;s purpose.</p>
              </div>
              <div className="card-content">
                <p>This is the content of the card where the main information is displayed.</p>
              </div>
              <div className="card-footer">
                <button className="btn-primary">Action</button>
              </div>
            </div>
            
            <div className="card hover-card">
              <div className="card-header">
                <h3 className="card-title">Hover Card</h3>
                <p className="card-description">This card has a hover effect applied.</p>
              </div>
              <div className="card-content">
                <p>Hover over this card to see the shadow effect.</p>
              </div>
              <div className="card-footer">
                <button className="btn-outline">Action</button>
              </div>
            </div>
            
            <div className="card active-card">
              <div className="card-header">
                <h3 className="card-title">Active Card</h3>
                <p className="card-description">This card has both hover and active effects.</p>
              </div>
              <div className="card-content">
                <p>Click on this card to see the active state effect.</p>
              </div>
              <div className="card-footer">
                <button className="btn-secondary">Action</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="heading-2">Layout</h2>
          <div className="mt-4 space-y-4">
            <div className="flex-row">
              <span>Flex Row</span>
              <Badge className="ml-2">Items Center</Badge>
            </div>
            
            <div className="flex-between">
              <span>Flex Between</span>
              <Badge>Spaced Content</Badge>
            </div>
            
            <div className="flex-center">
              <span>Flex Center</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="heading-2">Form Controls</h2>
          <div className="mt-4 max-w-md">
            <div className="form-item">
              <label className="form-label">Regular Input</label>
              <Input type="text" placeholder="Enter some text" className="form-control" />
            </div>
            <div className="form-item">
              <label className="form-label">Disabled Input</label>
              <Input type="text" placeholder="This input is disabled" disabled className="form-control" />
              <p className="form-description">This input is currently disabled</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="heading-2">Responsive Containers</h2>
          <div className="mt-4 space-y-4">
            <div className="container-sm bg-muted p-4 rounded">
              <p className="body-small">Small Container (Max Width: sm)</p>
            </div>
            <div className="container-md bg-muted p-4 rounded">
              <p className="body-small">Medium Container (Max Width: md)</p>
            </div>
            <div className="container-lg bg-muted p-4 rounded">
              <p className="body-small">Large Container (Max Width: lg)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 