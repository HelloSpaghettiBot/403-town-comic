# 403 Town Comic Upload Guide

The comic is the main website. The TCG is available under `/tcg`.

## Add a new episode

1. Create a folder inside:
   `artifacts/403-town-tcg/public/comics/`

   Example:
   `artifacts/403-town-tcg/public/comics/episode-02/`

2. Put the final comic page images in that folder. WebP is preferred for smaller downloads, but PNG/JPG also work.

3. Edit:
   `artifacts/403-town-tcg/public/content/episodes.json`

4. Add one episode object with a unique `id`, URL-safe `slug`, episode `number`, title, summary, cover image, and page list in reading order.

Example:

```json
{
  "id": "ep-02",
  "slug": "episode-two-slug",
  "number": 2,
  "title": "Episode Two Title",
  "subtitle": "Chapter 02",
  "summary": "Short spoiler-free episode description.",
  "status": "Released",
  "published": "2026-09-01",
  "cover": "/comics/episode-02/page-01.webp",
  "pages": [
    "/comics/episode-02/page-01.webp",
    "/comics/episode-02/page-02.webp"
  ]
}
```

The archive, latest-episode landing panel, reader navigation, and episode links update automatically from this manifest.

## Replace the Episode 1 storyboard with final art

You do not need to change the reader code. Put the final page files in `public/comics/episode-01/`, then replace the `pages` array and `cover` value for Episode 1 in `public/content/episodes.json`. Change `status` from `Storyboard preview` to `Released` when appropriate.

## TCG routes

The TCG is preserved under:

- `/tcg`
- `/tcg/battle`
- `/tcg/story`
- `/tcg/collection`
- `/tcg/shop`
- `/tcg/matches`
- `/tcg/settings`

The TCG header includes a `Read comic` link back to the main site.
