
// Generate a unique ID for the shared link
export const generateShareId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}`;
};
