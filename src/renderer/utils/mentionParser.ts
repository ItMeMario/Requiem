export const parseMentions = (html: string, characters: any[], locations: any[]) => {
  if (!html) return html;
  return html.replace(/\{([^}]+)\}/g, (match, innerHtml) => {
    const rawText = innerHtml
      .replace(/<[^>]*>?/gm, '')
      .replace(/&nbsp;|\u00A0/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();
      
    const lowerName = rawText.toLowerCase();
    if (!lowerName) return match;
    
    // Check characters
    const foundChar = 
      characters.find(c => c.name.trim().toLowerCase() === lowerName) ||
      characters.find(c => lowerName.length > 2 && c.name.trim().toLowerCase().includes(lowerName));
      
    if (foundChar) {
      return `<span class="entity-mention character-mention" data-id="${foundChar.id}" data-type="character">${rawText}</span>`;
    }
    
    // Check locations
    const foundLoc = 
      locations.find(l => l.name.trim().toLowerCase() === lowerName) ||
      locations.find(l => lowerName.length > 2 && l.name.trim().toLowerCase().includes(lowerName));
      
    if (foundLoc) {
      return `<span class="entity-mention location-mention" data-id="${foundLoc.id}" data-type="location">${rawText}</span>`;
    }
    
    return match;
  });
};
