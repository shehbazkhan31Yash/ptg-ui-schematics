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

// Local implementation of insert function
function insert(host: any, path: string, changes: any[]) {
  const content = host.read(path)?.toString() || '';
  let updatedContent = content;
  
  // Apply changes in reverse order to maintain positions
  changes.sort((a, b) => b.pos - a.pos).forEach(change => {
    if (change.toAdd) {
      updatedContent = updatedContent.slice(0, change.pos) + change.toAdd + updatedContent.slice(change.pos);
    }
  });
  
  host.overwrite(path, updatedContent);
}

// Local implementation of insertImport
function insertImport(sourceFile: ts.SourceFile, filePath: string, symbolName: string, fileName: string) {
  const importStatement = `import { ${symbolName} } from '${fileName}';\n`;
  return {
    pos: 0,
    toAdd: importStatement
  };
}
import { addImportToModule } from "./ast-utils";

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
    const source = ts.createSourceFile(
      appModulePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true
    );

    insert(host, appModulePath, [
      insertImport(source, appModulePath, moduleName, modulePath),
      ...(!importOnly ? addImportToModule(source, modulePath, symbolName) : []),
    ]);
    return host;
  };
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
