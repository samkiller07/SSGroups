import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { dataRepository } from '@/lib/data-store';
import { BrandLayoutClient } from '@/components/BrandLayoutClient';

interface BrandLayoutProps {
  children: React.ReactNode;
  params: Promise<{ brand: string }>;
}

export async function generateMetadata({ params }: BrandLayoutProps): Promise<Metadata> {
  const { brand: brandId } = await params;
  const brand = dataRepository.getBrand(brandId);
  if (!brand) return {};

  return {
    title: brand.seo.title,
    description: brand.seo.description,
    keywords: brand.seo.keywords,
    openGraph: {
      title: brand.seo.title,
      description: brand.seo.description,
      type: 'website',
      locale: 'en_IN',
    },
  };
}

export default async function BrandLayout({
  children,
  params,
}: BrandLayoutProps) {
  const { brand: brandId } = await params;
  const brand = dataRepository.getBrand(brandId);

  if (!brand) {
    notFound();
  }

  return (
    <BrandLayoutClient brand={brand}>
      {children}
    </BrandLayoutClient>
  );
}
