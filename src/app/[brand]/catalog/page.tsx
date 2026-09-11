import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPersistentBrandCatalog } from '@/lib/catalog-service';
import { CatalogContent } from './CatalogContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BrandCatalogPageProps {
  params: Promise<{ brand: string }>;
}

export default async function BrandCatalogPage({ params }: BrandCatalogPageProps) {
  const { brand: brandId } = await params;
  const catalogData = await getPersistentBrandCatalog(brandId);

  if (!catalogData.brand) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-slate-500 text-xs text-center">Loading catalog...</div>}>
      <CatalogContent 
        brandId={brandId}
        brand={catalogData.brand}
        initialItems={catalogData.allItems}
        initialCategories={catalogData.categories}
      />
    </Suspense>
  );
}
