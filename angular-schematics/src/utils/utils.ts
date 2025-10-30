import { Rule, SchematicsException, Tree } from "@angular-devkit/schematics";
import * as ts from "typescript";

// Local implementation of ChangeType (replaces @nx/devkit)
enum ChangeType {
  Insert = 'insert',
  Remove = 'remove',
  Replace = 'replace'
}

// Local implementation of applyChangesToString (replaces @nx/devkit)
function applyChangesToString(content: string, changes: Array<{type: ChangeType, index: number, text: string}>): string {
  let result = content;
  // Sort changes by index in descending order to avoid position shifts
  const sortedChanges = changes.sort((a, b) => b.index - a.index);
  
  for (const change of sortedChanges) {
    if (change.type === ChangeType.Insert) {
      result = result.slice(0, change.index) + change.text + result.slice(change.index);
    }
  }
  return result;
}




export function addImportToAppModule(
  moduleName: string,
  modulePath: string,
  symbolName = moduleName,
  importOnly = false
) {
  return (host: Tree) => {
    const appModulePath = "src/app/app.module.ts";
    const text = host.read(appModulePath);
    if (text === null) {
      throw new SchematicsException(`File ${appModulePath} does not exist.`);
    }
    const sourceText = text.toString();


    // Generate properly formatted code
    let updatedContent = sourceText;
    
    // Add import statement at the top
    const importStatement = `import { ${moduleName} } from '${modulePath}';\n`;
    const importInsertPos = getImportInsertPosition(updatedContent);
    updatedContent = updatedContent.slice(0, importInsertPos) + importStatement + updatedContent.slice(importInsertPos);
    
    // Add to imports array if not importOnly
    if (!importOnly) {
      updatedContent = addToImportsArray(updatedContent, symbolName);
    }
    
    host.overwrite(appModulePath, updatedContent);
    return host;
  };
}

function getImportInsertPosition(content: string): number {
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    // Insert after the last import
    const position = lines.slice(0, lastImportIndex + 1).join('\n').length + 1;
    return position;
  }
  
  return 0;
}

function addToImportsArray(content: string, symbolName: string): string {
  // Find the imports array in NgModule
  const importsRegex = /(imports:\s*\[)([\s\S]*?)(\])/;
  const match = content.match(importsRegex);
  
  if (match) {
    const [, start, importsContent, end] = match;
    const trimmedImports = importsContent.trim();
    
    let newImportsContent;
    if (trimmedImports === '') {
      // Empty imports array
      newImportsContent = `\n    ${symbolName},\n  `;
    } else {
      // Add to existing imports with proper formatting
      const hasTrailingComma = trimmedImports.endsWith(',');
      const cleanImports = hasTrailingComma ? trimmedImports : `${trimmedImports},`;
      newImportsContent = `${cleanImports}\n    ${symbolName},\n  `;
    }
    
    return content.replace(importsRegex, `${start}${newImportsContent}${end}`);
  }
  
  return content;
}

export function insertStatement(path: string, statement: string): Rule {
  return (tree: Tree) => {
    const contents = tree?.read(path)?.toString() as string;

    const sourceFile = ts.createSourceFile(
      path,
      contents,
      ts.ScriptTarget.ESNext
    );

    const importStatements = sourceFile.statements.filter(
      ts.isImportDeclaration
    );
    const index =
      importStatements.length > 0
        ? importStatements[importStatements.length - 1].getEnd()
        : 0;

    if (importStatements.length > 0) {
      statement = "\n" + statement;
    }

    const newContents = applyChangesToString(contents, [
      {
        type: ChangeType.Insert,
        index,
        text: statement,
      },
    ]);

    tree.overwrite(path, newContents);
    return tree;
  };
}
