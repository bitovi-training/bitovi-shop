# Meeting Transcript
**Date:** June 10, 2026
**Meeting:** Sprint Planning & Feature Discussion — Ratings Visibility
**Attendees:**
- Sarah Kim — Account Executive
- Marcus Webb — Product Manager
- Jamie Torres — Frontend Developer

---

**Sarah Kim:** Alright, thanks for jumping on everyone. I'll keep this quick. So I've been getting a lot of inbound from customers — and I know I send you guys things all the time — but this one I really think is worth prioritizing. I put together a quick spreadsheet of the last few months of feature requests we've received through the contact form, and a chunk of them are all pointing at the same thing. We can't see product ratings on the main product listings.

**Marcus Webb:** Yeah, I've seen that come up in support tickets too. What does the breakdown look like in the spreadsheet?

**Sarah Kim:** So I pulled it all into `feature-requests.csv` — I'll drop it in Slack after this. Out of about twenty requests in the last couple months, I'd say seven or eight of them are some variation of "I can't see the star rating until I click into the product." A few people mentioned they use ratings to decide what to click on in the first place, so if we're hiding that info behind a click, we're probably losing people at the browse stage.

**Jamie Torres:** That tracks. Right now the `Rating` component only lives on the product detail page, inside the customer reviews section. So if you're on the homepage or browsing products, there's no rating visible at all until you actually navigate into a product.

**Marcus Webb:** So what are we actually talking about here, scope-wise? Like, how many places does a product card show up?

**Jamie Torres:** So there are three main surfaces. On the homepage there's a standard `ProductCard` — that's the grid of all the products. Then there's also a `FeaturedProductCard`, which is the bigger hero-style card that highlights one product at a time at the top. And then on the product detail page itself, there's a `ProductDetailsCard` that has the buy button and all the product info. We've already got the `Rating` component that renders stars — it's being used in the `CustomerReview` component — so we wouldn't be building that from scratch. It'd really just be about pulling the average from the product data and dropping the component into those three cards.

**Sarah Kim:** See, that's exactly what I was hoping to hear. Sounds like we already have a lot of the pieces. And I want to show you something else too — I did a quick write-up on the projected impact. I called it `ratings-impact-analysis.md`. It's rough, but I pulled some industry benchmarks and ran some very back-of-the-envelope numbers on what this could mean for click-through and conversion. Spoiler: it's meaningful.

**Marcus Webb:** I saw you shared that doc. The numbers in there are pretty compelling, even if they're estimates. The 18% lift in click-through for products with visible ratings — I mean, we're not going to get that exactly, but if we're anywhere in that neighborhood it more than justifies the dev time.

**Jamie Torres:** I'd want to make sure we handle the case where a product doesn't have any reviews yet. We don't want to show an empty star row or a "0 stars" display, so we'd probably want to hide the rating entirely if there are no reviews, or maybe show something like "No reviews yet." I'd lean toward hiding it so the cards don't look broken on new products.

**Marcus Webb:** Yeah, agreed. Let's default to hidden if there's no rating data. We can revisit whether we want a "Be the first to review" CTA later, but let's not scope that in now.

**Sarah Kim:** That makes sense. And honestly the products people are asking about already have reviews — the Aero Bottle, the Sunset Mug, the Desk Mat — those all have ratings. It's just that you can't see them until you're already on the product page, which is too late for browse-stage decision making.

**Marcus Webb:** Okay so what's the effort estimate, Jamie? Are we talking a few hours, a day?

**Jamie Torres:** Honestly, if the data's already on the product object — and I'm pretty sure `reviews` with a `stars` field is already there — I'd say a few hours total. Computing the average, threading it into the three cards, and doing a bit of styling. The `Rating` component is already built and working, so that helps a lot. I'd want to QA it across a few different screen sizes since the cards have pretty different layouts, but I don't see any blockers.

**Marcus Webb:** Perfect. Let's put it in for this sprint. Sarah, does it matter to you which card we prioritize if for some reason Jamie has to split it across two sprints?

**Sarah Kim:** Honestly the homepage `ProductCard` is the most important one because that's where most people are browsing. The `FeaturedProductCard` would be second just because it's the first thing you see on the page. The product detail one is kind of nice-to-have since you're already there at that point.

**Marcus Webb:** Got it. Jamie, let's plan for all three this sprint but if something slips, that's the priority order. I'll write the ticket up after this and link your impact analysis doc, Sarah. Anything else?

**Sarah Kim:** No, that's it from me. Thanks for actually listening on this one — I really think it's going to move the needle.

**Marcus Webb:** Good catch. Alright, anything else from anyone? ... Okay, we're good. Thanks everyone.

---
*Transcript ends — total duration approx. 14 minutes*
