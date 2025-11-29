import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlaceCard from '../PlaceCard';
import { DirectoryItem } from '../../types';

// Mock Lucide icons to avoid render issues in test env
vi.mock('lucide-react', () => ({
  MapPin: () => <div data-testid="icon-map-pin" />,
  Star: () => <div data-testid="icon-star" />,
  Navigation: () => <div data-testid="icon-nav" />,
  Heart: () => <div data-testid="icon-heart" />,
}));

const mockItem: DirectoryItem = {
  id: '1',
  name: 'Test Cafe',
  address: '123 Test St',
  description: 'A great place',
  tags: ['Cafe'],
  imageUrl: 'test.jpg',
  rating: 4.5,
  distance: 1.2,
};

describe('PlaceCard Component', () => {
  it('renders place information correctly', () => {
    const onToggle = vi.fn();
    render(
      <PlaceCard 
        item={mockItem} 
        isFavorite={false} 
        onToggleFavorite={onToggle} 
      />
    );

    expect(screen.getByText('Test Cafe')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('1.2 km')).toBeInTheDocument();
  });

  it('calls onToggleFavorite when heart icon is clicked', () => {
    const onToggle = vi.fn();
    render(
      <PlaceCard 
        item={mockItem} 
        isFavorite={false} 
        onToggleFavorite={onToggle} 
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith(mockItem);
  });
});
