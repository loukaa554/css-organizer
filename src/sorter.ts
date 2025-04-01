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

  // Configuration de l'indentation
  const indentSize = 2; // Nombre d'espaces par niveau d'indentation
  const indent = " ".repeat(indentSize);

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

  // Type pour représenter une propriété CSS ou un commentaire
  type CssItem = {
    type: "property" | "comment";
    property?: string;
    value?: string;
    comment?: string;
    index: number;
    originalIndex: number;
  };

  // Fonction pour trier les propriétés d'un bloc CSS
  const sortProperties = (cssBlock: string, nestingLevel = 0): string => {
    // Séparer le sélecteur du contenu
    const openBraceIndex = cssBlock.indexOf("{");
    if (openBraceIndex === -1) {
      return cssBlock;
    }

    // Extraire le sélecteur et s'assurer qu'il n'y a qu'une seule accolade ouvrante
    let selector = cssBlock.substring(0, openBraceIndex).trim();

    // Le contenu est tout ce qui se trouve entre la première accolade ouvrante et la dernière fermante
    const content = cssBlock.substring(
      openBraceIndex + 1,
      cssBlock.lastIndexOf("}")
    );

    // Analyser le contenu pour extraire les propriétés et les commentaires dans l'ordre original
    const items: CssItem[] = [];
    let originalIndex = 0;

    // 1. Extraire les commentaires et préserver leur position
    let commentRegex = /\/\*[\s\S]*?\*\//g;
    let commentMatch;
    let contentWithCommentIndexes = content;
    let indexShift = 0;

    while ((commentMatch = commentRegex.exec(content)) !== null) {
      const comment = commentMatch[0];
      const startIndex = commentMatch.index;
      const endIndex = startIndex + comment.length;

      // Ajouter un marqueur pour le commentaire
      const marker = `__COMMENT_${items.length}__`;
      contentWithCommentIndexes =
        contentWithCommentIndexes.substring(0, startIndex + indexShift) +
        marker +
        contentWithCommentIndexes.substring(endIndex + indexShift);

      indexShift += marker.length - comment.length;

      items.push({
        type: "comment",
        comment,
        index: propertyOrder.length + 1, // Les commentaires ne sont pas triés
        originalIndex: items.length,
      });
    }

    // 2. Extraire les propriétés avec les marqueurs de commentaires
    const propertyMatches = contentWithCommentIndexes
      .split(";")
      .filter((p) => p.trim() !== "");

    for (const propText of propertyMatches) {
      // Vérifier si c'est un marqueur de commentaire
      if (propText.trim().startsWith("__COMMENT_")) {
        // C'est un marqueur que nous avons déjà traité, nous pouvons l'ignorer
        continue;
      }

      const colonIndex = propText.indexOf(":");
      if (colonIndex !== -1) {
        // C'est une propriété
        const property = propText.substring(0, colonIndex).trim();
        const value = propText.substring(colonIndex + 1).trim();
        const sortIndex = getPropertyIndex(property);

        items.push({
          type: "property",
          property,
          value,
          index: sortIndex,
          originalIndex: items.length,
        });
      }
    }

    // Analyser de nouveau le contenu pour obtenir l'ordre correct de tous les éléments
    let contentAnalysis = content;
    const itemsWithPositions: Array<CssItem & { position: number }> = [];

    // Extraire les positions de tous les commentaires
    while ((commentMatch = commentRegex.exec(content)) !== null) {
      const comment = commentMatch[0];
      const position = commentMatch.index;

      // Trouver l'item correspondant à ce commentaire
      const commentItem = items.find(
        (item) => item.type === "comment" && item.comment === comment
      );

      if (commentItem) {
        itemsWithPositions.push({ ...commentItem, position });
      }
    }

    // Extraire les positions des propriétés
    let propertyRegex = /([^;{}]+):([^;{}]+)(?:;|$)/g;
    let propMatch;

    while ((propMatch = propertyRegex.exec(content)) !== null) {
      const fullMatch = propMatch[0];
      const property = propMatch[1].trim();
      const value = propMatch[2].trim();
      const position = propMatch.index;

      // Trouver l'item correspondant à cette propriété
      const propertyItem = items.find(
        (item) =>
          item.type === "property" &&
          item.property === property &&
          item.value === value
      );

      if (propertyItem) {
        itemsWithPositions.push({ ...propertyItem, position });
      }
    }

    // Trier les éléments par position pour obtenir l'ordre original
    itemsWithPositions.sort((a, b) => a.position - b.position);

    // Reconstruire l'ordre original des items
    const originalItems = itemsWithPositions.map((item) => {
      const { position, ...rest } = item;
      return rest;
    });

    // Réorganiser les items en gardant les commentaires à leur place
    // et en triant uniquement les propriétés
    const sortedItems: CssItem[] = [];
    let propertiesOnly: CssItem[] = [];

    // Extraire toutes les propriétés
    originalItems.forEach((item) => {
      if (item.type === "property") {
        propertiesOnly.push(item);
      }
    });

    // Trier les propriétés selon l'ordre défini
    propertiesOnly.sort((a, b) => a.index - b.index);

    // Assigner un nouvel index séquentiel aux propriétés triées
    propertiesOnly.forEach((prop, idx) => {
      prop.originalIndex = idx;
    });

    // Combiner les propriétés triées avec les commentaires dans l'ordre original
    originalItems.forEach((item) => {
      if (item.type === "comment") {
        sortedItems.push(item);
      } else if (item.type === "property") {
        // Pour chaque position de propriété, prendre la prochaine propriété triée
        const nextProp = propertiesOnly.shift();
        if (nextProp) {
          sortedItems.push(nextProp);
        }
      }
    });

    // Calculer l'indentation pour ce niveau
    const currentIndent = indent.repeat(nestingLevel);
    const propertyIndent = indent.repeat(nestingLevel + 1);

    // Reconstruire le contenu avec les items triés et indentés
    let sortedContent = "";

    // Ajouter les items dans l'ordre déterminé
    for (const item of sortedItems) {
      if (item.type === "comment") {
        sortedContent += `${propertyIndent}${item.comment}\n`;
      } else if (item.type === "property" && item.property && item.value) {
        sortedContent += `${propertyIndent}${item.property}: ${item.value};\n`;
      }
    }

    // Formater le sélecteur avec l'indentation appropriée
    const formattedSelector = formatSelector(selector, currentIndent);
    const closingBrace = `${currentIndent}}`;

    return `${formattedSelector} {\n${sortedContent}${closingBrace}`;
  };

  // Formater le sélecteur avec l'indentation appropriée
  const formatSelector = (selector: string, indentation: string): string => {
    // Vérifier si c'est un sélecteur multi-lignes
    if (selector.includes(",")) {
      // Séparer les sélecteurs et supprimer les espaces avant/après
      const selectors = selector.split(",").map((s) => s.trim());

      // Rejoindre avec une virgule, un saut de ligne et l'indentation
      return indentation + selectors.join(`,\n${indentation}`);
    }

    // Retourner le sélecteur simple avec l'indentation
    return indentation + selector.trim();
  };

  // Fonction pour traiter les blocs spéciaux (media queries, keyframes)
  const processSpecialBlock = (block: string, nestingLevel = 0): string => {
    // Calculer l'indentation pour ce niveau
    const currentIndent = indent.repeat(nestingLevel);
    const innerIndent = indent.repeat(nestingLevel + 1);

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
        const mediaQueryPart = block.substring(0, openBraceIndex).trim();
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

        // Trier chaque bloc interne avec un niveau d'indentation supplémentaire
        const sortedInnerBlocks = innerBlocks.map((block) =>
          sortProperties(block, nestingLevel + 1)
        );

        // Reconstruire le bloc media query avec l'indentation appropriée
        return `${currentIndent}${mediaQueryPart} {\n${sortedInnerBlocks.join("\n\n")}\n${currentIndent}}`;
      }
    } else if (block.startsWith("@keyframes")) {
      // Pour les keyframes, on préserve l'ordre mais on trie les propriétés à l'intérieur
      const openBraceIndex = block.indexOf("{");
      const closeBraceIndex = block.lastIndexOf("}");

      if (openBraceIndex !== -1 && closeBraceIndex !== -1) {
        const keyframesPart = block.substring(0, openBraceIndex).trim();
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

        // Trier chaque bloc interne avec un niveau d'indentation supplémentaire
        const sortedInnerBlocks = innerBlocks.map((block) =>
          sortProperties(block, nestingLevel + 1)
        );

        // Reconstruire le bloc keyframes avec l'indentation appropriée
        return `${currentIndent}${keyframesPart} {\n${sortedInnerBlocks.join("\n\n")}\n${currentIndent}}`;
      }
    }

    // Si ce n'est pas un bloc spécial ou si le traitement a échoué, essayer de trier comme un bloc normal
    return sortProperties(block, nestingLevel);
  };

  // Traiter chaque partie avec un niveau d'indentation de 0 (premier niveau)
  const processedParts = parts.map((part) => processSpecialBlock(part, 0));

  // Reconstruire le CSS
  return processedParts.join("\n\n");
}
