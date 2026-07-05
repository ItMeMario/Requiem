import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Shield, Heart, Swords, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Info } from 'lucide-react';
import { MonsterDetailModal } from '../modals/MonsterDetailModal';

// Type definition for Monster
interface Monster {
  name: string;
  meta: string;
  "Armor Class": string;
  "Hit Points": string;
  Speed: string;
  STR: string;
  STR_mod: string;
  DEX: string;
  DEX_mod: string;
  CON: string;
  CON_mod: string;
  INT: string;
  INT_mod: string;
  WIS: string;
  WIS_mod: string;
  CHA: string;
  CHA_mod: string;
  "Saving Throws"?: string;
  Skills?: string;
  Senses?: string;
  Languages?: string;
  Challenge: string;
  Traits?: string;
  Actions?: string;
  "Legendary Actions"?: string;
  Reactions?: string;
  "Damage Resistances"?: string;
  "Damage Vulnerabilities"?: string;
  "Damage Immunities"?: string;
  "Condition Immunities"?: string;
  img_url?: string;
}

// Dynamically load all XML bestiary files in the monsters directory
const xmlModules = import.meta.glob('../../../monsters/*.xml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

// XML parsing function to map XML elements into standard Monster interface
const parseVolosXml = (xmlStr: string): Monster[] => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');
    const monsterEls = doc.getElementsByTagName('monster');
    const monsters: Monster[] = [];

    const sizeMap: Record<string, string> = {
      T: 'Tiny',
      S: 'Small',
      M: 'Medium',
      L: 'Large',
      H: 'Huge',
      G: 'Gargantuan'
    };

    const xpMap: Record<string, string> = {
      '0': '10 XP', '1/8': '25 XP', '1/4': '50 XP', '1/2': '100 XP',
      '1': '200 XP', '2': '450 XP', '3': '700 XP', '4': '1,100 XP',
      '5': '1,800 XP', '6': '2,300 XP', '7': '2,900 XP', '8': '3,900 XP',
      '9': '5,000 XP', '10': '5,900 XP', '11': '7,200 XP', '12': '8,400 XP',
      '13': '10,000 XP', '14': '11,500 XP', '15': '13,000 XP', '16': '15,000 XP',
      '17': '18,000 XP', '18': '20,000 XP', '19': '22,000 XP', '20': '25,000 XP',
      '21': '33,000 XP', '22': '41,000 XP', '23': '50,000 XP', '24': '62,000 XP',
      '25': '75,000 XP', '26': '90,000 XP', '27': '105,000 XP', '28': '120,000 XP',
      '29': '135,000 XP', '30': '155,000 XP'
    };

    const calculateMod = (valStr: string): string => {
      const val = parseInt(valStr, 10);
      if (isNaN(val)) return '(+0)';
      const mod = Math.floor((val - 10) / 2);
      return mod >= 0 ? `(+${mod})` : `(${mod})`;
    };

    const getElementText = (el: Element, tagName: string): string => {
      const target = el.getElementsByTagName(tagName)[0];
      return target ? target.textContent || '' : '';
    };

    const formatBlocks = (el: Element, tagName: string): string => {
      const blocks = el.getElementsByTagName(tagName);
      if (blocks.length === 0) return '';
      
      let html = '';
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockName = block.getElementsByTagName('name')[0]?.textContent || '';
        const texts = block.getElementsByTagName('text');
        
        let blockHtml = '';
        const textParagraphs: string[] = [];
        for (let j = 0; j < texts.length; j++) {
          const t = texts[j].textContent;
          if (t && t.trim() !== '') {
            textParagraphs.push(t.trim());
          }
        }

        if (textParagraphs.length > 0) {
          if (blockName) {
            blockHtml += `<p><em><strong>${blockName}.</strong></em> ${textParagraphs[0]}</p>`;
            for (let j = 1; j < textParagraphs.length; j++) {
              blockHtml += `<p>${textParagraphs[j]}</p>`;
            }
          } else {
            for (let j = 0; j < textParagraphs.length; j++) {
              blockHtml += `<p>${textParagraphs[j]}</p>`;
            }
          }
        }
        html += blockHtml;
      }
      return html;
    };

    for (let i = 0; i < monsterEls.length; i++) {
      const el = monsterEls[i];
      const name = getElementText(el, 'name');
      if (!name) continue;

      const size = getElementText(el, 'size');
      const sizeStr = sizeMap[size.toUpperCase()] || size;
      const type = getElementText(el, 'type');
      const alignment = getElementText(el, 'alignment');
      const meta = `${sizeStr} ${type}${alignment ? `, ${alignment}` : ''}`;

      const ac = getElementText(el, 'ac');
      const hp = getElementText(el, 'hp');
      const speed = getElementText(el, 'speed');

      const str = getElementText(el, 'str') || '10';
      const dex = getElementText(el, 'dex') || '10';
      const con = getElementText(el, 'con') || '10';
      const int = getElementText(el, 'int') || '10';
      const wis = getElementText(el, 'wis') || '10';
      const cha = getElementText(el, 'cha') || '10';

      const save = getElementText(el, 'save');
      const skill = getElementText(el, 'skill');
      const senses = getElementText(el, 'senses');
      const passive = getElementText(el, 'passive');
      const languages = getElementText(el, 'languages');
      const cr = getElementText(el, 'cr');

      const formattedCR = cr ? `${cr} (${xpMap[cr] || '0 XP'})` : '';

      let sensesStr = senses;
      if (passive) {
        sensesStr = sensesStr ? `${sensesStr}, passive Perception ${passive}` : `passive Perception ${passive}`;
      }

      const resist = getElementText(el, 'resist');
      const vulnerable = getElementText(el, 'vulnerable');
      const immune = getElementText(el, 'immune');
      const conditionImmune = getElementText(el, 'conditionImmune');

      const traitsHtml = formatBlocks(el, 'trait');
      const actionsHtml = formatBlocks(el, 'action');
      const legendaryHtml = formatBlocks(el, 'legendary');
      const reactionsHtml = formatBlocks(el, 'reaction');

      const monster: Monster = {
        name,
        meta,
        "Armor Class": ac,
        "Hit Points": hp,
        Speed: speed,
        STR: str,
        STR_mod: calculateMod(str),
        DEX: dex,
        DEX_mod: calculateMod(dex),
        CON: con,
        CON_mod: calculateMod(con),
        INT: int,
        INT_mod: calculateMod(int),
        WIS: wis,
        WIS_mod: calculateMod(wis),
        CHA: cha,
        CHA_mod: calculateMod(cha),
        "Saving Throws": save || undefined,
        Skills: skill || undefined,
        Senses: sensesStr || undefined,
        Languages: languages || undefined,
        Challenge: formattedCR,
        Traits: traitsHtml || undefined,
        Actions: actionsHtml || undefined,
        "Legendary Actions": legendaryHtml || undefined,
        Reactions: reactionsHtml || undefined,
        "Damage Resistances": resist || undefined,
        "Damage Vulnerabilities": vulnerable || undefined,
        "Damage Immunities": immune || undefined,
        "Condition Immunities": conditionImmune || undefined,
      };

      monsters.push(monster);
    }
    return monsters;
  } catch (err) {
    console.error("Error parsing XML compendium:", err);
    return [];
  }
};

