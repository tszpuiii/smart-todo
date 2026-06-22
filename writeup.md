# Oursky Pre-test Writeup

> Copy/adapt this into your email reply. Keep it under half a page.

---

## Live URL

`https://YOUR-APP.vercel.app`

## GitHub Repo

`https://github.com/tszpuiii/smart-todo`

---

## Custom Feature: Today / Upcoming / Expired Views

**What I built**

A scope-based task view that splits my todo list into three buckets: **Today** (due today), **Upcoming** (today or later, or no due date), and **Expired** (overdue and not completed). Overdue items are also separated from the main list so they do not clutter active work.

**What problem it solves**

I often let small tasks slip past their due date. In a flat list, overdue items look the same as everything else, so I either ignore them or feel overwhelmed. Every morning I open **Today** to see what must happen now, use **Upcoming** for planning the rest of the week, and check **Expired** once to clear or reschedule what I missed. This matches how I actually triage work at the start of a day, instead of scrolling one long list.

**How I use it**

- 9:00 — open Today, pick 2–3 items to finish before noon  
- Afternoon — switch to Upcoming to slot tasks for tomorrow  
- End of day — open Expired, either complete, reschedule, or delete stale items  

**One thing I would improve with more time**

Add a lightweight end-of-day summary: "completed today vs. carried over," so I can close the loop without manually checking each view.

---

## Demo tips for reviewers

- Register any email/password (no invite needed).
- Sidebar: click **Today**, **Upcoming**, **Expired** to see the custom feature.
- `Ctrl+K` (or `Cmd+K`): quick-add with `#category @doing due:2026-06-22`.
