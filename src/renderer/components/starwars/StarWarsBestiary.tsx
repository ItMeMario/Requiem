import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Shield,
  Heart,
  Swords,
  Globe,
  Dna,
  Users,
  Sparkles,
  Bot,
  Gauge,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Skull
} from 'lucide-react';
import { Sw5eCategory, Sw5eMonster, Sw5eSpecies, Sw5eItem } from '../../types/sw5e';
import {
  filterMonsters,
  filterSpecies,
  getAllMonsters,
  getAllSpecies,
  getSpeciesImageUrl,
  parseCR
} from '../../services/sw5eService';
import { StarWarsDetailModal } from './StarWarsDetailModal';

interface StarWarsBestiaryProps {
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
  { label: '23', value: 23 },
  { label: '24', value: 24 },
  { label: '25', value: 25 },
  { label: '26', value: 26 },
];

const SIZE_OPTIONS = ['all', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
const MONSTER_TYPE_OPTIONS = ['all', 'beast', 'droid', 'humanoid', 'construct', 'undead', 'aberration', 'plant'];

/**
 * Image component for species with graceful fallback
 */
const SpeciesCardImage: React.FC<{ species: Sw5eSpecies }> = ({ species }) => {
  const [hasError, setHasError] = useState(false);
  const imageUrl = getSpeciesImageUrl(species);

  if (hasError || !imageUrl) {
    return (
      <div className="h-44 w-full bg-gradient-to-br from-surface-hover/50 via-surface-card to-accent-muted-bg/20 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
        <Dna size={40} className="text-icon opacity-40 mb-2 group-hover:scale-110 transition-transform duration-300" />
        <span className="text-[10px] text-faint uppercase tracking-wider px-2 py-0.5 rounded bg-surface-elevated/40 border border-border-subtle">
          Species Record
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="h-44 w-full bg-surface-hover overflow-hidden relative">
      <img
        src={imageUrl}
        alt={species.name}
        loading="lazy"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/20 to-transparent pointer-events-none" />
    </div>
  );
};

/**
 * Banner placeholder for monsters matching theme aesthetics
 */
const MonsterCardBanner: React.FC<{ monster: Sw5eMonster }> = ({ monster }) => {
  const isDroid = monster.types?.some(t => t.toLowerCase().includes('droid'));
  const isBeast = monster.types?.some(t => t.toLowerCase().includes('beast'));

  const Icon = isDroid ? Bot : isBeast ? Skull : Swords;

  return (
    <div className="h-32 w-full bg-gradient-to-br from-surface-hover/60 via-surface-card to-accent-muted-bg/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
      <Icon size={36} className="text-icon opacity-40 mb-1 group-hover:scale-110 transition-transform duration-300" />
      <span className="text-[10px] text-faint uppercase tracking-wider px-2 py-0.5 rounded bg-surface-elevated/40 border border-border-subtle">
        {monster.types?.[0] || 'Creature'}
      </span>
      <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export const StarWarsBestiary: React.FC<StarWarsBestiaryProps> = ({ theme }) => {
  // Category state
  const [activeCategory, setActiveCategory] = useState<Sw5eCategory>('monsters');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minCR, setMinCR] = useState<string>('all');
  const [maxCR, setMaxCR] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selected Item for Detail Modal
  const [selectedItem, setSelectedItem] = useState<{
    item: Sw5eItem;
    category: Sw5eCategory;
  } | null>(null);

  // Total counts
  const totalMonstersCount = getAllMonsters().length;
  const totalSpeciesCount = getAllSpecies().length;

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setMinCR('all');
    setMaxCR('all');
    setSelectedSize('all');
    setSelectedType('all');
    setCurrentPage(1);
  };

  const handleCategorySwitch = (cat: Sw5eCategory) => {
    if (cat !== activeCategory) {
      setActiveCategory(cat);
      setSearchQuery('');
      setCurrentPage(1);
    }
  };

  // Filtered dataset
  const filteredItems = useMemo(() => {
    setCurrentPage(1);
    if (activeCategory === 'monsters') {
      return filterMonsters(searchQuery, minCR, maxCR, selectedSize, selectedType);
    } else {
      return filterSpecies(searchQuery, selectedSize);
    }
  }, [activeCategory, searchQuery, minCR, maxCR, selectedSize, selectedType]);

  // Paginated dataset
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const el = document.querySelector('.layout-scroll-area');
      if (el) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const isMonster = activeCategory === 'monsters';

  return (
    <div className="space-y-6">
      {/* Category Sub-Tabs */}
      <div className="grid grid-cols-2 gap-3 max-w-xl">
        <button
          type="button"
          onClick={() => handleCategorySwitch('monsters')}
          className={`p-3 rounded-lg border flex items-center gap-3 transition-all text-left cursor-pointer ${
            isMonster
              ? 'bg-accent-muted-bg/40 border-accent shadow-sm'
              : 'bg-surface-card border-border-default hover:border-border-hover hover:bg-surface-hover'
          }`}
        >
          <div className={`p-2 rounded-md shrink-0 ${isMonster ? 'bg-accent text-accent-fg shadow-sm' : 'bg-surface-hover text-muted'}`}>
            <Swords size={20} />
          </div>
          <div className="min-w-0">
            <div className={`text-sm font-bold truncate ${isMonster ? 'text-accent-text' : 'text-primary'}`}>
              Monsters &amp; NPCs
            </div>
            <div className="text-[11px] text-faint truncate">
              {totalMonstersCount} combat statblocks
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleCategorySwitch('species')}
          className={`p-3 rounded-lg border flex items-center gap-3 transition-all text-left cursor-pointer ${
            !isMonster
              ? 'bg-accent-muted-bg/40 border-accent shadow-sm'
              : 'bg-surface-card border-border-default hover:border-border-hover hover:bg-surface-hover'
          }`}
        >
          <div className={`p-2 rounded-md shrink-0 ${!isMonster ? 'bg-accent text-accent-fg shadow-sm' : 'bg-surface-hover text-muted'}`}>
            <Dna size={20} />
          </div>
          <div className="min-w-0">
            <div className={`text-sm font-bold truncate ${!isMonster ? 'text-accent-text' : 'text-primary'}`}>
              Playable Species
            </div>
            <div className="text-[11px] text-faint truncate">
              {totalSpeciesCount} galactic species
            </div>
          </div>
        </button>
      </div>

      {/* Header Bar with Search & Counter */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-xl font-bold text-secondary tracking-wide flex items-center gap-2">
            <Sparkles className="text-accent" size={20} />
            {isMonster ? 'SW5e Monster Manual' : 'SW5e Galactic Species'}
          </h3>
          <p className="text-xs text-muted mt-1">
            Displaying {filteredItems.length} of {isMonster ? totalMonstersCount : totalSpeciesCount} offline compendium records.
          </p>
        </div>

        {/* Search Input and Collapsible Button */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder={isMonster ? "Search by name, type, or alignment..." : "Search by name, homeworld, trait..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-surface-input border border-border-default rounded text-sm text-primary placeholder-muted focus:border-accent focus:outline-none transition-colors"
            />
            <Search className="absolute left-3 top-2.5 text-muted" size={16} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-muted hover:text-heading cursor-pointer"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded text-xs transition-colors shrink-0 font-medium cursor-pointer ${
              showFilters || minCR !== 'all' || maxCR !== 'all' || selectedSize !== 'all' || selectedType !== 'all'
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
      {(showFilters || minCR !== 'all' || maxCR !== 'all' || selectedSize !== 'all' || selectedType !== 'all') && (
        <div className="p-4 bg-surface-card border border-border-default rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300">
          {/* Challenge Rating Filters (Monsters only) */}
          {isMonster && (
            <>
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
            </>
          )}

          {/* Size Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-accent-text uppercase tracking-wider block">Size</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-surface-input border border-border-default rounded text-xs text-primary focus:border-accent focus:outline-none"
            >
              {SIZE_OPTIONS.map((s) => (
                <option key={`size-${s}`} value={s}>
                  {s === 'all' ? 'All Sizes' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter (Monsters only) */}
          {isMonster && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-accent-text uppercase tracking-wider block">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-input border border-border-default rounded text-xs text-primary focus:border-accent focus:outline-none capitalize"
              >
                {MONSTER_TYPE_OPTIONS.map((t) => (
                  <option key={`type-${t}`} value={t}>
                    {t === 'all' ? 'All Types' : t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-end justify-end">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-border-default hover:bg-surface-hover text-xs font-semibold rounded text-secondary hover:text-heading transition-colors w-full sm:w-auto cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-faint italic bg-surface-card rounded-lg border border-border-subtle space-y-2">
          <p className="text-sm text-muted">No SW5e records match your search filters.</p>
          {(searchQuery || minCR !== 'all' || maxCR !== 'all' || selectedSize !== 'all' || selectedType !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-accent hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((item, index) => {
            if (isMonster) {
              const monster = item as Sw5eMonster;
              return (
                <div
                  key={`${monster.name}-${index}`}
                  onClick={() => setSelectedItem({ item: monster, category: 'monsters' })}
                  className="bg-surface-card border border-border-default rounded-lg overflow-hidden hover:border-border-hover hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between shadow-md"
                >
                  <div>
                    <MonsterCardBanner monster={monster} />

                    {/* Info */}
                    <div className="p-4 relative -mt-6">
                      <h4 className="text-lg font-bold truncate text-heading drop-shadow-md">
                        {monster.name}
                      </h4>
                      <p className="text-xs text-accent-text font-medium mt-0.5 truncate uppercase tracking-wide">
                        {monster.size} {monster.types?.join(', ') || 'Creature'}
                      </p>
                    </div>
                  </div>

                  {/* Badges footer (AC / HP / CR) matching Requiem convention */}
                  <div className="px-4 pb-4 pt-1 grid grid-cols-3 gap-2 text-center text-xs shrink-0">
                    <div className="bg-surface-hover/60 border border-border-subtle rounded py-1 px-1.5 flex flex-col items-center justify-center gap-0.5 text-secondary">
                      <Shield size={12} className="text-accent" />
                      <span className="font-bold text-primary">{monster.armorClass}</span>
                      <span className="text-[10px] text-faint">AC</span>
                    </div>
                    <div className="bg-surface-hover/60 border border-border-subtle rounded py-1 px-1.5 flex flex-col items-center justify-center gap-0.5 text-secondary">
                      <Heart size={12} className="text-danger" />
                      <span className="font-bold text-primary truncate max-w-full">{monster.hitPoints}</span>
                      <span className="text-[10px] text-faint">HP</span>
                    </div>
                    <div className="bg-surface-hover/60 border border-border-subtle rounded py-1 px-1.5 flex flex-col items-center justify-center gap-0.5 text-secondary">
                      <Swords size={12} className="text-accent2" />
                      <span className="font-bold text-primary">{monster.challengeRating || '0'}</span>
                      <span className="text-[10px] text-faint">CR</span>
                    </div>
                  </div>
                </div>
              );
            } else {
              const species = item as Sw5eSpecies;
              return (
                <div
                  key={`${species.name}-${index}`}
                  onClick={() => setSelectedItem({ item: species, category: 'species' })}
                  className="bg-surface-card border border-border-default rounded-lg overflow-hidden hover:border-border-hover hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between shadow-md"
                >
                  <div>
                    <SpeciesCardImage species={species} />

                    {/* Info */}
                    <div className="p-4 relative -mt-8">
                      <h4 className="text-lg font-bold truncate text-heading drop-shadow-md">
                        {species.name}
                      </h4>
                      <p className="text-xs text-accent-text font-medium mt-0.5 truncate uppercase tracking-wide">
                        Homeworld: {species.homeworld || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {/* Badges footer (Size / Speed / Traits) */}
                  <div className="px-4 pb-4 pt-1 grid grid-cols-3 gap-2 text-center text-xs shrink-0">
                    <div className="bg-surface-hover/60 border border-border-subtle rounded py-1 px-1.5 flex flex-col items-center justify-center gap-0.5 text-secondary">
                      <Tag size={12} className="text-accent" />
                      <span className="font-bold text-primary">{species.size}</span>
                      <span className="text-[10px] text-faint">Size</span>
                    </div>
                    <div className="bg-surface-hover/60 border border-border-subtle rounded py-1 px-1.5 flex flex-col items-center justify-center gap-0.5 text-secondary">
                      <Gauge size={12} className="text-accent2" />
                      <span className="font-bold text-primary">30 ft.</span>
                      <span className="text-[10px] text-faint">Speed</span>
                    </div>
                    <div className="bg-surface-hover/60 border border-border-subtle rounded py-1 px-1.5 flex flex-col items-center justify-center gap-0.5 text-secondary">
                      <Sparkles size={12} className="text-secondary" />
                      <span className="font-bold text-primary">{species.traits?.length || 0}</span>
                      <span className="text-[10px] text-faint">Traits</span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border-subtle shrink-0">
          <div className="text-xs text-muted">
            Showing <span className="font-semibold text-primary">{Math.min(filteredItems.length, (currentPage - 1) * itemsPerPage + 1)}</span>
            -
            <span className="font-semibold text-primary">{Math.min(filteredItems.length, currentPage * itemsPerPage)}</span> of{' '}
            <span className="font-semibold text-primary">{filteredItems.length}</span> {isMonster ? 'monsters' : 'species'}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 border border-border-default rounded bg-surface-card hover:bg-surface-hover text-secondary disabled:opacity-30 disabled:hover:bg-surface-card transition-colors cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-border-default rounded bg-surface-card hover:bg-surface-hover text-secondary disabled:opacity-30 disabled:hover:bg-surface-card transition-colors cursor-pointer"
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
              className="p-2 border border-border-default rounded bg-surface-card hover:bg-surface-hover text-secondary disabled:opacity-30 disabled:hover:bg-surface-card transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 border border-border-default rounded bg-surface-card hover:bg-surface-hover text-secondary disabled:opacity-30 disabled:hover:bg-surface-card transition-colors cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* SW5e Detail Modal */}
      <StarWarsDetailModal
        showModal={!!selectedItem}
        handleClose={() => setSelectedItem(null)}
        item={selectedItem?.item || null}
        category={selectedItem?.category || null}
        theme={theme}
      />
    </div>
  );
};
