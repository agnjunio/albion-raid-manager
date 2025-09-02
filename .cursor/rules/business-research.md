# **Business Viability Report: Albion Raid Manager**

## **I. Executive Summary**

The Albion Raid Manager project is a proposed solution to the widespread and persistent problem of inefficient event and member management in Albion Online guilds. The initial inquiry, expressing uncertainty about the business model's viability, is justified. The detailed analysis confirms that the initiative is potentially viable, but requires strategic alignment of the value proposition with the technical reality of the Albion Online and Discord API ecosystem.

The core problem, identified by research, is not just the lack of tools, but a leadership crisis in many guilds, where overwhelmed or demotivated leaders cannot maintain engagement or delegate responsibilities.1 Your proposal for a 100% automated solution to manage events and pings is, therefore, directly responsive to an authentic and deep market pain.

However, the promise of "100% automation" faces a significant technical obstacle: the instability and lack of official support for Albion Online APIs.4 On the other hand, the Discord API is robust and offers the resources necessary for building a high-quality and reliable product.6

The project's viability lies in the ability to mitigate technical challenges and differentiate itself in a competitive and fragmented market. The central recommendation is to adopt a product strategy that prioritizes reliability and excellence in guild management within the Discord platform, with Albion Online functionality integration being an additional feature. The freemium business model, with guild subscriptions, is the most promising path to ensure sustainability and long-term growth, in contrast to dependence on donations.8

## **II. Business Viability Analysis**

### **2.1. The Problem and Value Proposition**

The central problem that Albion Raid Manager seeks to solve is the exhaustive and inefficient management of guilds in Albion Online. Research validates that many guild leaders and content creators struggle to organize events, whether for casual activities like fame farming or for large ZvZ (Zerg vs. Zerg) battles.1 The in-game interface for group and guild organization is described as inadequate 10, forcing leaders to rely on manual pings, dedicated channels, and complex operations on Discord.

The consulted documentation highlights the negative impact of this manual management, which leads to frustration and, in extreme cases, to the dissolution of entire guilds.1 The lack of task delegation and reluctance to adopt tools like Discord bots are recurring problems, with leaders described as "lazy or half-hearted" who don't make the effort to configure tools that would benefit their community.2 This demonstrates that the market pain goes beyond the need for a bot; the demand is for a solution that simplifies organizational tasks to the point of overcoming leadership inertia and lack of professionalism.

The value of Albion Raid Manager, therefore, is not limited to automating pings. The proposal is a tool that empowers leaders, freeing them from manual work and allowing them to focus on higher-value activities, such as recruitment, community building, and strategic planning.3 By offering a solution that automates recurring event creation, registration management, and communication, the project aims to solve the leadership crisis itself, providing the tools that leaders need to be more efficient and retain their members.

### **2.2. Competitive Landscape**

The Discord bot market for games like Albion Online is active and competitive, with solutions divided into two groups: raid management bots and general guild management bots.

In the first group, direct competitors are well-established. **Raid Organizer**, for example, has a base of more than 23,500 servers and a reputation for stability and features like recurring events, temporary voice channels, and customizable templates.11

**Raid-Helper** is another leader, focusing on granular customization, allowing the creation of detailed templates with classes, specs, and roles.12 Both operate with a freemium model, where advanced features, such as

custom templates, are offered in paid plans.12 A more niche competitor,

**CTA Bot**, demonstrates the demand for Albion-specific solutions, offering features like pre-defined group compositions and time counters for in-game objectives.14

In the second group, general management, **Albion Guild Manager** stands out as a significant indirect competitor. This bot is a complete management suite, including player registration, battle tracking, advanced statistics, and even a guild economy system.15 A crucial point is that this bot is 100% free and open source.17 This represents a direct challenge to monetization, as the community's expectation may be for free access to robust features.

The existence of multiple specialized bots for niches like killboard 18, economy 21, and game information 22 reveals market fragmentation. Many guilds need to install and configure multiple bots to cover all their management needs. This fragmentation is the main weakness to be exploited by Albion Raid Manager. By positioning itself as a "super-bot" — a complete solution that integrates event management,

