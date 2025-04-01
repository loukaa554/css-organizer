// src/sorter.ts
export function sortCssText(cssText: string): string {
  // Définition de l'ordre des propriétés
  const propertyOrder: string[] = [
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

  // Créer un map pour l'ordre des propriétés
  const orderMap = new Map<string, number>();
  propertyOrder.forEach((prop, index) => {
    orderMap.set(prop, index);
  });

  // Fonction pour obtenir l'index d'une propriété
  const getPropertyIndex = (property: string): number => {
    if (orderMap.has(property)) {
      return orderMap.get(property)!;
    }
    // Propriétés non listées seront placées à la fin
    return propertyOrder.length;
  };

  // Extraire les parties du CSS (règles, media queries, keyframes)
  const parts: string[] = [];
  let currentPart = "";
  let braceCount = 0;
  let inComment = false;
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < cssText.length; i++) {
    const char = cssText[i];
    const nextChar = i + 1 < cssText.length ? cssText[i + 1] : "";

    // Gestion des commentaires
    if (!inString && char === "/" && nextChar === "*") {
      inComment = true;
      currentPart += char + nextChar;
      i++;
      continue;
    }
    if (inComment && char === "*" && nextChar === "/") {
      inComment = false;
      currentPart += char + nextChar;
      i++;
      continue;
    }
    if (inComment) {
      currentPart += char;
      continue;
    }

    // Gestion des chaînes de caractères
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      currentPart += char;
      continue;
    }
    if (inString && char === stringChar && cssText[i - 1] !== "\\") {
      inString = false;
      currentPart += char;
      continue;
    }
    if (inString) {
      currentPart += char;
      continue;
    }

    // Gestion des accolades
    if (char === "{") {
      braceCount++;
      currentPart += char;
    } else if (char === "}") {
      braceCount--;
      currentPart += char;

      // Si on ferme un bloc de premier niveau, on stocke la partie
      if (braceCount === 0) {
        parts.push(currentPart.trim());
        currentPart = "";
      }
    } else {
      currentPart += char;
    }
  }

  // Ajouter la dernière partie si elle existe
  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }

  // Fonction pour trier les propriétés d'un bloc CSS
  const sortProperties = (cssBlock: string): string => {
    // Séparer le sélecteur du contenu
    const openBraceIndex = cssBlock.indexOf("{");
    if (openBraceIndex === -1) {
      return cssBlock;
    }

    const selector = cssBlock.substring(0, openBraceIndex + 1);
    const content = cssBlock.substring(
      openBraceIndex + 1,
      cssBlock.lastIndexOf("}")
    );

    // Extraire les propriétés
    const propertiesRegex = /([^;{}]+):([^;{}]+)(?:;|$)/g;
    const properties: { property: string; value: string; index: number }[] = [];

    // Extraire les commentaires et préserver leur position
    const comments: { comment: string; index: number }[] = [];
    let commentRegex = /\/\*[\s\S]*?\*\//g;
    let match;

    // Identifier les commentaires
    while ((match = commentRegex.exec(content)) !== null) {
      comments.push({ comment: match[0], index: match.index });
    }

    // Supprimer les commentaires pour l'analyse des propriétés
    let contentWithoutComments = content.replace(/\/\*[\s\S]*?\*\//g, "");

    // Extraire les propriétés
    let propMatch;
    while (
      (propMatch = propertiesRegex.exec(contentWithoutComments)) !== null
    ) {
      const property = propMatch[1].trim();
      const value = propMatch[2].trim();
      const index = getPropertyIndex(property);
      properties.push({ property, value, index });
    }

    // Trier les propriétés selon l'ordre défini
    properties.sort((a, b) => a.index - b.index);

    // Reconstruire le contenu avec les propriétés triées
    let sortedContent = "";
    for (const prop of properties) {
      sortedContent += `${prop.property}: ${prop.value};\n`;
    }

    // Réinsérer les commentaires à leur position relative
    comments.forEach((commentObj) => {
      // On place simplement les commentaires au début pour simplifier
      sortedContent = commentObj.comment + "\n" + sortedContent;
    });

    return `${selector}\n${sortedContent}}`;
  };

  // Fonction pour traiter les blocs spéciaux (media queries, keyframes)
  const processSpecialBlock = (block: string): string => {
    // Vérifier si c'est un bloc spécial
    if (
      block.startsWith("@media") ||
      block.startsWith("@supports") ||
      block.startsWith("@layer") ||
      block.startsWith("@container")
    ) {
      // Extraire les règles internes
      const openBraceIndex = block.indexOf("{");
      const closeBraceIndex = block.lastIndexOf("}");

      if (openBraceIndex !== -1 && closeBraceIndex !== -1) {
        const mediaQueryPart = block.substring(0, openBraceIndex + 1);
        const contentPart = block.substring(
          openBraceIndex + 1,
          closeBraceIndex
        );

        // Trouver les sélecteurs et leurs contenus
        const innerBlocks: string[] = [];
        let currentBlock = "";
        let innerBraceCount = 0;

        for (let i = 0; i < contentPart.length; i++) {
          const char = contentPart[i];

          if (char === "{") {
            innerBraceCount++;
            currentBlock += char;
          } else if (char === "}") {
            innerBraceCount--;
            currentBlock += char;

            if (innerBraceCount === 0) {
              innerBlocks.push(currentBlock.trim());
              currentBlock = "";
            }
          } else {
            currentBlock += char;
          }
        }

        // Trier chaque bloc interne
        const sortedInnerBlocks = innerBlocks.map((block) =>
          sortProperties(block)
        );

        // Reconstruire le bloc media query
        return `${mediaQueryPart}\n${sortedInnerBlocks.join("\n\n")}\n}`;
      }
    } else if (block.startsWith("@keyframes")) {
      // Pour les keyframes, on préserve l'ordre mais on trie les propriétés à l'intérieur
      const openBraceIndex = block.indexOf("{");
      const closeBraceIndex = block.lastIndexOf("}");

      if (openBraceIndex !== -1 && closeBraceIndex !== -1) {
        const keyframesPart = block.substring(0, openBraceIndex + 1);
        const contentPart = block.substring(
          openBraceIndex + 1,
          closeBraceIndex
        );

        // Trouver les sélecteurs de keyframes et leurs contenus
        const innerBlocks: string[] = [];
        let currentBlock = "";
        let innerBraceCount = 0;

        for (let i = 0; i < contentPart.length; i++) {
          const char = contentPart[i];

          if (char === "{") {
            innerBraceCount++;
            currentBlock += char;
          } else if (char === "}") {
            innerBraceCount--;
            currentBlock += char;

            if (innerBraceCount === 0) {
              innerBlocks.push(currentBlock.trim());
              currentBlock = "";
            }
          } else {
            currentBlock += char;
          }
        }

        // Trier chaque bloc interne
        const sortedInnerBlocks = innerBlocks.map((block) =>
          sortProperties(block)
        );

        // Reconstruire le bloc keyframes
        return `${keyframesPart}\n${sortedInnerBlocks.join("\n\n")}\n}`;
      }
    }

    // Si ce n'est pas un bloc spécial ou si le traitement a échoué, essayer de trier comme un bloc normal
    return sortProperties(block);
  };

  // Traiter chaque partie
  const processedParts = parts.map((part) => processSpecialBlock(part));

  // Reconstruire le CSS
  return processedParts.join("\n\n");
}