// Compile and sort all loaded XML monsters alphabetically
const monstersData: Monster[] = Object.values(xmlModules).flatMap((xmlStr) => {
  return parseVolosXml(xmlStr);
}).sort((a, b) => a.name.localeCompare(b.name));

interface MonsterListProps {
  theme: string;
}

const CR_OPTIONS = [
  { label: '0', value: 0 },
  { label: '1/8', value: 0.125 },
  { label: '1/4', value: 0.25 },
  { label: '1/2', value: 0.5 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: '11', value: 11 },
  { label: '12', value: 12 },
  { label: '13', value: 13 },
  { label: '14', value: 14 },
  { label: '15', value: 15 },
  { label: '16', value: 16 },
  { label: '17', value: 17 },
  { label: '18', value: 18 },
  { label: '19', value: 19 },
  { label: '20', value: 20 },
  { label: '21', value: 21 },
  { label: '22', value: 22 },
  { label: '23', value: 23 },
  { label: '24', value: 24 },
  { label: '25', value: 25 },
  { label: '26', value: 26 },
  { label: '27', value: 27 },
  { label: '28', value: 28 },
  { label: '29', value: 29 },
  { label: '30', value: 30 },
];

export const MonsterList: React.FC<MonsterListProps> = ({ theme }) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minAC, setMinAC] = useState<string>('');
  const [maxAC, setMaxAC] = useState<string>('');
  const [minCR, setMinCR] = useState<string>('all');
  const [maxCR, setMaxCR] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Temporary selected monster placeholder state (will connect to detail modal in Phase 3)
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);

  // Helper parsers
  const parseAC = (acStr: string): number => {
    if (!acStr) return 0;
    const match = acStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const parseCR = (crStr: string): number => {
    if (!crStr) return 0;
    const crPart = crStr.trim().split(' ')[0];
    if (crPart === '1/8') return 0.125;
    if (crPart === '1/4') return 0.25;
    if (crPart === '1/2') return 0.5;
    const parsed = parseFloat(crPart);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setMinAC('');
    setMaxAC('');
    setMinCR('all');
    setMaxCR('all');
    setCurrentPage(1);
  };

  // Filtered Monsters list
  const filteredMonsters = useMemo(() => {
    setCurrentPage(1); // Reset page on filter update
    return monstersData.filter((monster) => {
      // 1. Text Search matching name or meta
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = monster.name.toLowerCase().includes(query);
        const matchesMeta = monster.meta ? monster.meta.toLowerCase().includes(query) : false;
        if (!matchesName && !matchesMeta) return false;
      }

      // 2. Armor Class limits
      const ac = parseAC(monster["Armor Class"]);
      if (minAC !== '') {
        const minVal = parseInt(minAC, 10);
        if (!isNaN(minVal) && ac < minVal) return false;
      }
      if (maxAC !== '') {
        const maxVal = parseInt(maxAC, 10);
        if (!isNaN(maxVal) && ac > maxVal) return false;
      }

      // 3. Challenge Rating limits
      const cr = parseCR(monster.Challenge);
      if (minCR !== 'all') {
        const minVal = parseFloat(minCR);
        if (!isNaN(minVal) && cr < minVal) return false;
      }
      if (maxCR !== 'all') {
        const maxVal = parseFloat(maxCR);
        if (!isNaN(maxVal) && cr > maxVal) return false;
      }

      return true;
    });
  }, [searchQuery, minAC, maxAC, minCR, maxCR]);

  // Paginated Results
  const totalPages = Math.ceil(filteredMonsters.length / itemsPerPage) || 1;
  const paginatedMonsters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMonsters.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMonsters, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll list container to top smoothly
      const el = document.querySelector('.layout-scroll-area');
      if (el) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-xl font-bold text-secondary tracking-wide flex items-center gap-2">
            <Swords className="text-accent" size={22} /> Bestiary
          </h3>
          <p className="text-xs text-muted mt-1">
            Browse and filter through {filteredMonsters.length} of {monstersData.length} available RPG monsters.
          </p>
        </div>

        {/* Search Input and Collapsible Button */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search by name or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-surface-input border border-border-default rounded text-sm text-primary placeholder-muted focus:border-accent focus:outline-none transition-colors"
            />
            <Search className="absolute left-3 top-2.5 text-muted" size={16} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-muted hover:text-heading"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded text-xs transition-colors shrink-0 font-medium ${
              showFilters || minAC || maxAC || minCR !== 'all' || maxCR !== 'all'
                ? 'border-accent bg-accent-muted-bg text-accent-text'
                : 'border-border-default bg-surface-hover hover:opacity-90 text-secondary'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {(showFilters || minAC || maxAC || minCR !== 'all' || maxCR !== 'all') && (
        <div className="p-4 bg-surface-card border border-border-default rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300">
          {/* Armor Class Filters */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-accent-text uppercase tracking-wider block">Armor Class (AC)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minAC}
                onChange={(e) => setMinAC(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-input border border-border-default rounded text-xs text-primary focus:border-accent focus:outline-none"
              />
              <span className="text-muted text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxAC}
                onChange={(e) => setMaxAC(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-input border border-border-default rounded text-xs text-primary focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Challenge Rating Filters */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-accent-text uppercase tracking-wider block">Min Challenge (CR)</label>
            <select
              value={minCR}
              onChange={(e) => setMinCR(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-surface-input border border-border-default rounded text-xs text-primary focus:border-accent focus:outline-none"
            >
              <option value="all">All</option>
              {CR_OPTIONS.map((opt) => (
                <option key={`min-cr-${opt.label}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-accent-text uppercase tracking-wider block">Max Challenge (CR)</label>
            <select
              value={maxCR}
              onChange={(e) => setMaxCR(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-surface-input border border-border-default rounded text-xs text-primary focus:border-accent focus:outline-none"
            >
              <option value="all">All</option>
              {CR_OPTIONS.map((opt) => (
                <option key={`max-cr-${opt.label}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end justify-end">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-border-default hover:bg-surface-hover text-xs font-semibold rounded text-secondary hover:text-heading transition-colors w-full sm:w-auto"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Monsters Cards Grid */}
      {filteredMonsters.length === 0 ? (
        <div className="text-center py-16 text-faint italic bg-surface-card rounded-lg border border-border-subtle">
          No monsters match your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedMonsters.map((monster, index) => {
            const ac = parseAC(monster["Armor Class"]);
            const hp = monster["Hit Points"];
            const cr = monster.Challenge.split(' ')[0];

            return (
              <div
                key={`${monster.name}-${index}`}
                onClick={() => setSelectedMonster(monster)}
                className="bg-surface-card border border-border-default rounded-lg overflow-hidden hover:border-border-hover hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between shadow-md"
              >
                <div>
                  {/* Portrait or fallback icon placeholder */}
                  {monster.img_url ? (
                    <div className="h-44 w-full bg-surface-hover overflow-hidden relative">
                      <img
                        src={monster.img_url}
                        alt={monster.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="h-28 w-full bg-gradient-to-br from-surface-hover/30 to-accent-muted-bg/25 flex items-center justify-center relative">
                      <Swords size={32} className="text-icon opacity-50 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />
                    </div>
                  )}

                  {/* Info */}
                  <div className={`p-4 ${monster.img_url ? 'relative -mt-10' : ''}`}>
                    <h4 className={`text-lg font-bold truncate ${monster.img_url ? 'text-heading drop-shadow-md' : 'text-primary'}`}>
                      {monster.name}
                    </h4>
                    <p className="text-xs text-accent-text font-medium mt-0.5 truncate uppercase tracking-wide">
                      {monster.meta || "Unknown Creature"}
                    </p>
                  </div>
                </div>

                {/* Badges footer */}
                <div className="px-4 pb-4 pt-1 grid grid-cols-3 gap-2 text-center text-xs shrink-0">
                  <div className="bg-surface-hover/60 border border-border-subtle rounded py-1 px-1.5 flex flex-col items-center justify-center gap-0.5 text-secondary">
                    <Shield size={12} className="text-accent" />
                    <span className="font-bold text-primary">{ac || '—'}</span>
                    <span className="text-[10px] text-faint">AC</span>
                  </div>
                  <div className="bg-surface-hover/60 border border-border-subtle rounded py-1 px-1.5 flex flex-col items-center justify-center gap-0.5 text-secondary">
                    <Heart size={12} className="text-danger" />
                    <span className="font-bold text-primary truncate max-w-full">{hp.split(' ')[0] || '—'}</span>
                    <span className="text-[10px] text-faint">HP</span>
                  </div>
                  <div className="bg-surface-hover/60 border border-border-subtle rounded py-1 px-1.5 flex flex-col items-center justify-center gap-0.5 text-secondary">
                    <Swords size={12} className="text-accent2" />
                    <span className="font-bold text-primary">{cr || '—'}</span>
                    <span className="text-[10px] text-faint">CR</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Control Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border-subtle shrink-0">
          <div className="text-xs text-muted">
            Showing <span className="font-semibold text-primary">{Math.min(filteredMonsters.length, (currentPage - 1) * itemsPerPage + 1)}</span>
            -
            <span className="font-semibold text-primary">{Math.min(filteredMonsters.length, currentPage * itemsPerPage)}</span> of <span className="font-semibold text-primary">{filteredMonsters.length}</span> monsters
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 border border-border-default rounded bg-surface-card hover:bg-surface-hover text-secondary disabled:opacity-30 disabled:hover:bg-surface-card transition-colors"
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-border-default rounded bg-surface-card hover:bg-surface-hover text-secondary disabled:opacity-30 disabled:hover:bg-surface-card transition-colors"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-4 py-1.5 border border-border-default rounded bg-surface-elevated2 text-xs text-primary font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-border-default rounded bg-surface-card hover:bg-surface-hover text-secondary disabled:opacity-30 disabled:hover:bg-surface-card transition-colors"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 border border-border-default rounded bg-surface-card hover:bg-surface-hover text-secondary disabled:opacity-30 disabled:hover:bg-surface-card transition-colors"
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Real detailed themed monster stat block modal */}
      <MonsterDetailModal
        showModal={!!selectedMonster}
        handleClose={() => setSelectedMonster(null)}
        monster={selectedMonster}
        theme={theme}
      />
    </div>
  );
};
