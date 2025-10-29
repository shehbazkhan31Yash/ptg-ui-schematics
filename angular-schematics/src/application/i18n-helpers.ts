export function getI18nImportInsertPosition(content: string): number {
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    const position = lines.slice(0, lastImportIndex + 1).join('\n').length + 1;
    return position;
  }
  
  return 0;
}

export function addToI18nImportsArray(content: string, symbolName: string): string {
  const importsRegex = /(imports:\s*\[)([\s\S]*?)(\])/;
  const match = content.match(importsRegex);
  
  if (match) {
    const [, start, importsContent, end] = match;
    const trimmedImports = importsContent.trim();
    
    let newImportsContent;
    if (trimmedImports === '') {
      newImportsContent = `\n    ${symbolName},\n  `;
    } else {
      // Ensure proper trailing comma formatting
      const hasTrailingComma = trimmedImports.endsWith(',');
      const cleanImports = hasTrailingComma ? trimmedImports : `${trimmedImports},`;
      newImportsContent = `${cleanImports}\n    ${symbolName},\n  `;
    }
    
    return content.replace(importsRegex, `${start}${newImportsContent}${end}`);
  }
  
  return content;
}