killboard, member tracking, and economy in a single package — the project can solve the pain of complexity and fragmented experience that guild leaders face.

### **2.3. Target Market Analysis**

The target market for Albion Raid Manager is robust and based on the Albion Online player community. The game has a considerable active player base, with estimates ranging between 14,000 concurrent active players across all platforms and daily peaks of more than 500,000, although numbers may vary depending on the source and platform counting.11 The game has a guild-based structure, which are limited to 300 members, but can form alliances, which increases the need for large-scale organization tools.27

The Albion Online community is deeply rooted in Discord, with servers dedicated to various types of content, such as Faction Warfare, Hellgates, PvP, and trading.29 This strong presence on Discord is a favorable factor, as the target audience is already familiar with the platform. The player community also demonstrates a high willingness to adopt third-party tools that enhance their gaming experience, using unofficial APIs for market and battle tracking, despite the lack of official documentation and data instability.4 This predisposition indicates that the project will have a receptive audience if the solution is reliable and adds value.

The market opportunity is not just to offer a tool, but to integrate into an existing digital ecosystem, filling the gaps that current tools, by themselves, cannot solve.

### **2.4. Feature Matrix**

The following matrix compares the proposed features for Albion Raid Manager with those of its main competitors, highlighting areas of overlap and potential differentiation points.

| Feature                            | Albion Raid Manager (Proposed) | Raid Organizer | Raid-Helper | Albion Guild Manager |
| :--------------------------------- | :----------------------------- | :------------- | :---------- | :------------------- |
| **Event Management**               |                                |                |             |                      |
| Recurring Events                   | Yes 11                         | Yes 11         | Yes 12      | Yes 16               |
| Customizable Templates             | Yes 12                         | Yes 11         | Yes 12      | No 37                |
| Temporary Voice Channel Management | Yes 11                         | Yes 11         | No          | No                   |
| Sign-Up Reminders                  | Yes 11                         | Yes 11         | Yes 13      | Yes 16               |
| **Guild Management**               |                                |                |             |                      |
| Role Automation                    | Yes 15                         | No             | No          | Yes 15               |
| Member Tracking                    | Yes 15                         | No             | No          | Yes 15               |
| **Analytics and Game Data**        |                                |                |             |                      |
| Killboard and Battle Tracking      | Yes 15                         | No             | No          | Yes 15               |
| Fame and K/D Statistics            | Yes 15                         | No             | No          | Yes 15               |
| Loot Analysis                      | Yes 16                         | No             | No          | Yes 16               |
| **Economy**                        |                                |                |             |                      |
| Guild Economy System               | Yes 21                         | No             | No          | Yes 16               |
| Mass Payments                      | Yes 16                         | No             | No          | Yes 16               |
| **Other Features**                 |                                |                |             |                      |
| Web Management Panel               | Yes                            | No             | Yes 13      | Yes 16               |
| Business Model                     | Freemium                       | Freemium       | Freemium    | Free                 |

The table illustrates that, while raid competitors are strong in their niche, they lack the complete management suite offered by more comprehensive guild bots. The differentiation opportunity for Albion Raid Manager lies in creating a unique solution that combines excellence in event management with crucial guild management, analytics, and economy features, becoming an "all-in-one" solution.

## **III. Technical Assessment and Challenges**

### **3.1. Discord API Integration**

The technical viability of the project depends largely on the reliability of the underlying platform. The Discord API is a solid foundation for bot development. It is well-documented and offers all the functionality necessary to create, manage, and automate events and user interactions.6 The API allows complete control over channels,

roles, and messages, which is fundamental to Albion Raid Manager's value proposition.7 Additionally, Discord's Monetization API simplifies the process of selling

subscriptions and one-time purchases directly within the platform, an ideal model for bot monetization.38

