# Oursky Pre-test Writeup

**Live URL:** https://smart-todo-fawn.vercel.app  
**GitHub:** https://github.com/tszpuiii/smart-todo

---

## What feature you added

**Energy Match** — when creating a task, you tag the cognitive effort it needs: 🟢 Low energy / Admin, 🟡 Medium focus, or 🔴 Deep focus / Strategy. The sidebar **MATCH MY ENERGY** section filters your list to tasks that fit your *current* mental state, not just your calendar. Filter state lives in the URL (`?energy=low`) so views are shareable and survive refresh.

After the base filter, I reduced creation friction: if you are already in the Low energy view, new tasks default to low energy; titles with admin verbs (e.g. “Reply”, “Email”) auto-suggest 🟢, while strategy verbs (e.g. “Write PRD”, “Plan”) suggest 🔴. Within each energy view, tasks are **auto-sorted by priority then due date**, with a **Start here** hint on the top incomplete item — decision support, not AI planning. On the Kanban board, cards show a colored left border by energy, and a gentle warning appears when more than two high-focus tasks sit in Doing at once.

## What problem it solves in your daily workflow

**The hook:** I built Energy Match because my biggest bottleneck as a coordinator is context-switching cost — bouncing between stakeholder meetings and trying to write specs in 15-minute gaps.

**The workflow:** At 4:30 PM after a day of alignment meetings, I am mentally drained. Instead of staring at a flat board full of “write PRD” next to “reply on Slack,” I tap **🟢 Low energy** and only see admin tasks I can actually finish before my next call. The list is sorted — **high priority + soonest due date first** — and the top row is labeled **Start here**. When I add a task from that view, it is already tagged low — I do not break flow by re-classifying. When I block a 90-minute morning slot, I switch to **🔴 Deep focus** so quick wins do not steal time from strategy work. Time management is not only about *when* something is due — it is about matching tasks to the energy I have *right now*.

## One thing you would improve or add if you had more time

If I had more time, I would add a **time-slot shortcut** (“15 min before next meeting”) that filters low-energy tasks by estimated duration, plus an end-of-day energy recap: a simple donut of completed work by energy tag and a nudge like “you finished 5 admin tasks but 0 deep-focus items — block 2 hours tomorrow for strategy.” That would turn the filter from a moment-to-moment tool into a data-informed weekly planning habit.

---

*Reviewer demo: register → sidebar **MATCH MY ENERGY** → 🟢 Low energy → Add task (defaults to low) or `Ctrl+K`: `Reply Slack` → see auto-tagged 🟢 → open Sticky Wall to see energy borders and Doing WIP hint.*
