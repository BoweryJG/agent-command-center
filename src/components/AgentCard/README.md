# Ghibli Agent Card Components

A collection of Studio Ghibli-inspired baseball card components for displaying agents with magical, nature-themed animations and effects.

## Components

### 1. GhibliAgentCard
Individual agent card with floating animations, particle effects, and hand-drawn style borders.

```tsx
import { GhibliAgentCard, GhibliAgent } from './components/AgentCard';

const agent: GhibliAgent = {
  id: 'unique-id',
  name: 'Agent Name',
  title: 'Agent Title',
  nature_element: 'forest', // 'forest' | 'fire' | 'water' | 'wind' | 'earth' | 'spirit'
  description: 'Agent description',
  stats: {
    power: 80,
    wisdom: 90,
    speed: 70,
    harmony: 85,
    spirit: 75,
  },
  abilities: ['Ability 1', 'Ability 2', 'Ability 3'],
  rarity: 'rare', // 'common' | 'rare' | 'legendary' | 'mythical'
  avatar: '/path/to/avatar.jpg' // optional
};

<GhibliAgentCard
  agent={agent}
  isSelected={false}
  onClick={() => console.log('Card clicked')}
  className="custom-class"
/>
```

### 2. AgentCardCarousel
A 3D perspective carousel for showcasing multiple agent cards with smooth transitions.

```tsx
import { AgentCardCarousel } from './components/AgentCard';

<AgentCardCarousel
  agents={agentsArray}
  onSelectAgent={(agent) => console.log('Selected:', agent)}
  className="h-[600px]"
/>
```

Features:
- Auto-play functionality
- 3D perspective effects
- Drag gesture support
- Nature-inspired navigation
- Bottom info panel

### 3. Particle Effects
Reusable particle components for different nature elements:

```tsx
import {
  FloatingLeaves,
  SwirlingMist,
  DancingEmbers,
  SeaFoamBubbles,
  SpiritOrbs,
  WindLines,
} from './components/AgentCard';

// Use individually
<FloatingLeaves count={5} className="opacity-50" />
<DancingEmbers count={8} />

// Or get by element type
import { getParticlesByElement } from './components/AgentCard';
const ParticleComponent = getParticlesByElement('fire');
<ParticleComponent count={10} />
```

## Agent Interface

```typescript
interface GhibliAgent {
  id: string;
  name: string;
  title: string;
  nature_element: 'forest' | 'fire' | 'water' | 'wind' | 'earth' | 'spirit';
  description: string;
  stats: {
    power: number;      // 0-100
    wisdom: number;     // 0-100
    speed: number;      // 0-100
    harmony: number;    // 0-100
    spirit: number;     // 0-100
  };
  abilities: string[];
  avatar?: string;
  rarity: 'common' | 'rare' | 'legendary' | 'mythical';
}
```

## Styling

The components use:
- Tailwind CSS for styling
- Framer Motion for animations
- Custom Ghibli-inspired color palette
- Hand-drawn border effects
- Nature-themed animations

## Color Palette

- Forest: `#2D5016`
- Fire: `#FF6347`
- Water: `#4682B4`
- Wind: `#E0E5E5`
- Earth: `#8B7355`
- Spirit: `#DDA0DD`

## Animation Classes

Custom animations added to Tailwind:
- `animate-wind-sway`
- `animate-leaf-fall`
- `animate-spirit-float`
- `animate-ember-rise`
- `animate-water-ripple`
- `animate-nature-pulse`

## Usage Example

```tsx
import React from 'react';
import { AgentCardCarousel } from './components/AgentCard';
import { AgentCardDemo } from './components/AgentCard/AgentCardDemo';

// Use the demo component
<AgentCardDemo />

// Or create your own implementation
const MyAgentGallery = () => {
  const agents = [...]; // Your agents data
  
  return (
    <AgentCardCarousel
      agents={agents}
      onSelectAgent={(agent) => {
        // Handle agent selection
      }}
    />
  );
};
```