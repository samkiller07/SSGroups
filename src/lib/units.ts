import { UnitType } from '@/types';
import { formatPrice } from './utils';

export const SUPPORTED_UNITS: { value: UnitType; label: string; defaultMultiplier: number }[] = [
  { value: 'piece', label: 'Piece (pc)', defaultMultiplier: 1 },
  { value: 'pair', label: 'Pair (2 pcs)', defaultMultiplier: 1 },
  { value: 'set', label: 'Set', defaultMultiplier: 1 },
  { value: 'box', label: 'Box', defaultMultiplier: 1 },
  { value: 'pack', label: 'Pack', defaultMultiplier: 1 },
  { value: 'kg', label: 'Kilogram (kg)', defaultMultiplier: 1 },
  { value: 'g', label: 'Gram (g)', defaultMultiplier: 500 },
  { value: 'litre', label: 'Litre (L)', defaultMultiplier: 1 },
  { value: 'ml', label: 'Millilitre (ml)', defaultMultiplier: 500 },
  { value: 'metre', label: 'Metre (m)', defaultMultiplier: 1 },
  { value: 'roll', label: 'Roll (m / coil)', defaultMultiplier: 1 },
  { value: 'bottle', label: 'Bottle', defaultMultiplier: 1 },
  { value: 'packet', label: 'Packet', defaultMultiplier: 1 },
  { value: 'plate', label: 'Plate (Meal / Dish)', defaultMultiplier: 1 },
  { value: 'portion', label: 'Portion (Serving)', defaultMultiplier: 1 },
  { value: 'service', label: 'Service / Visit', defaultMultiplier: 1 },
];

export function formatUnitLabel(unitType?: UnitType, unitValue: number = 1): string {
  if (!unitType) return '';

  if (unitType === 'g' || unitType === 'ml' || unitType === 'metre') {
    return `${unitValue} ${unitType}`;
  }

  if (unitValue > 1) {
    if (unitType === 'pair') return `${unitValue} pairs`;
    if (unitType === 'box') return `${unitValue} boxes`;
    return `${unitValue} ${unitType}s`;
  }

  return unitType;
}

export function formatPriceWithUnit(
  price?: number | null,
  unitType?: UnitType,
  unitValue: number = 1
): string {
  if (price === undefined || price === null) return '₹0';
  const priceStr = formatPrice(price);
  if (!unitType) return priceStr;
  const unitStr = formatUnitLabel(unitType, unitValue);
  return `${priceStr} / ${unitStr}`;
}

export function formatStockDisplay(
  stockQuantity: number | null | undefined,
  unitType?: UnitType,
  unitValue: number = 1
): string {
  if (stockQuantity === null || stockQuantity === undefined) {
    return unitType === 'service' ? 'Service Available in Coimbatore' : 'In Stock';
  }
  if (stockQuantity <= 0) {
    return 'Out of Stock';
  }
  const unitStr = formatUnitLabel(unitType, unitValue);
  return `${stockQuantity} ${unitStr} available`;
}
