/**
 * Generates a stable placeholder avatar URL based on the username.
 * @param username The user's unique username.
 * @returns A DiceBear SVG URL.
 */
export const generateAvatarUrl = (username: string): string => {
  // 1. Clean the username (or use the one validated by Joi)
  const seed = encodeURIComponent(username.trim().toLowerCase());

  // 2. Customize the avatar style and look (using initials style here)
  return `https://api.dicebear.com/8.x/initials/svg?seed=${seed}&radius=50&chars=2&fontSize=40&backgroundType=solid`;
};