However, growing a bot to tens of thousands of servers imposes significant scalability challenges. The main one is API rate limits, which can result in temporary blocks if the bot makes too many requests in a short period.40 An amateur development architecture, with all code in a single application, can lead to slowness and interruptions during peak usage times.8 The long-term success of a project like Albion Raid Manager requires a professional and scalable architecture, based on microservices. This approach allows distributing the workload, reusing connections, and caching data to reduce the number of requests, ensuring high performance and

uptime superior to 99%.8 Investing in a robust architecture from the start is a crucial factor that differentiates a professional project from a hobby and ensures user trust as the client base grows.

### **3.2. Dependence on Albion Online API**

The greatest technical and value proposition risk for Albion Raid Manager is its dependence on Albion Online APIs. The developer community and game forums indicate that PvP APIs, in particular, are notably slow and unstable, frequently resulting in 504 (Gateway Timeout) and 502 (Bad Gateway) errors.4 Problems with outdated or incomplete data are common, with death and battle reports missing from logs for days.5 Additionally, the absence of official documentation and the

crowd-sourced nature of some APIs, such as market data, means that data accuracy depends on volunteer players running data-gathering clients.35

These limitations directly affect Albion Raid Manager's ability to fulfill the promise of a "100% automated solution." For example, a high-value feature like battle presence tracking and killboard-based reward distribution would be inherently unstable and unreliable. The project cannot guarantee data accuracy if the underlying information sources are faulty.5

However, this fragility can be transformed into a competitive advantage. Since API instability is a well-known problem in the community, Albion Raid Manager can differentiate itself by managing user expectations. The main value proposition should be built around management features that depend solely on the reliable Discord API (scheduling, reminders, custom templates, etc.). Features that depend on Albion APIs, such as killboards, should be presented as a best-effort feature or bonus, with clear warnings about possible data inconsistency. This transparency builds long-term trust and avoids the frustrations that already plague other community bots.

## **IV. Product Strategy and Differentiation**

### **4.1. Unique Value Proposition (UVP)**

The Unique Value Proposition (UVP) of Albion Raid Manager should be the **complete and reliable solution for Albion Online guild leadership**. The project should position itself as a tool that frees up time from manual management and allows leaders to focus on building a strong community, providing a superior user experience, regardless of game API stability.

The focus is not just to compete with existing raid bots, but to solve the fragmented user experience. By combining event automation (custom templates and recurring events) with guild management features (member tracking and presence analytics), killboard, and an economy system, the project becomes a super-bot that simplifies the leader's life, eliminating the need to manage multiple third-party tools.15

## **V. Business Model and Monetization Strategy**

### **5.1. Discord Bot Monetization Models**

Analysis of the Discord bot market indicates that the **freemium** model is the most promising and, in many cases, the only way to compete in a niche where users expect free access to basic features.9 The freemium strategy consists of offering a set of essential features for free to attract a large user base and then monetize through subscriptions for

premium features.45

The **guild subscription** model is ideal for Albion Raid Manager. Discord's Monetization API allows a single purchase to grant access to premium features for all guild members, which aligns perfectly with the project's value proposition.38 Donations, while they may generate some initial revenue, are not a scalable business model and should not be the primary source of funding.8

### **5.2. Pricing Proposal and Justification**

Research suggests that prices for Discord guild bots range from $5 to $50 per month, depending on complexity and number of servers.45 Based on this market range and the value proposition of a

super-bot, Albion Raid Manager can adopt a pricing plan that offers excellent cost-benefit.

- **Free Tier (Basic):** Simple events and scheduling for a limited number of events per month. This tier serves to attract new users and demonstrate bot reliability.44
- **Premium Tier (Guild Subscription):** Includes unlimited recurring events and custom templates, web management panel, raid presence analytics, and integration with Albion APIs like killboard.11 The price can be justified based on the value of time and effort saved by leadership and the ability to retain members, making the guild more organized and attractive.2

Below is a cost and revenue projection, demonstrating the financial viability of the project in different growth phases.

