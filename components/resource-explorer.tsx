"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Clock3, Heart, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { categories, type Resource } from "@/lib/resource-data";

function categorySlug(value: string) {
  return value.toLowerCase().replaceAll(" ", "-").replace("'", "");
}

export function ResourceExplorer({ items, signedIn, initialCategory, initialQuery }: { items: Resource[]; signedIn: boolean; initialCategory?: string; initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery?.slice(0, 100) ?? "");
  const [category, setCategory] = useState<(typeof categories)[number]>(() => categories.includes(initialCategory as (typeof categories)[number]) ? initialCategory as (typeof categories)[number] : "All");
  const [showFilters, setShowFilters] = useState(false);
  const [city, setCity] = useState("All");
  const [open24Hours, setOpen24Hours] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/favorites")
      .then((response) => response.ok ? response.json() : { favorites: [] })
      .then((data) => setFavorites(new Set(data.favorites ?? [])))
      .catch(() => undefined);
  }, [signedIn]);

  useEffect(() => {
    if (!initialCategory && !initialQuery) return;
    const frame = window.requestAnimationFrame(() => document.getElementById("directory")?.scrollIntoView());
    return () => window.cancelAnimationFrame(frame);
  }, [initialCategory, initialQuery]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesCity = city === "All" || item.city === city;
      const matchesHours = !open24Hours || item.hours.toLowerCase().includes("24/7");
      const haystack = [item.name, item.city, item.summary, item.address, ...item.tags].join(" ").toLowerCase();
      return matchesCategory && matchesCity && matchesHours && (!normalized || haystack.includes(normalized));
    });
  }, [category, city, items, open24Hours, query]);

  const cities = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.city))).sort()], [items]);

  async function toggleFavorite(id: string) {
    if (!signedIn) {
      router.push("/login?return_to=%2F%23directory");
      return;
    }
    const isFavorite = favorites.has(id);
    const response = await fetch("/api/favorites", {
      method: isFavorite ? "DELETE" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listingId: id }),
    });
    if (!response.ok) {
      setNotice("We couldn't update that favourite. Please try again.");
      return;
    }
    setFavorites((current) => {
      const next = new Set(current);
      if (isFavorite) next.delete(id); else next.add(id);
      return next;
    });
    setNotice(isFavorite ? "Removed from your saved resources." : "Saved to your resources.");
  }

  return (
    <section id="directory" className="section-space scroll-mt-24">
      <div className="shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Explore the directory</span>
            <h2>Support that fits your situation.</h2>
          </div>
          <p>Search verified starting points, then contact the organization to confirm availability and current requirements.</p>
        </div>

        <div className="search-panel">
          <label className="search-field">
            <Search size={20} aria-hidden="true" />
            <span className="sr-only">Search resources</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, city or service" />
          </label>
          <button className="filter-button" type="button" aria-expanded={showFilters} aria-controls="advanced-filters" onClick={() => setShowFilters((current) => !current)}><SlidersHorizontal size={17} /> {showFilters ? "Hide filters" : "More filters"}</button>
        </div>

        {showFilters && <div className="advanced-filters" id="advanced-filters">
          <label><span>Location</span><select value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option key={item} value={item}>{item === "All" ? "All locations" : item}</option>)}</select></label>
          <label className="filter-check"><input type="checkbox" checked={open24Hours} onChange={(event) => setOpen24Hours(event.target.checked)} /><span>Show only services marked open 24/7</span></label>
          {(city !== "All" || open24Hours) && <button type="button" className="text-button" onClick={() => { setCity("All"); setOpen24Hours(false); }}>Clear filters</button>}
        </div>}

        <div className="category-row" aria-label="Resource categories">
          {categories.map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={`category-chip category-${categorySlug(item)}${category === item ? " active" : ""}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="mb-5 flex items-end justify-between gap-4">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">{filtered.length} resources shown</p>
          {notice && <p role="status" className="text-sm text-[var(--forest)]">{notice}</p>}
        </div>

        <div className="resource-grid">
          {filtered.map((resource) => (
            <article key={resource.id} className={`resource-card category-${categorySlug(resource.category)}`}>
              <div className="flex items-start justify-between gap-4">
                <span className={`resource-type type-${categorySlug(resource.category)}`}>{resource.category}</span>
                <button
                  type="button"
                  onClick={() => toggleFavorite(resource.id)}
                  className={favorites.has(resource.id) ? "save-button saved" : "save-button"}
                  aria-label={favorites.has(resource.id) ? `Remove ${resource.name} from favourites` : `Save ${resource.name}`}
                >
                  <Heart size={18} fill={favorites.has(resource.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <h3><a href={`/resources/${resource.slug}`}>{resource.name}</a></h3>
              <p className="resource-summary">{resource.summary}</p>
              <div className="resource-meta">
                <span><MapPin size={15} /> {resource.city}</span>
                <span><Clock3 size={15} /> {resource.hours}</span>
              </div>
              <div className="tag-list">
                {resource.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <a className="card-link" href={`/resources/${resource.slug}`}>View details <ArrowUpRight size={16} /></a>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <Search size={24} />
            <h3>No exact matches</h3>
            <p>Try a nearby city, a broader service, or reset the category.</p>
            <button onClick={() => { setQuery(""); setCategory("All"); setCity("All"); setOpen24Hours(false); }} className="text-button">Reset search</button>
          </div>
        )}
      </div>
    </section>
  );
}
