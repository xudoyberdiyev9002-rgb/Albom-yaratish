/* IC3 GS6 — Fleshkartalar (kalit so'z → javob kaliti).
 * Yodlash uchun: front = mavzu/cue, back = asosiy javob.
 * c = kategoriya (filtrlash uchun).
 */
window.IC3_FLASHCARDS = [
  // ===== Security & Privacy =====
  {c:'Security', f:'Keep online accounts secure', b:'Strong, UNIQUE password for each account'},
  {c:'Security', f:'Multifactor authentication (MFA) — purpose', b:'Confirm your identity (2+ credentials)'},
  {c:'Security', f:'3 MFA factor types', b:'Something you KNOW / HAVE / ARE'},
  {c:'Security', f:'Biometric factor', b:'Fingerprint, facial recognition'},
  {c:'Security', f:'Possession (physical) factor', b:'Smartphone, employee access card'},
  {c:'Security', f:'Knowledge (logical) factor', b:'Password, PIN'},
  {c:'Security', f:'3 common MFA credentials', b:'Fingerprint, PIN, Password'},
  {c:'Security', f:'Secure password you can remember', b:'Use parts of a random phrase'},
  {c:'Security', f:'Spam', b:'Unwanted email sent in bulk'},
  {c:'Security', f:'Malware', b:'Virus / Trojan that harms a device'},
  {c:'Security', f:'Run a virus scan when…', b:'Computer slows / program starts on its own'},
  {c:'Security', f:'Scan frequency (heavy internet user)', b:'2–3 times per week'},
  {c:'Security', f:'Remove all personal info from a device', b:'Factory reset'},
  {c:'Security', f:'Coworker shares password — using it is…', b:'Fraud; shared responsibility for breach'},

  // ===== Privacy =====
  {c:'Privacy', f:'Protect privacy after browsing', b:'Delete browser cookies'},
  {c:'Privacy', f:'Actions that boost online privacy', b:'Delete cookies; no reused logins; don\u2019t stay logged in'},
  {c:'Privacy', f:'PII facts', b:'Used for identity theft; closing account ≠ deletes it'},
  {c:'Privacy', f:'Best workplace privacy', b:'Don\u2019t use work equipment for anything personal'},
  {c:'Privacy', f:'Email exposed to employer/school when…', b:'Use work/school account or work computer'},
  {c:'Privacy', f:'Actions that COMPROMISE privacy', b:'Stay logged in; reuse passwords; keep cookies'},
  {c:'Privacy', f:'Posting vacation location reveals…', b:'Your location + that your home is vacant'},
  {c:'Privacy', f:'Friend shares their account info — you should', b:'Keep the information safe'},
  {c:'Privacy', f:'Cannot share without permission', b:'Sensitive data (e.g. allergies)'},
  {c:'Privacy', f:'Legal claims for private info', b:'Publication of Private Facts; Name/Likeness'},

  // ===== Hardware / OS / Troubleshooting =====
  {c:'Hardware', f:'Set which browser opens email links (Win10)', b:'Default Apps'},
  {c:'Hardware', f:'Find drivers for "unknown device"', b:'Manufacturer\u2019s website (by model number)'},
  {c:'Hardware', f:'Phone won\u2019t call/text — first step', b:'Power phone off and back on'},
  {c:'Hardware', f:'Change default browser on a phone', b:'In the browser settings'},
  {c:'Hardware', f:'Website not loading — try first', b:'Clear the browser cache'},
  {c:'Hardware', f:'Clear storage during troubleshooting', b:'Make room for system updates'},
  {c:'Hardware', f:'Screen freezes — check', b:'Task Manager (resource usage)'},
  {c:'Hardware', f:'Pages load slowly — check', b:'Network connection'},
  {c:'Hardware', f:'Camera shutter noise (no photo) — check', b:'App permissions'},
  {c:'Hardware', f:'Ticking sound in case — check', b:'Hard disk drive (worn disk head)'},
  {c:'Hardware', f:'Delete files + empty Recycle Bin', b:'File data REMAINS (only reference deleted)'},
  {c:'Hardware', f:'Highest screen resolution', b:'1920×1080'},
  {c:'Hardware', f:'Largest file size order', b:'PB > TB > GB > MB > KB'},

  // ===== Software / Apps =====
  {c:'Software', f:'EULA', b:'Defines acceptable use of software'},
  {c:'Software', f:'Benefit of desktop app vs cloud', b:'Works without an internet connection'},
  {c:'Software', f:'Works online + iOS + Android', b:'Microsoft 365'},
  {c:'Software', f:'Create pivot tables', b:'Excel'},
  {c:'Software', f:'Analyze tables of numbers', b:'Google Sheets / Excel'},
  {c:'Software', f:'Best for flowcharts', b:'Microsoft Visio, SmartDraw'},
  {c:'Software', f:'Build charts from raw data', b:'Excel, Google Sheets'},
  {c:'Software', f:'Produce a webcast', b:'Zoom'},
  {c:'Software', f:'Translate Spanish pages in Chrome', b:'Google Translate extension'},
  {c:'Software', f:'Container for audio + video + data', b:'MP4'},
  {c:'Software', f:'Cannot email (too big)', b:'1-min 8K AVI video'},
  {c:'Software', f:'Browser', b:'App used to access websites'},
  {c:'Software', f:'Binary-Coded Machine Language', b:'Ones and zeros (1/0)'},
  {c:'Software', f:'Free & Open Source Software', b:'Right to modify and reuse software'},
  {c:'Software', f:'Fix auto-capitalization in Word', b:'AutoCorrect Options'},
  {c:'Software', f:'Excel / Word / PowerPoint use', b:'Data·formulas / TOC report / auto-advancing slides'},

  // ===== Cloud & Versioning =====
  {c:'Cloud', f:'Cloud versioning', b:'Keeps a history of file changes'},
  {c:'Cloud', f:'Versioning lets you…', b:'Retrieve old versions of files'},
  {c:'Cloud', f:'New version in Google Docs when…', b:'Upload new file; add a comment'},
  {c:'Cloud', f:'Reasons for software versioning', b:'Recognize updates; track changes'},

  // ===== Accessibility =====
  {c:'Accessibility', f:'Alt text', b:'Describes image for a screen reader'},
  {c:'Accessibility', f:'Alt text should include', b:'Brief description + relevant context (not copyright)'},
  {c:'Accessibility', f:'Elements needing alt text', b:'Image, Caption'},
  {c:'Accessibility', f:'Accessible font rules', b:'Sans serif, 12pt/16px, high contrast'},
  {c:'Accessibility', f:'Color contrast effect', b:'Higher contrast = object more visible'},
  {c:'Accessibility', f:'Improve readability', b:'Strong contrast + slight line spacing'},
  {c:'Accessibility', f:'Headings vs body text', b:'Larger / different font for headings'},

  // ===== Intellectual Property =====
  {c:'IP', f:'NOT fair use', b:'Political advertisement'},
  {c:'IP', f:'Fair use OK', b:'Parody, news report, teaching'},
  {c:'IP', f:'Intellectual Property', b:'Human ideas: copyright/patent/trademark/secret'},
  {c:'IP', f:'Citation', b:'Giving credit to a source'},
  {c:'IP', f:'Creative Commons License', b:'Free use with attribution (follow rules)'},
  {c:'IP', f:'Reuse work correctly', b:'Attribution after fair-use principles'},
  {c:'IP', f:'No-cost licenses', b:'Public Domain, Creative Commons'},
  {c:'IP', f:'Protect your IP', b:'Embed name in metadata; Creative Commons license'},
  {c:'IP', f:'Must cite a reference when…', b:'Copy a paragraph; quote song lyrics'},

  // ===== Research / Info literacy =====
  {c:'Research', f:'Boolean search operators', b:'AND (narrow) · OR (broaden) · NOT (exclude)'},
  {c:'Research', f:'Credible source', b:'Cites sources; cross-check multiple (NOT just .org)'},
  {c:'Research', f:'Fallacy: appeal to authority', b:'Relying on one expert as proof'},
  {c:'Research', f:'Fallacy: false dilemma', b:'Limiting choices to avoid another'},
  {c:'Research', f:'Fallacy: hasty generalization', b:'Broad claim from a small sample'},
  {c:'Research', f:'Spot a deepfake', b:'Search the quotes; consider motivations'},
  {c:'Research', f:'Audio editing that alters meaning', b:'Replace audio; rearrange/insert words'},
  {c:'Research', f:'Video editing that alters meaning', b:'Clip out of context; splice different videos'},
  {c:'Research', f:'Bias', b:'Opinions/agendas distorting facts'},
  {c:'Research', f:'Authority (source eval)', b:'Author qualifications & expertise'},
  {c:'Research', f:'Currency (source eval)', b:'How up-to-date the info is'},
  {c:'Research', f:'Poor search results — do', b:'Rephrase to be MORE specific'},
  {c:'Research', f:'Search types', b:'Informational · Navigational · Transactional'},

  // ===== Teamwork / Communication =====
  {c:'Teamwork', f:'Constructive team member traits', b:'Confident, inquisitive'},
  {c:'Teamwork', f:'Help idea generation', b:'Withhold criticism; encourage wild ideas'},
  {c:'Teamwork', f:'Contribute effectively', b:'Give helpful feedback; stay open to ideas'},
  {c:'Teamwork', f:'Behind schedule — do', b:'Show progress and ask for help'},
  {c:'Teamwork', f:'Fix many revisions fast', b:'Distribute work evenly across the team'},
  {c:'Teamwork', f:'Improve communication skills', b:'Positive tone; summarize question before answering'},
  {c:'Teamwork', f:'Client wants worse design changes', b:'Make mockup; ask why; focus on design (not emotion)'},
  {c:'Teamwork', f:'Build client confidence in a meeting', b:'Paraphrase; email proposal w/ deadlines; agree on comms'},
  {c:'Teamwork', f:'Chat config as spokesperson', b:'Only between you and the client'},
  {c:'Teamwork', f:'Respond to unhappy customers', b:'Offer solutions; apologize if valid'},
  {c:'Teamwork', f:'Good digital communication', b:'State purpose; use bullet points; give options'},
  {c:'Teamwork', f:'Email subject line', b:'Clear and specific'},
  {c:'Teamwork', f:'Quick homework reminder', b:'Brief group text message'},
  {c:'Teamwork', f:'See an online threat — first', b:'Notify law enforcement'},
  {c:'Teamwork', f:'Report bullying to…', b:'Threat=Police · Locker=School · Hacked=Provider'},
  {c:'Teamwork', f:'Virtual team success', b:'OneNote; discussion board; shared storage'},

  // ===== Design / Development =====
  {c:'Design', f:'Cyclical design process benefit', b:'Continually test and improve'},
  {c:'Design', f:'Cyclical design order', b:'Requirements → Ideas → Prototype → Test → Refine'},
  {c:'Design', f:'Why build a prototype', b:'Test the solution; reveal design flaws'},
  {c:'Design', f:'Good usability test', b:'Watch users; record their questions'},
  {c:'Design', f:'Design constraints', b:'Deadline (2 weeks); must load quickly'},

  // ===== Presentations / Media =====
  {c:'Media', f:'Presentation for all devices — first', b:'Optimize media file sizes'},
  {c:'Media', f:'Increase audience engagement', b:'Polls/hand-raising; take turns presenting'},
  {c:'Media', f:'Make video load faster', b:'Convert to HTML5; lower resolution'},
  {c:'Media', f:'Media creation process', b:'Capture → Finalize (color) → Distribute (upload)'},

  // ===== Data visualization =====
  {c:'Data Viz', f:'Population growth over time', b:'Line graph (or bar graph)'},
  {c:'Data Viz', f:'Part-to-whole, small data', b:'Pie chart'},
  {c:'Data Viz', f:'Trends over time', b:'Line graph'},
  {c:'Data Viz', f:'Correlation / large data spread', b:'Scatter plot'},
  {c:'Data Viz', f:'Ranking / sales volumes', b:'Bar chart / Column chart'},

  // ===== Society & tech impact =====
  {c:'Society', f:'Skills lost to technology', b:'Map navigation, memorization, mental math'},
  {c:'Society', f:'E-waste facts', b:'Precious + toxic metals; <60% recycled; fastest growing'},
  {c:'Society', f:'Data centers harm environment by', b:'Non-renewable electricity; waste heat into water'},
  {c:'Society', f:'Automation effects', b:'Displaces + creates jobs; automates predictable physical tasks'},
  {c:'Society', f:'Stay current with technology', b:'Tech news feeds; tech groups; app notifications'},

  // ===== Devices =====
  {c:'Devices', f:'Smartphone', b:'Calls/email/messages without Wi-Fi'},
  {c:'Devices', f:'Tablet', b:'Portable: notes, cloud, office apps'},
  {c:'Devices', f:'Desktop computer', b:'Heavy video editing / merging'}
];