| Phase                   | User Scale (Servers) | Hosting (Monthly Cost)                            | Revenue (Monthly)         | Profit (Monthly) | Justification                                                                                                    |
| :---------------------- | :------------------- | :------------------------------------------------ | :------------------------ | :--------------- | :--------------------------------------------------------------------------------------------------------------- |
| **Phase 1 (Start)**     | 1,000-5,000          | $50-$100 (Basic VPS) 8                            | $200 (Donations)          | $100-$150        | Initial launch, free to play with donations. Small user base, focus on feedback.                                 |
| **Phase 2 (Growth)**    | 5,000-25,000         | $200 (PostgreSQL, Redis caching, load balancer) 8 | $2,000 (Premium Features) | $1,800           | Monetization initiated. Infrastructure costs increase, but premium revenue covers expenses and generates profit. |
| **Phase 3 (Expansion)** | 25,000-100,000+      | $400 (Microservices, auto-scaling) 8              | $15,000 (B2B Licensing)   | $14,600          | Robust business model. Revenue grows exponentially as cost efficiency improves.                                  |

## **VI. Action Plan and Strategic Recommendations**

### **6.1. Phased Development Roadmap**

The most prudent approach is phased development that manages risks and validates the value proposition incrementally.

- **Phase 1 (MVP - Focus on Reliability):** Develop a Minimum Viable Product (MVP) focused exclusively on event management. The priority is event creation, sign-up management, and reminders, using only the Discord API, which is reliable. The goal is to prove reliability and build a free user base, without promising features that depend on unstable APIs.6
- **Phase 2 (Premium Expansion):** With community trust established, introduce high-value features that justify monetization, such as recurring events and customizable templates.11 Implement a web panel with  
  presence analytics for guild leaders. At this point, present guild subscription as a business model.38
- **Phase 3 (Optimization and Integration):** Integrate secondary features, such as killboard and loot tracking, always with the caveat that they depend on third-party APIs and may present inconsistencies.5 Optimize bot architecture for a microservices configuration capable of supporting massive growth.8

### **6.2. Launch and Marketing Strategies**

For the launch, the strategy should capitalize on the community-oriented nature of Albion Online.

- **Transparent Communication:** Initial communication in Albion Online forums and subreddits should be transparent about what the bot does (reliable event management) and what it doesn't do (full automation of unstable APIs), building a relationship of honesty with the community.5
- **Channel Leverage:** Initial marketing can focus on existing forums and Discord communities, such as servers dedicated to Faction Warfare, Hellgates, and Crystal League, to promote the bot and seek feedback.29
- **Free Trial:** Offering a free trial for the premium plan to guild administrators is an effective tactic to convert free plan users to subscribers. This allows them to experience the full value of the product before making a financial commitment.48

### **6.3. Long-term Considerations**

The project's sustainability depends on its ability to innovate and manage risks. Dependence on unofficial third-party APIs is the main risk, and the only way to mitigate it is through development excellence and transparent communication with users. Financial success will come from building a premium solution that offers undeniable value in terms of time and resource savings, allowing the project to sustain itself and continue evolving without depending on donations or an unsustainable model.8

#### **Cited References**

