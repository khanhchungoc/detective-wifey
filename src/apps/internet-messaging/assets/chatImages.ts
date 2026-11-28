import familyMeal from './family-meal.webp';
import footballBoots from './football-boots.webp';

// Case data selects bundled media; external URLs are never loaded from messages.
const images: Record<string, string> = { 'family-meal': familyMeal, 'football-boots': footballBoots };
export const chatImage = (asset?: string): string | undefined => asset ? images[asset] : undefined;
