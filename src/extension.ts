import * as vscode from "vscode";
import { sortCssText } from "./sorter";

export function activate(context: vscode.ExtensionContext) {
  // Enregistrer la commande pour trier manuellement
  let disposable = vscode.commands.registerCommand(
    "css-properties-sorter.sortProperties",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const text = document.getText();
        const sorted = sortCssText(text);

        editor.edit((editBuilder) => {
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
          );
          editBuilder.replace(fullRange, sorted);
        });
      }
    }
  );

  context.subscriptions.push(disposable);

  // S'abonner à l'événement de sauvegarde
  context.subscriptions.push(
    vscode.workspace.onWillSaveTextDocument((event) => {
      const document = event.document;
      if (["css", "scss", "less"].includes(document.languageId)) {
        const text = document.getText();
        const sorted = sortCssText(text);

        event.waitUntil(
          Promise.resolve([
            new vscode.TextEdit(
              new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
              ),
              sorted
            ),
          ])
        );
      }
    })
  );
}

export function deactivate() {}
