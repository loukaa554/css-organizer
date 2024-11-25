import * as vscode from "vscode";

// Ordre des propriétés CSS souhaité
const cssOrder = [
  "font-family",
  "cursor",
  "user-select",
  "overflow",
  "position",
  "top",
  "left",
  "bottom",
  "right",
  "margin",
  "display",
  "flex",
  "flex-direction",
  "align-items",
  "justify-content",
  "gap",
  "min-width",
  "width",
  "max-width",
  "min-height",
  "height",
  "max-height",
  "margin",
  "padding",
  "font-size",
  "font-weight",
  "color",
  "background-color",
  "border",
  "border-radius",
  "box-shadow",
  "transform",
  "transition",
  "z-index",
];

// Fonction de tri des propriétés CSS
function sortCSSProperties(cssContent: string): string {
  const cssBlocks = cssContent.split("}");
  const sortedBlocks = cssBlocks.map((block) => {
    const [selector, properties] = block.split("{");
    if (!properties) {
      return block;
    } // Si le bloc n'a pas de propriétés, le retourner tel quel

    const propertyLines = properties
      .split(";")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Tri des propriétés selon l'ordre souhaité
    const sortedProperties = propertyLines.sort((a, b) => {
      const propertyA = a.split(":")[0].trim();
      const propertyB = b.split(":")[0].trim();
      const indexA = cssOrder.indexOf(propertyA);
      const indexB = cssOrder.indexOf(propertyB);

      if (indexA === -1) {
        return 1;
      } // Si la propriété n'est pas dans l'ordre, la mettre à la fin
      if (indexB === -1) {
        return -1;
      }

      return indexA - indexB;
    });

    return `${selector} {\n  ${sortedProperties.join(";\n  ")};\n}`;
  });

  return sortedBlocks.join("}\n\n");
}

// Enregistrer la commande
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.sortCSSOnSave",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      if (document.languageId !== "css") {
        return;
      }

      const content = document.getText();
      const sortedContent = sortCSSProperties(content);

      editor.edit((editBuilder) => {
        const lastLine = document.lineAt(document.lineCount - 1);
        const end = lastLine.range.end;
        editBuilder.replace(
          new vscode.Range(new vscode.Position(0, 0), end),
          sortedContent
        );
      });
    }
  );

  context.subscriptions.push(disposable);

  // Appliquer le tri à chaque enregistrement
  vscode.workspace.onWillSaveTextDocument((event) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    if (document.languageId !== "css") {
      return;
    }

    const content = document.getText();
    const sortedContent = sortCSSProperties(content);

    editor.edit((editBuilder) => {
      const lastLine = document.lineAt(document.lineCount - 1);
      const end = lastLine.range.end;
      editBuilder.replace(
        new vscode.Range(new vscode.Position(0, 0), end),
        sortedContent
      );
    });
  });
}

export function deactivate() {}
