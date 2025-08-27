import React, { useEffect, useState } from "react";

interface CategoryFiltersProps {
  onChange?: (filters: {
    sizes: string[];
    colors: string[];
    priceMin?: number;
    priceMax?: number;
    sort?: string;
  }) => void;
  value?: {
    sizes?: string[];
    colors?: string[];
    priceMin?: number;
    priceMax?: number;
    sort?: string;
  };
}

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["Black", "White", "Red", "Blue"];
const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({ onChange, value }) => {
  const [sizes, setSizes] = useState<string[]>(value?.sizes || []);
  const [colors, setColors] = useState<string[]>(value?.colors || []);
  const [priceMin, setPriceMin] = useState<string>(
    value?.priceMin !== undefined ? String(value.priceMin) : ""
  );
  const [priceMax, setPriceMax] = useState<string>(
    value?.priceMax !== undefined ? String(value.priceMax) : ""
  );
  const [sort, setSort] = useState<string>(value?.sort || "relevance");

  // Sync internal state if parent value changes
  useEffect(() => {
    if (!value) return;
    setSizes(value.sizes || []);
    setColors(value.colors || []);
    setPriceMin(value.priceMin !== undefined ? String(value.priceMin) : "");
    setPriceMax(value.priceMax !== undefined ? String(value.priceMax) : "");
    setSort(value.sort || "relevance");
  }, [value?.sizes, value?.colors, value?.priceMin, value?.priceMax, value?.sort]);

  const toggleInArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const emit = () => {
    onChange?.({
      sizes,
      colors,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      sort,
    });
  };

  return (
    <aside className="w-full md:w-64 lg:w-72 xl:w-80 md:sticky md:top-20 md:self-start bg-white border border-gray-200 rounded-lg p-4 md:p-5">
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Sort</h3>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            emit();
          }}
          className="w-full border rounded-md px-3 py-2"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const active = sizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => {
                  setSizes((prev) => {
                    const next = toggleInArray(prev, s);
                    setTimeout(emit, 0);
                    return next;
                  });
                }}
                className={`px-3 py-1.5 rounded-md border ${
                  active ? "bg-black text-white border-black" : "bg-white"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => {
            const active = colors.includes(c);
            return (
              <button
                key={c}
                onClick={() => {
                  setColors((prev) => {
                    const next = toggleInArray(prev, c);
                    setTimeout(emit, 0);
                    return next;
                  });
                }}
                className={`px-3 py-1.5 rounded-md border ${
                  active ? "bg-black text-white border-black" : "bg-white"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-2">
        <h3 className="font-semibold text-lg mb-3">Price</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onBlur={emit}
            className="w-24 border rounded-md px-3 py-2"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={emit}
            className="w-24 border rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            setSizes([]);
            setColors([]);
            setPriceMin("");
            setPriceMax("");
            setSort("relevance");
            setTimeout(emit, 0);
          }}
          className="px-3 py-2 border rounded-md"
        >
          Reset
        </button>
      </div>
    </aside>
  );
};

export default CategoryFilters;
