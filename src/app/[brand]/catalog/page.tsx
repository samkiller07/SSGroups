'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { dataRepository } from '@/lib/data-store';
import { ProductCard } from '@/components/ProductCard';
import { getPublicCatalogAction } from '@/app/actions/admin-actions';
import { CatalogItem, Category } from '@/types';
import { 
  Search, 
  Layers, 
  X, 
  Filter, 
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

function CatalogContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const brandId = params.brand as string;

  const brand = dataRepository.getBrand(brandId);
  const [categories, setCategories] = useState<Category[]>(() => dataRepository.getCategoriesByBrand(brandId));
  const [allItems, setAllItems] = useState<CatalogItem[]>(() => dataRepository.getCatalogItems(brandId));

  const initialCategory = searchParams.get('category') || 'ALL';
  const initialType = (searchParams.get('type') as 'ALL' | 'PRODUCT' | 'SERVICE') || 'ALL';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedType, setSelectedType] = useState<'ALL' | 'PRODUCT' | 'SERVICE'>(initialType);
  const [sortBy, setSortBy] = useState<'FEATURED' | 'PRICE_LOW' | 'PRICE_HIGH' | 'NAME'>('FEATURED');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync with persistent Supabase catalog
  useEffect(() => {
    if (!brandId) return;
    getPublicCatalogAction(brandId)
      .then((res) => {
        if (res && res.success) {
          if (res.items && res.items.length > 0) setAllItems(res.items);
          if (res.categories && res.categories.length > 0) setCategories(res.categories);
        }
      })
      .catch((err) => console.error('[Catalog] Error loading public catalog:', err));
  }, [brandId]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let result = [...allItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.categoryName && i.categoryName.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter((i) => i.categoryId === selectedCategory);
    }

    if (selectedType !== 'ALL') {
      result = result.filter((i) => i.itemType === selectedType);
    }

    if (onlyAvailable) {
      result = result.filter((i) => i.isAvailable);
    }

    // Sorting
    switch (sortBy) {
      case 'PRICE_LOW':
        result.sort((a, b) => {
          const pA = a.offerPrice ?? a.originalPrice ?? 0;
          const pB = b.offerPrice ?? b.originalPrice ?? 0;
          return pA - pB;
        });
        break;
      case 'PRICE_HIGH':
        result.sort((a, b) => {
          const pA = a.offerPrice ?? a.originalPrice ?? 0;
          const pB = b.offerPrice ?? b.originalPrice ?? 0;
          return pB - pA;
        });
        break;
      case 'NAME':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'FEATURED':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [allItems, searchQuery, selectedCategory, selectedType, onlyAvailable, sortBy]);

  if (!brand) return null;

  const getCatalogTheme = () => {
    switch (brand.id) {
      case 'aquarium':
        return {
          accent: 'text-cyan-600 dark:text-cyan-400',
          activeBtn: 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-black',
          activeCategory: 'bg-cyan-100 text-cyan-950 border-cyan-300 font-bold dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-700/60',
          searchBorder: 'focus:border-cyan-500',
        };
      case 'kirubai':
        return {
          accent: 'text-orange-600 dark:text-amber-400',
          activeBtn: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white dark:text-slate-950 font-black',
          activeCategory: 'bg-orange-100 text-orange-950 border-orange-300 font-bold dark:bg-orange-950 dark:text-amber-300 dark:border-orange-700/60',
          searchBorder: 'focus:border-orange-500',
        };
      case 'vision-360':
      default:
        return {
          accent: 'text-blue-600 dark:text-blue-400',
          activeBtn: 'bg-blue-700 dark:bg-blue-600 text-white font-black',
          activeCategory: 'bg-blue-100 text-blue-950 border-blue-300 font-bold dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700/60',
          searchBorder: 'focus:border-blue-500',
        };
    }
  };

  const theme = getCatalogTheme();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1">
      {/* Header Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{brand.name} Catalog Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Browse All Offerings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Explore authentic items and services available directly from our Coimbatore store.
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
        >
          <SlidersHorizontal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Filters & Sort ({filteredItems.length} results)</span>
        </button>
      </div>

      {/* Main Grid: Left Sidebar Filters + Right Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className={`lg:col-span-3 space-y-6 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-5 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Refine Search
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedType('ALL');
                  setOnlyAvailable(false);
                  setSortBy('FEATURED');
                }}
                className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Search Input */}
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block mb-1.5">Keywords</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Fish, dish, model..."
                  className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none ${theme.searchBorder}`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Type Selector (Product vs Service) */}
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block mb-1.5">Offering Type</label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px]">
                <button
                  onClick={() => setSelectedType('ALL')}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    selectedType === 'ALL' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedType('PRODUCT')}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    selectedType === 'PRODUCT' ? theme.activeBtn : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Items
                </button>
                <button
                  onClick={() => setSelectedType('SERVICE')}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    selectedType === 'SERVICE' ? 'bg-emerald-600 text-white font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Services
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block mb-1.5">Categories</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    selectedCategory === 'ALL'
                      ? theme.activeCategory
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-950/80 border border-transparent'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] opacity-75">{allItems.length}</span>
                </button>
                {categories.map((cat) => {
                  const count = allItems.filter((i) => i.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        selectedCategory === cat.id
                          ? theme.activeCategory
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-950/80 border border-transparent'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] opacity-75">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In-Stock Only Toggle */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="font-medium">In Stock & Active only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Right Product Grid Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-700 dark:text-slate-300">
              Showing <span className="font-extrabold text-slate-950 dark:text-white">{filteredItems.length}</span> items in {brand.name}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="FEATURED">Featured First</option>
                <option value="PRICE_LOW">Price: Low to High</option>
                <option value="PRICE_HIGH">Price: High to Low</option>
                <option value="NAME">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ProductCard key={item.id} item={item} brand={brand} />
              ))}
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">No catalog items found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  We couldn’t find any items matching your selected criteria. Try adjusting the search or category filters.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedType('ALL');
                  setOnlyAvailable(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BrandCatalogPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-slate-500 text-xs text-center">Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