1. My guild is dying : r/albiononline \- Reddit, acessado em setembro 1, 2025, [https://www.reddit.com/r/albiononline/comments/15sq4k5/my_guild_is_dying/](https://www.reddit.com/r/albiononline/comments/15sq4k5/my_guild_is_dying/)
2. Tips for running a guild? \- General Questions & Discussions \- Albion Online Forum, acessado em setembro 1, 2025, [https://forum.albiononline.com/index.php/Thread/87603-Tips-for-running-a-guild/](https://forum.albiononline.com/index.php/Thread/87603-Tips-for-running-a-guild/)
3. What makes a good Guild Leader in 2021? | by Blackboa \- Medium, acessado em setembro 1, 2025, [https://blackboa.medium.com/what-makes-a-good-guild-leader-in-2021-52f3c382e593](https://blackboa.medium.com/what-makes-a-good-guild-leader-in-2021-52f3c382e593)
4. Update on API \- New Endpoints \- News Archives \- Albion Online Forum, acessado em setembro 1, 2025, [https://forum.albiononline.com/index.php/Thread/131017-Update-on-API-New-Endpoints/](https://forum.albiononline.com/index.php/Thread/131017-Update-on-API-New-Endpoints/)
5. Issue with events API \- Bugs \- Albion Online Forum, acessado em setembro 1, 2025, [https://forum.albiononline.com/index.php/Thread/139423-Issue-with-events-API/](https://forum.albiononline.com/index.php/Thread/139423-Issue-with-events-API/)
6. Gateway | Documentation | Discord Developer Portal, acessado em setembro 1, 2025, [https://discord.com/developers/docs/events/gateway](https://discord.com/developers/docs/events/gateway)
7. Guild Resource | Documentation | Discord Developer Portal, acessado em setembro 1, 2025, [https://discord.com/developers/docs/resources/guild](https://discord.com/developers/docs/resources/guild)
8. Discord Bot Development Beyond Basics: Enterprise Architecture That Actually Works, acessado em setembro 1, 2025, [https://www.inmotionhosting.com/blog/discord-bot-development-beyond-basics/](https://www.inmotionhosting.com/blog/discord-bot-development-beyond-basics/)
9. The brutal reality of making discord bots : r/Discord_Bots \- Reddit, acessado em setembro 1, 2025, [https://www.reddit.com/r/Discord_Bots/comments/1mz10yk/the_brutal_reality_of_making_discord_bots/](https://www.reddit.com/r/Discord_Bots/comments/1mz10yk/the_brutal_reality_of_making_discord_bots/)
10. Albion Online \- Group and Guild Finding is BAD... \- YouTube, acessado em setembro 1, 2025, [https://www.youtube.com/watch?v=QIU0aEg3XNg](https://www.youtube.com/watch?v=QIU0aEg3XNg)
11. Raidorganizer, acessado em setembro 1, 2025, [https://raidorganizer.org/](https://raidorganizer.org/)
12. Guides \- Raid-Helper, acessado em setembro 1, 2025, [https://raid-helper.dev/documentation/guides](https://raid-helper.dev/documentation/guides)
13. Premium \- Raid-Helper, acessado em setembro 1, 2025, [https://raid-helper.dev/premium/](https://raid-helper.dev/premium/)
14. I have built a Discord bot to organize and manage events in Albion Online \- looking for feedbacks. : r/albiononline \- Reddit, acessado em setembro 1, 2025, [https://www.reddit.com/r/albiononline/comments/1n26g5e/i_have_built_a_discord_bot_to_organize_and_manage/](https://www.reddit.com/r/albiononline/comments/1n26g5e/i_have_built_a_discord_bot_to_organize_and_manage/)
15. Albion Online Manager Bot : r/albiononline \- Reddit, acessado em setembro 1, 2025, [https://www.reddit.com/r/albiononline/comments/1l683n3/albion_online_manager_bot/](https://www.reddit.com/r/albiononline/comments/1l683n3/albion_online_manager_bot/)
16. Albion Guild Manager \- Discord Bot & Loot Analysis Tools, acessado em setembro 1, 2025, [https://albionmanager.vercel.app/](https://albionmanager.vercel.app/)
17. www.reddit.com, acessado em setembro 1, 2025, [https://www.reddit.com/r/albiononline/comments/1l683n3/albion_online_manager_bot/\#:\~:text=This%20bot%20is%20100%25%20free%20with%20no%20premium%20features%20or%20paywalls.](https://www.reddit.com/r/albiononline/comments/1l683n3/albion_online_manager_bot/#:~:text=This%20bot%20is%20100%25%20free%20with%20no%20premium%20features%20or%20paywalls.)
18. bearlikelion/ao-killbot: A self hosted Albion Online Discord kill bot \- GitHub, acessado em setembro 1, 2025, [https://github.com/bearlikelion/ao-killbot](https://github.com/bearlikelion/ao-killbot)
19. WEST | Albion Battle Reports, acessado em setembro 1, 2025, [https://albionbattles.com/](https://albionbattles.com/)
20. Killboard \- Albion Online Tools, acessado em setembro 1, 2025, [https://albiononlinetools.com/killboard/](https://albiononlinetools.com/killboard/)
21. Discord Bot For Guilds of all sizes : r/albiononline \- Reddit, acessado em setembro 1, 2025, [https://www.reddit.com/r/albiononline/comments/18gessj/discord_bot_for_guilds_of_all_sizes/](https://www.reddit.com/r/albiononline/comments/18gessj/discord_bot_for_guilds_of_all_sizes/)
22. Discord Bot \- Albion Online Tools, acessado em setembro 1, 2025, [https://albiononlinetools.com/bot.php](https://albiononlinetools.com/bot.php)
23. Albion Online Live Player Count and Statistics (2025) \- ActivePlayer.io, acessado em setembro 1, 2025, [https://activeplayer.io/albion-online/](https://activeplayer.io/albion-online/)
24. Albion Online Steam Charts \- SteamDB, acessado em setembro 1, 2025, [https://steamdb.info/app/761890/charts/](https://steamdb.info/app/761890/charts/)
25. Albion Online Live Player Count & Population 2025 \- PlayerAuctions, acessado em setembro 1, 2025, [https://www.playerauctions.com/player-count/albion-online/](https://www.playerauctions.com/player-count/albion-online/)
26. activeplayer.io, acessado em setembro 1, 2025, [https://activeplayer.io/albion-online/\#:\~:text=There%20are%20about%2014%2C044%20players,factors%20such%20as%20game%20updates.](https://activeplayer.io/albion-online/#:~:text=There%20are%20about%2014%2C044%20players,factors%20such%20as%20game%20updates.)
27. Guild \- Albion Online Wiki, acessado em setembro 1, 2025, [https://wiki.albiononline.com/wiki/Guild](https://wiki.albiononline.com/wiki/Guild)
28. Guilds maximum number of players is ridiculous \- Albion Online Forum, acessado em setembro 1, 2025, [https://forum.albiononline.com/index.php/Thread/63051-Guilds-maximum-number-of-players-is-ridiculous/](https://forum.albiononline.com/index.php/Thread/63051-Guilds-maximum-number-of-players-is-ridiculous/)
29. discover your next favorite server \- Discord Servers \- Home, acessado em setembro 1, 2025, [https://discord.com/servers?query=albion%20online%20tr](https://discord.com/servers?query=albion+online+tr)
30. Albion Online \- Discord, acessado em setembro 1, 2025, [https://discord.com/invite/albiononline](https://discord.com/invite/albiononline)
31. Albion Online \- Discord Compilation : r/albiononline \- Reddit, acessado em setembro 1, 2025, [https://www.reddit.com/r/albiononline/comments/uhsyc3/albion_online_discord_compilation/](https://www.reddit.com/r/albiononline/comments/uhsyc3/albion_online_discord_compilation/)
32. Top 10 Albion Discords Every Player Should Know About \- YouTube, acessado em setembro 1, 2025, [https://www.youtube.com/watch?v=9lv8LuD4Xuw](https://www.youtube.com/watch?v=9lv8LuD4Xuw)
33. \[PSA\] Community Discords you should know about\! : r/albiononline \- Reddit, acessado em setembro 1, 2025, [https://www.reddit.com/r/albiononline/comments/u44nhh/psa_community_discords_you_should_know_about/](https://www.reddit.com/r/albiononline/comments/u44nhh/psa_community_discords_you_should_know_about/)
34. T4A \- API info \- Tools4Albion, acessado em setembro 1, 2025, [https://www.tools4albion.com/api_info.php](https://www.tools4albion.com/api_info.php)
35. The Albion Online Data Project: Home, acessado em setembro 1, 2025, [https://www.albion-online-data.com/](https://www.albion-online-data.com/)
36. Create Sign Up Templates | Raid Organizer Documentation, acessado em setembro 1, 2025, [https://docs.raidorganizer.org/signup-templates/create-template/](https://docs.raidorganizer.org/signup-templates/create-template/)
37. Niraj-Dilshan/Albion-Guild-Management-Bot \- GitHub, acessado em setembro 1, 2025, [https://github.com/Niraj-Dilshan/Albion-Guild-Management-Bot](https://github.com/Niraj-Dilshan/Albion-Guild-Management-Bot)
38. Monetizing Your Discord App | Documentation | Discord Developer Portal, acessado em setembro 1, 2025, [https://discord.com/developers/docs/monetization/overview](https://discord.com/developers/docs/monetization/overview)
39. Monetization Terms \- Discord Support, acessado em setembro 1, 2025, [https://support.discord.com/hc/en-us/articles/5330075836311-Monetization-Terms](https://support.discord.com/hc/en-us/articles/5330075836311-Monetization-Terms)
40. Rate Limits | Documentation | Discord Developer Portal, acessado em setembro 1, 2025, [https://discord.com/developers/docs/topics/rate-limits](https://discord.com/developers/docs/topics/rate-limits)
41. Rate Limits \- DiSky Wiki, acessado em setembro 1, 2025, [https://disky.me/docs/concepts/ratelimit/](https://disky.me/docs/concepts/ratelimit/)
42. How I Host a Bot in 45,000 Discord Servers For Free \- DEV Community, acessado em setembro 1, 2025, [https://dev.to/mistval/how-i-host-a-bot-in-45000-discord-servers-for-free-5bk9](https://dev.to/mistval/how-i-host-a-bot-in-45000-discord-servers-for-free-5bk9)
43. Albion Market API problems : r/albiononline \- Reddit, acessado em setembro 1, 2025, [https://www.reddit.com/r/albiononline/comments/1n1r0i6/albion_market_api_problems/](https://www.reddit.com/r/albiononline/comments/1n1r0i6/albion_market_api_problems/)
44. 5 Must-Have Discord Bots For Businesses in 2025 \- TokenMinds, acessado em setembro 1, 2025, [https://tokenminds.co/blog/crypto-marketing/best-discord-bots-for-business](https://tokenminds.co/blog/crypto-marketing/best-discord-bots-for-business)
45. community.latenode.com, acessado em setembro 1, 2025, [https://community.latenode.com/t/how-to-monetize-my-discord-bot-and-earn-revenue/29042\#:\~:text=Based%20on%20my%20experience%20with,commands%20or%20enhanced%20moderation%20tools.](https://community.latenode.com/t/how-to-monetize-my-discord-bot-and-earn-revenue/29042#:~:text=Based%20on%20my%20experience%20with,commands%20or%20enhanced%20moderation%20tools.)
46. Can you make money from creating Discord bots? \- Latenode community, acessado em setembro 1, 2025, [https://community.latenode.com/t/can-you-make-money-from-creating-discord-bots/33798](https://community.latenode.com/t/can-you-make-money-from-creating-discord-bots/33798)
47. Understanding discord bot price: what developers and SMBs need to know \- BytePlus, acessado em setembro 1, 2025, [https://www.byteplus.com/en/topic/540537](https://www.byteplus.com/en/topic/540537)
48. How much should I charge for my feature-rich Discord bot subscription?, acessado em setembro 1, 2025, [https://community.latenode.com/t/how-much-should-i-charge-for-my-feature-rich-discord-bot-subscription/12976](https://community.latenode.com/t/how-much-should-i-charge-for-my-feature-rich-discord-bot-subscription/12976)
49. Premium | Raid Organizer Documentation, acessado em setembro 1, 2025, [https://docs.raidorganizer.org/premium/](https://docs.raidorganizer.org/premium/)
