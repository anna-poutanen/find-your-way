"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clock3, Heart, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { categories, type Resource } from "@/lib/resource-data";

export function ResourceExplorer({ items, signedIn }: { items: Resource[]; signedIn: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/favorites")
      .then((response) => response.ok ? response.json() : { favorites: [] })
      .then((data) => setFavorites(new Set(data.favorites ?? [])))
      .catch(() => undefined);
  }, [signedIn]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const haystack = [item.name, item.city, item.summary, item.address, ...item.tags].join(" ").toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [category, items, query]);

  async function toggleFavorite(id: string) {
    if (!signedIn) {
      window.location.href = "/signin-with-chatgpt?return_to=%2F%23directory";
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
          <button className="filter-button" type="button"><SlidersHorizontal size={17} /> More filters</button>
        </div>

        <div className="category-row" aria-label="Resource categories">
          {categories.map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={category === item ? "category-chip active" : "category-chip"}>
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
            <article key={resource.id} className="resource-card">
              <div className="flex items-start justify-between gap-4">
                <span className={`resource-type type-${resource.category.toLowerCase().replaceAll(" ", "-").replace("'", "")}`}>{resource.category}</span>
                <button
                  type="button"
                  onClick={() => toggleFavorite(resource.id)}
                  className={favorites.has(resource.id) ? "save-button saved" : "save-button"}
                  aria-label={favorites.has(resource.id) ? `Remove ${resource.name} from favourites` : `Save ${resource.name}`}
                >
                  <Heart size={18} fill={favorites.has(resource.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <h3><Link href={`/resources/${resource.slug}`}>{resource.name}</Link></h3>
              <p className="resource-summary">{resource.summary}</p>
              <div className="resource-meta">
                <span><MapPin size={15} /> {resource.city}</span>
                <span><Clock3 size={15} /> {resource.hours}</span>
              </div>
              <div className="tag-list">
                {resource.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <Link className="card-link" href={`/resources/${resource.slug}`}>View details <ArrowUpRight size={16} /></Link>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <Search size={24} />
            <h3>No exact matches</h3>
            <p>Try a nearby city, a broader service, or reset the category.</p>
            <button onClick={() => { setQuery(""); setCategory("All"); }} className="text-button">Reset search</button>
          </div>
        )}
      </div>
    </section>
  );
}
