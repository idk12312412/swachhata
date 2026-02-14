# 🌿 EcoSort — Waste Classification & Impact Tracker

A full-featured waste sorting web app with AI-powered classification, gamification, and environmental impact tracking. Built with an eco/nature-inspired design using greens, earth tones, and leaf/nature iconography.

---

## 1. Authentication & User Setup

- **Login & Registration pages** with email/password via Lovable Cloud Auth
- Clean, nature-themed forms with leaf accents and earth-toned backgrounds
- Redirect to dashboard after login

## 2. Dashboard / Home Page

- **Welcome banner** with user's name, current rank badge, and total points
- **Quick upload button** prominently placed to classify waste
- **Weekly summary card** showing items classified, points earned, and CO₂ saved this week
- **Recent activity feed** showing last 5 classified items with icons for material type

## 3. Image Upload & AI Classification

- **Upload page** with drag-and-drop zone and camera capture option for mobile
- Clear instructions: "Take a photo or upload an image of your waste item"
- Sends image to **Lovable AI (Gemini vision)** for classification
- **Results display**: Shows classification (Recycle ♻️ / Reuse 🔄 / Keep 📦), material type (plastic, glass, paper, e-waste, etc.), and estimated CO₂ savings
- if the condition is very bad suggests to not recycle
- If AI confidence is low → flags item for **human classification** and notifies user, also vgive prompt for user to classify the item on their own if they want to
- Points awarded automatically upon classification
- Upon classification, gives the appropriate steps to take for recycling

## 4. Human Classifier Fallback Interface

- Separate page for designated human classifiers
- Shows queue of unclassified items with the uploaded image
- Simple button interface: Recycle / Reuse / Keep + material type dropdown
- Once classified, result is sent back to the original user and points are awarded

## 5. Classification History

- Scrollable list/table of all past classified items
- Each entry shows: thumbnail, item name/description, classification result, material type, date, and CO₂ saved
- Filter by date range, classification type, or material
- Search functionality

## 6. Statistics & Impact Dashboard

- **Total items classified** counter with animated number
- **CO₂ saved** total with tree/earth equivalency visualization
- **Charts** (using Recharts):
  - Pie chart: breakdown by material type
  - Bar chart: items classified per week/month
  - Line chart: cumulative CO₂ savings over time
- **Category breakdown** cards (plastic, glass, paper, organic, etc.)

## 7. Points & Ranking System

- Points earned per classification based on CO₂ impact
- **Rank tiers** with nature-themed badges (Seedling → Sapling → Tree → Forest → Guardian of Earth)
- **Leaderboard** showing top users and their ranks
- Progress bar toward next rank

## 8. Weekly Report

- Auto-generated summary card on the dashboard each week
- Shows: items classified, points earned, CO₂ saved, rank change, comparison to previous week
- Celebratory animation when hitting milestones

## 9. Profile Page

- User avatar and display name
- Current rank with badge visualization
- Lifetime stats: total items, total CO₂ saved, total points
- Activity timeline
- Settings (update name, change password)

## 10. Design & UX

- **Color palette**: Forest greens, warm earth tones, soft cream backgrounds
- **Icons**: Leaf, tree, recycle, earth-themed Lucide icons throughout
- **Fully responsive**: Mobile-first design with bottom navigation on mobile, sidebar on desktop
- **Animations**: Subtle fade-ins, progress celebrations, and micro-interactions
- **Typography**: Clean sans-serif with friendly, approachable feel
- Easy clutterless navigation without many pages for simplicity but well divided logical seperation

## Backend (Lovable Cloud)

- **Database tables**: users/profiles, classifications, points_history, weekly_reports
- **Storage**: Image uploads bucket for waste photos
- **Edge Functions**: AI classification via Lovable AI (Gemini vision), points calculation
- **Auth**: Email/password registration and login