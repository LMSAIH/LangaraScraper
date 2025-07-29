// Simple input sanitizer to prevent NoSQL injection
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove dangerous characters that could be used for injection
  // Remove: $ . ( ) [ ] { } | \ ^ * + ? 
  return input
    .replace(/[\$\(\)\[\]\{\}\|\\^*+?]/g, '') // Remove regex/injection chars
    .trim(); // Remove leading/trailing whitespace
};
