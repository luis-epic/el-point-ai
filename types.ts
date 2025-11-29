/**
 * Represents geographic coordinates.
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Represents a user profile in the application.
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  joinedAt: string;
}

// --- Gemini Grounding Types ---

export interface PlaceSource {
  name?: string;
  address?: string;
  location?: Coordinates;
}

export interface ReviewSnippet {
  content: string;
}

export interface PlaceAnswerSource {
  reviewSnippets?: ReviewSnippet[];
}

export interface MapsGroundingChunk {
  sourcePlace?: PlaceSource;
  uri?: string;
  title?: string;
  placeAnswerSources?: PlaceAnswerSource[];
}

export interface GroundingChunk {
  maps?: MapsGroundingChunk;
}

// --- App Data Types ---

export interface Review {
  author: string;
  text: string;
  rating: number;
  relativeTime: string;
}

/**
 * Main entity for a place in the directory.
 */
export interface DirectoryItem {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  rating?: number;
  googleMapsUri?: string;
  tags: string[];
  imageUrl: string;
  distance?: number; // Distance in kilometers from user
  userNotes?: string; // Personal notes added by the user
  reviews?: Review[]; // AI-generated or fetched reviews
}

/**
 * Extends DirectoryItem to include timestamp of when it was visited.
 */
export interface HistoryItem extends DirectoryItem {
  visitedAt: string; // ISO Date string
}

export enum AppView {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  FAVORITES = 'FAVORITES',
  PROFILE = 'PROFILE'
}