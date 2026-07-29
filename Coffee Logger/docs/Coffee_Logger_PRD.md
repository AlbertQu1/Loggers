# Coffee Logger

## Project Goal

Build a production-quality mobile-first Progressive Web App (PWA) called Coffee Logger.

Coffee Logger is NOT an analytics application.

It is the official data entry client for my Coffee Analytics ecosystem.

The application is responsible ONLY for capturing coffee-related events and sending them to my backend.

The application must never calculate inventory, remaining grams, forecasts, cost per cup, analytics or statistics.

Those calculations are performed later by Python scripts connected directly to PostgreSQL.

The application should feel like a polished native mobile application.

---

# Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Progressive Web App
- Mobile First
- Responsive
- Dark Mode
- Light Mode

Organize the project cleanly.

Suggested folders:

/components

/services

/types

/lib

/hooks

/utils

Do not mix UI with API calls.

---

# Backend Architecture

The application MUST NOT use local mock data as the main data source.

The application must connect to my existing backend.

Architecture:

Coffee Logger

↓

REST API

↓

n8n Webhooks

↓

PostgreSQL

↓

Python Analytics

↓

Machine Learning

↓

Reporting

The frontend communicates ONLY through REST API endpoints.

Never connect directly to PostgreSQL.

Never calculate business logic on the frontend.

Create a dedicated API service layer.

Example:

services/

cups.ts

bags.ts

waste.ts

history.ts

health.ts

All API URLs must be configurable using environment variables.

---

# Synchronization

The PostgreSQL database is always the single source of truth.

However, the application must include an emergency synchronization queue.

Workflow:

When the user registers data:

↓

Try API request

↓

If success

Done

↓

If API fails

Store event locally

Mark as Pending Synchronization

Show a toast:

"Unable to reach the server.
Your data was safely stored and will be synchronized later."

The application must automatically retry synchronization when connectivity returns.

Users must also have a "Sync Now" option.

The local queue is ONLY an emergency failsafe.

Never use local storage as the primary database.

---

# Health Check

On startup call

GET /health

If available

Show

🟢 Connected

Otherwise

🔴 Offline

The application should still work using the emergency queue.

---

# Navigation

Bottom Navigation Bar.

Exactly four tabs.

☕

New Cup

📦

Coffee Bags

⚖️

Waste

📜

History

No Dashboard.

No Analytics.

---

# Design

Use Material Design 3 as inspiration.

Not a copy.

Characteristics:

Minimal

Premium

Large rounded cards

Rounded buttons

Large touch targets

Soft animations

One handed operation

Minimal typing

Fast interactions

Native mobile feeling

---

# Screen 1

New Cup

This is the default screen.

Users should register a coffee in under five seconds.

Top section

Coffee currently in the machine

If ACTIVE coffee bag exists

Display

Coffee currently in the machine

Coffee Name

Opened Date

If there is NO ACTIVE bag

Display

No coffee bag currently loaded.

This cup will automatically be registered as Ground Coffee.

---

Coffee Size

Large rounded buttons

Espresso

Quad

6 oz

8 oz

10 oz

12 oz

14 oz

16 oz

18 oz

Only one selection.

---

Options

Checkbox

Cold Coffee

Checkbox

With Milk

If ACTIVE bag exists

Show

Use Ground Coffee

This overrides the active bag ONLY for this cup.

If there is no ACTIVE bag

Hide this checkbox completely.

---

Register Button

Large Primary Button

Register Cup

After success

Display toast

✓ Cup Registered

---

# Screen 2

Coffee Bags

Purpose:

Manage coffee bags only.

No analytics.

No statistics.

No estimated grams.

No inventory calculations.

---

Section

Coffee currently in the machine

Display active bag

Coffee Name

City

Weight

Open Date

Button

Finish Bag

Confirmation dialog

Finish this coffee bag?

Cancel

Finish

Stores

close_date

status=CLOSED

Nothing else.

---

Pending Bags

Display cards

Coffee Name

Purchase Date

Weight

Button

Open Bag

Opening a bag

Stores

open_date

status=ACTIVE

Business Rule

Opening is ONLY allowed when there is NO ACTIVE bag.

Never allow changing an ACTIVE bag.

Reason:

The espresso machine uses a hopper.

Changing bags halfway through is not a real-world workflow.

Display

An active coffee bag already exists.

Finish it before opening another.

---

Closed Bags

Collapsed section

Expandable.

---

Floating Action Button

+

Create Coffee Bag

---

Create Coffee Bag

Fields

Coffee Name

Roaster (optional)

City

Country (optional)

Purchase Date

Weight

Dropdown

250g

340g

500g

1kg

Other

If Other

Show

Custom Weight

Price

Checkbox

Gift

If checked

Price automatically becomes 0.

Disable the price input.

Notes

Save

---

# Screen 3

Waste

Purpose

Register waste events.

Waste is completely independent from finishing bags.

Fields

Coffee Bag

Date

Grams

Reason (optional)

Notes (optional)

Button

Register Waste

Each submission creates a Waste Event.

Never edits a bag.

---

# Screen 4

History

Chronological list.

No analytics.

Filters

Date

Bag

Ground Coffee

Cold Coffee

With Milk

Card Example

July 26

8 oz

Cold

With Milk

HEB de la Casa

or

Ground Coffee

---

# Coffee Bag Lifecycle

PENDING

↓

ACTIVE

↓

CLOSED

Only one ACTIVE bag.

Never allow two ACTIVE bags.

---

# Frontend Responsibilities

The frontend ONLY captures events.

Never calculate:

Remaining grams

Inventory

Average duration

Consumption

Forecasts

Statistics

Cost per cup

Machine Learning

Those belong to Python.

---

# Expected REST Endpoints

GET /health

GET /bags

POST /bags

PATCH /bags/open

PATCH /bags/finish

GET /history

POST /cups

POST /waste

---

# Error Handling

Every API call should:

Handle loading state

Handle timeout

Handle API error

Handle offline mode

Handle retry

Use toast notifications.

---

# Final Goal

The result should look like a premium mobile application that could be installed on an iPhone or Android device as a PWA.

The code should be production-ready, modular, maintainable and prepared to connect to my existing n8n + PostgreSQL infrastructure.

Prioritize UX over visual complexity.

The application should feel extremely fast and intuitive.