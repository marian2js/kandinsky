export default function camelCaseToWord(camelCase: string): string {
  const words = camelCase
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
  const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  return capitalizedWords.join(' ')
}
