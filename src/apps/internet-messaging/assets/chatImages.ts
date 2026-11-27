import familyMeal from './family-meal.jpg';
import footballBoots from './football-boots.jpg';

// Case data selects bundled media; external URLs are never loaded from messages.
const images: Record<string, string> = { 'family-meal': familyMeal, 'football-boots': footballBoots };
export const chatImage = (asset?: string): string | undefined => asset ? images[asset] : undefined;
