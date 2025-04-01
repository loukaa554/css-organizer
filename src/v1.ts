import * as vscode from "vscode";

// Ordre des propriétés CSS souhaité
const cssOrder = [
  "content",
  "font-family",
  "cursor",
  "user-select",
  "visibility",
  "scroll-behavior",
  "scroll-snap-type",
  "scroll-snap-align",
  "scroll-snap-stop",
  "overflow",
  "overflow-x",
  "overflow-y",
  "overflow-wrap",
  "clip",
  "clip-path",
  "position",
  "top",
  "left",
  "bottom",
  "right",
  "display",
  "flex",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "flex-direction",
  "flex-wrap",
  "align-items",
  "align-self",
  "align-content",
  "justify-content",
  "gap",
  "order",
  "grid-template-columns",
  "grid-template-rows",
  "grid-template-areas",
  "grid-auto-flow",
  "grid-auto-columns",
  "grid-auto-rows",
  "grid-column",
  "grid-column-start",
  "grid-column-end",
  "grid-row",
  "grid-row-start",
  "grid-row-end",
  "grid-area",
  "place-items",
  "place-content",
  "place-self",
  "min-width",
  "width",
  "max-width",
  "min-height",
  "aspect-ratio",
  "height",
  "max-height",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "opacity",
  "font-size",
  "font-weight",
  "text-wrap",
  "vertical-align",
  "text-align",
  "line-height",
  "letter-spacing",
  "text-decoration",
  "text-transform",
  "text-indent",
  "text-overflow",
  "white-space",
  "word-break",
  "word-wrap",
  "color",
  "background",
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "background-attachment",
  "background-clip",
  "background-origin",
  "background-blend-mode",
  "filter",
  "backdrop-filter",
  "object-fit",
  "object-position",
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-width",
  "border-top-width",
  "border-right-width",
  "border-radius",
  "border-top-right-radius",
  "border-top-left-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  "border-style",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "outline",
  "outline-width",
  "outline-color",
  "outline-style",
  "box-shadow",
  "text-shadow",
  "transform",
  "transform-origin",
  "perspective",
  "perspective-origin",
  "will-change",
  "resize",
  "transition",
  "transition-property",
  "transition-duration",
  "transition-timing-function",
  "transition-delay",
  "animation",
  "animation-name",
  "animation-duration",
  "animation-timing-function",
  "animation-delay",
  "animation-iteration-count",
  "animation-direction",
  "animation-fill-mode",
  "z-index",
  "-webkit-overflow-scrolling",
  "-webkit-transform",
  "-moz-transform",
  "-ms-transform",
  "-o-transform",
  "-webkit-transition",
  "-moz-transition",
  "-ms-transition",
  "-o-transition",
  "-webkit-animation",
  "-moz-animation",
  "-ms-animation",
  "-o-animation",
  "-webkit-box-shadow",
  "-moz-box-shadow",
  "-ms-box-shadow",
  "-webkit-appearance",
  "-moz-appearance",
  "-webkit-user-select",
  "-moz-user-select",
  "-ms-user-select",
];

function sortCSSProperties(cssContent: string): string {
  function sortProperties(block: string): string {
    const [selector, properties] = block.split("{");
    if (!properties) return block;

    const propertyLines = properties
      .replace(/}/g, "") // Supprime la fermeture de bloc
      .split(";")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const sortedProperties = propertyLines.sort((a, b) => {
      const propertyA = a.split(":")[0].trim();
      const propertyB = b.split(":")[0].trim();
      const indexA = cssOrder.indexOf(propertyA);
      const indexB = cssOrder.indexOf(propertyB);

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    return `${selector.trim()} {\n${sortedProperties.join(";\n  ")};\n}`;
  }

  function processCSS(css: string): string {
    const blocks: string[] = [];
    let currentBlock = "";
    let insideMedia = false;
    let insideKeyframes = false;
    let braceCount = 0;

    // Diviser le CSS en blocs par ligne
    css.split("\n").forEach((line) => {
      const trimmedLine = line.trim();

      // Détecter le début des blocs @media ou @keyframes
      if (
        trimmedLine.startsWith("@media") ||
        trimmedLine.startsWith("@keyframes")
      ) {
        if (braceCount === 0) {
          if (currentBlock) {
            blocks.push(currentBlock.trim());
            currentBlock = "";
          }
          insideMedia = trimmedLine.startsWith("@media");
          insideKeyframes = trimmedLine.startsWith("@keyframes");
        }
      }

      // Gérer l'ouverture et la fermeture des accolades
      braceCount += (trimmedLine.match(/{/g) || []).length;
      braceCount -= (trimmedLine.match(/}/g) || []).length;

      currentBlock += line + "\n";

      if (braceCount === 0 && currentBlock) {
        blocks.push(currentBlock.trim());
        currentBlock = "";
        insideMedia = false;
        insideKeyframes = false;
      }
    });

    if (currentBlock) blocks.push(currentBlock.trim()); // Ajouter le dernier bloc s'il existe

    // Appliquer le tri uniquement à l'intérieur des blocs standards ou à l'intérieur des @media ou @keyframes
    return blocks
      .map((block) => {
        if (block.startsWith("@media") || block.startsWith("@keyframes")) {
          // Traiter le bloc @media ou @keyframes pour trier ses propriétés à l'intérieur
          const blockHeader = block.match(/^@[^ {]+[^{]*\{/);
          const innerContent = block
            .replace(blockHeader![0], "") // Retirer la partie @media ou @keyframes initiale
            .replace(/}$/, ""); // Retirer la dernière accolade fermante
          const sortedInnerContent = processCSS(innerContent); // Appliquer le tri à l'intérieur
          return `${blockHeader![0].trim()}\n${sortedInnerContent}}`;
        } else {
          return sortProperties(block); // Appliquer le tri pour les blocs standards
        }
      })
      .join("\n");
  }

  return processCSS(cssContent);
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
