# Oursky Pre-test Writeup

**Live URL:** https://smart-todo-fawn.vercel.app  
**GitHub:** https://github.com/tszpuiii/smart-todo

---

## What feature you added

**Energy Match** — when creating a task, you tag the cognitive effort it needs: 🟢 Low focus, 🟡 Medium focus, or 🔴 Deep focus. The sidebar **MATCH MY ENERGY** section filters your list to tasks that fit your *current* mental state, not just your calendar. Filter state lives in the URL (`?energy=low`) so views are shareable and survive refresh.

After the base filter, I reduced creation friction: if you are already in the Low focus view, new tasks default to low energy; titles with admin verbs (e.g. “Reply”, “Email”) auto-suggest 🟢, while strategy verbs (e.g. “Write PRD”, “Plan”) suggest 🔴. Within each energy view, tasks are **auto-sorted by priority then due date**, with a **Start here** hint on the top incomplete item — rule-based decision support today. On the Kanban board, cards show a colored left border by energy, and a gentle warning appears when more than two high-focus tasks sit in Doing at once.

## What problem it solves in your daily workflow

**The hook:** I built Energy Match because my biggest bottleneck as a coordinator is context-switching cost — bouncing between stakeholder meetings and trying to write specs in 15-minute gaps.

**The workflow:** At 4:30 PM after a day of alignment meetings, I am mentally drained. Instead of staring at a flat board full of “write PRD” next to “reply on Slack,” I tap **🟢 Low focus** and only see admin tasks I can actually finish before my next call. The list is sorted — **high priority + soonest due date first** — and the top row is labeled **Start here**. When I add a task from that view, it is already tagged low — I do not break flow by re-classifying. When I block a 90-minute morning slot, I switch to **🔴 Deep focus** so quick wins do not steal time from strategy work. Time management is not only about *when* something is due — it is about matching tasks to the energy I have *right now*.

## One thing you would improve or add if you had more time

If I had more time, I would add a lightweight **AI assist layer** on top of the existing rules — not to replace Energy Match, but to handle ambiguous input. For example: paste a messy Slack thread or meeting notes and have the model suggest task title, energy level, priority, due date, and 2–3 subtasks; or ask “I have 15 minutes before my next call” and get a ranked pick from my 🟢 Low focus list with a one-line rationale. I would keep a **rule-based fallback** when no API key is set (same pattern as keyword inference today), so the feature stays useful offline and does not block core flows. Longer term, an end-of-day energy recap — which tags you completed vs. overdue — would close the loop from moment-to-moment filtering to weekly planning.

---

*Reviewer demo: register → sidebar **MATCH MY ENERGY** → 🟢 Low focus → Add task (defaults to low) or `Ctrl+K`: `Reply Slack` → see auto-tagged 🟢 + **Start here** on top row → open Sticky Wall to see energy borders and Doing WIP hint.*
