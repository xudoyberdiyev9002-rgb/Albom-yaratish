/* IC3 GS6 — Level 3 savollar bazasi (test.docx dan olingan).
 * Tip turlari:
 *   single   — bitta to'g'ri javob (radio)
 *   multi    — bir nechta to'g'ri javob (checkbox), choose = nechta
 *   tf       — har qatorga True/False
 *   yn       — har qatorga Yes/No
 *   match    — chapdagini o'ngga moslashtirish
 *   dropdown — gap ichidagi tanlovlar
 *   order    — to'g'ri tartibga tartiblash
 */
window.IC3_QUESTIONS = [
  { id:1, type:'multi', choose:3,
    q:'Experts are concerned that society will lose some skills because of reliance on technology. Which three skills can become underutilized through the use of technology?',
    options:[
      {k:'A', t:'Map navigation', c:true},
      {k:'B', t:'Memorization', c:true},
      {k:'C', t:'Organization', c:false},
      {k:'D', t:'Mental math', c:true},
      {k:'E', t:'Eye-hand coordination', c:false},
      {k:'F', t:'Dexterity', c:false}
    ]},
  { id:2, type:'single',
    q:'Which practice helps keep your online accounts secure?',
    options:[
      {k:'A', t:'Share your password with trusted friends', c:false},
      {k:'B', t:'Use the same password for all accounts', c:false},
      {k:'C', t:'Use strong, unique passwords for each account', c:true},
      {k:'D', t:'Write your password on paper near your computer', c:false}
    ]},
  { id:3, type:'single',
    q:'What is an advantage of collaborating within a team to resolve an issue?',
    options:[
      {k:'A', t:'It ensures external resources are unnecessary.', c:false},
      {k:'B', t:'It eliminates the need for individual leadership.', c:false},
      {k:'C', t:'It allows for diverse perspectives to generate solutions.', c:true},
      {k:'D', t:'It balances speed and quality when addressing problems.', c:false}
    ]},
  { id:4, type:'tf',
    q:'Electronic waste (e-waste) refers to used electronics that are discarded, donated, or given to a recycler. For each statement about e-waste, select True or False.',
    rows:[
      {t:'Over 60% of e-waste is recycled', a:false},
      {t:'E-waste is the slowest growing form of waste worldwide', a:false},
      {t:'E-waste contains precious metals like gold and silver that can be recovered and reused', a:true},
      {t:'E-waste contains toxic metals like lead and mercury that cause human illness if they leach into groundwater', a:true}
    ]},
  { id:5, type:'single',
    q:'What is a benefit of using a cyclical design process to create digital products?',
    options:[
      {k:'A', t:'It allows you to follow a strict schedule with a definite ending deadline.', c:false},
      {k:'B', t:'It allows you to deliver the final product as quickly as possible with few changes.', c:false},
      {k:'C', t:'It allows you to continually test and improve the product to achieve the best possible result.', c:true},
      {k:'D', t:'It allows you to work independently, without needing to ask for input from other team members.', c:false}
    ]},
  { id:6, type:'single',
    q:'Your part of a team project is due in three days. You realize you need more time. You have an online meeting tomorrow. What should you do?',
    options:[
      {k:'A', t:'Wait to communicate with the team until after you complete your part of the project.', c:false},
      {k:'B', t:"Explain why you haven't made enough progress.", c:false},
      {k:'C', t:'Tell the team you took on too much.', c:false},
      {k:'D', t:'Describe what you have accomplished and ask for help with the rest.', c:true}
    ]},
  { id:7, type:'single',
    q:'In Windows 10, where can you configure which browser opens website links from email?',
    options:[
      {k:'A', t:'Default Apps', c:true},
      {k:'B', t:'Email Privacy Settings', c:false},
      {k:'C', t:'Notifications', c:false},
      {k:'D', t:'Task Manager', c:false}
    ]},
  { id:8, type:'yn',
    q:'You are researching apples on the internet. For each research topic, select Yes if a Boolean search will help to identify relevant results faster or No if it will not.',
    rows:[
      {t:'Apple varieties', a:true},
      {t:'History of apple agriculture', a:true},
      {t:'Recipes for apple pie or cake', a:false},
      {t:'Macintosh apples, but not the Macintosh computer', a:false}
    ]},
  { id:9, type:'single',
    q:'You need to find drivers for a Windows 10 laptop. Device Manager shows "unknown device" for several components. What should you do?',
    options:[
      {k:'A', t:'From Device Manager, scan for hardware changes.', c:false},
      {k:'B', t:"Use the model number of the machine to locate the Drivers page on the laptop manufacturer's website.", c:true},
      {k:'C', t:'Restart the computer and use the Windows 10 repair tool.', c:false},
      {k:'D', t:'Purchase device driver software from the store where the computer was purchased.', c:false}
    ]},
  { id:10, type:'single',
    q:'A friend asks to borrow software you purchased. Where can you find whether this is an acceptable use of the software?',
    options:[
      {k:'A', t:'Content Management System (CMS)', c:false},
      {k:'B', t:'Electronic Software Rating Board (ESRB)', c:false},
      {k:'C', t:'Access Control List (ACL)', c:false},
      {k:'D', t:'End User License Agreement (EULA)', c:true}
    ]},
  { id:11, type:'tf',
    q:'A coworker shares their password with you. For each statement, select True or False.',
    rows:[
      {t:'If you use someone else\u2019s password, your employer can restrict your future access to the company network', a:true},
      {t:"Using a coworker's password to sign them into the company network because they are late for work is fraud", a:true},
      {t:"If multiple people know a coworker's password and a security breach occurs, they could all be held responsible", a:true}
    ]},
  { id:12, type:'single',
    q:'What happens when you enlarge a small bitmap image that you save from a webpage?',
    options:[
      {k:'A', t:'The image becomes pixelated.', c:true},
      {k:'B', t:'The image becomes clearer.', c:false},
      {k:'C', t:'The image file size decreases.', c:false},
      {k:'D', t:'The image resolution decreases.', c:false}
    ]},
  { id:13, type:'single',
    q:'In Chrome settings, which command should you select to restore default settings and remove unwanted changes?',
    options:[
      {k:'A', t:'You and Google', c:false},
      {k:'B', t:'Appearance', c:false},
      {k:'C', t:'Default browser', c:false},
      {k:'D', t:'On startup', c:false},
      {k:'E', t:'Reset and clean up', c:true}
    ]},
  { id:14, type:'multi', choose:2,
    q:'What are two traits of a constructive team member? (Choose 2)',
    options:[
      {k:'A', t:'Opinionated', c:false},
      {k:'B', t:'Rigid', c:false},
      {k:'C', t:'Confident', c:true},
      {k:'D', t:'Inquisitive', c:true}
    ]},
  { id:15, type:'yn',
    q:'You suspect a social-media video might be an AI deepfake. For each statement, select Yes if the action would help you determine if the video is fake or No if it would not.',
    rows:[
      {t:'Assume that because the video contains a statement unlikely to be said by the speaker that the video is trustworthy.', a:false},
      {t:'Search online for some of the specific quotes from the video to see if they are featured by reputable news organizations.', a:true},
      {t:'Consider the motivations of the originators and sharers of the video.', a:true},
      {t:'Check the comments on the video to see if there are accusations of impropriety or other issues.', a:false}
    ]},
  { id:16, type:'multi', choose:2,
    q:'A study guide story shows "1000 students improved scores by 25%" and quotes "one renowned college professor". Which two logical fallacies does the story contain? (Choose 2)',
    options:[
      {k:'A', t:'Appeal to authority \u2014 relying on one expert as the basis for an argument.', c:true},
      {k:'B', t:'Ad hominem \u2014 attacking the person and not the issue.', c:false},
      {k:'C', t:'Appeal to tradition \u2014 assuming the way things were is better.', c:false},
      {k:'D', t:'False dilemma \u2014 limiting the possible choices to avoid another choice.', c:true}
    ]},
  { id:17, type:'match',
    q:'Move each content type to the most appropriate application for presenting the content.',
    pairs:[
      {l:'A large data set that you manipulate by using formulas', r:'Microsoft Excel'},
      {l:'A multiple-page project proposal with an automatically generated table of contents and index', r:'Microsoft Word'},
      {l:'A visual presentation that automatically advances through multiple topics on an unattended computer', r:'Microsoft PowerPoint'}
    ]},
  { id:18, type:'single',
    q:'You copy a 30-second video clip from the internet (unknown creator). Which scenario would NOT be fair use of the video clip?',
    options:[
      {k:'A', t:'You create a parody that includes the video clip.', c:false},
      {k:'B', t:'You create a political ad that includes the video clip.', c:true},
      {k:'C', t:'You use the video clip as part of a news report.', c:false},
      {k:'D', t:'You use the video clip to teach.', c:false}
    ]},
  { id:19, type:'single',
    q:'You see a post online in which a person is threatening to commit a harmful act. What is the first action you should take?',
    options:[
      {k:'A', t:'Take a screenshot of the post and wait to see if the harmful act is committed.', c:false},
      {k:'B', t:'Reply to the post and convince the original poster not to commit this act.', c:false},
      {k:'C', t:'Share the post to your own social media audience to warn others.', c:false},
      {k:'D', t:'Notify your local law enforcement by telephone or emergency text message if available.', c:true}
    ]},
  { id:20, type:'tf',
    q:'For each strategy for achieving success in a virtual group, select True or False.',
    rows:[
      {t:'Have team members collect information in a OneNote notebook', a:true},
      {t:'Increase efficiency by utilizing only asynchronous communication', a:false},
      {t:'Create a team discussion board for project-related conversations', a:true},
      {t:'Have a central file storage location that all team members can access', a:true}
    ]}
];

window.IC3_QUESTIONS.push(
  { id:21, type:'tf',
    q:'For each statement, select True or False.',
    rows:[
      {t:'Web pages are more credible if they cite sources for their content', a:true},
      {t:'You know a source is reliable when the website address ends in .org', a:false},
      {t:"Consulting multiple sources is a good way to determine a site's accuracy", a:true},
      {t:'A search engine differentiates between good and bad sites; the first results are usually the most reliable', a:false}
    ]},
  { id:22, type:'single',
    q:'A customer calls about a faulty older laptop. What is the best first step for Jackson to take to understand the issue?',
    options:[
      {k:'A', t:'Explain that the laptop is probably too old to fix', c:false},
      {k:'B', t:'Ask the customer about any error messages', c:true},
      {k:'C', t:'Tell the customer to come into the store for a refund', c:false},
      {k:'D', t:'Suggest that the customer buy a new laptop', c:false}
    ]},
  { id:23, type:'tf',
    q:'You must respond to unhappy customer reviews. For each customization, select True if you should implement it or False if you should not.',
    rows:[
      {t:'Offer solutions to the problems the customers express', a:true},
      {t:'Apologize only if the customers have a valid complaint', a:false},
      {t:'Tell unhappy customers that many other customers have given positive reviews of your company', a:false}
    ]},
  { id:24, type:'single',
    q:"Which term describes text embedded with an image that describes the image's visual content to be read aloud by a screen reader?",
    options:[
      {k:'A', t:'Caption', c:false},
      {k:'B', t:'Alt text', c:true},
      {k:'C', t:'Blockquote', c:false},
      {k:'D', t:'Header', c:false}
    ]},
  { id:25, type:'single',
    q:'What is the first thing you should consider when preparing a digital presentation to ensure it can be viewed effectively on various devices?',
    options:[
      {k:'A', t:'Use many transitions and animations', c:false},
      {k:'B', t:'Optimize file size of images and videos for quick loading', c:true},
      {k:'C', t:'Use fancy decorative fonts', c:false},
      {k:'D', t:'Put as much text as possible on slides', c:false}
    ]},
  { id:26, type:'match',
    q:'Move each search topic to the corresponding type of search.',
    pairs:[
      {l:'Population statistics', r:'Informational'},
      {l:'A specific site', r:'Navigational'},
      {l:'Third-party options to purchase software', r:'Transactional'}
    ]},
  { id:27, type:'yn',
    q:'You must maximize your online privacy. For each action, select Yes if it contributes to online privacy or No if it does not.',
    rows:[
      {t:'Stay logged into websites', a:false},
      {t:'Delete cookies after using the browser', a:true},
      {t:'Use the same credentials for multiple accounts', a:false},
      {t:'Open all email messages to make sure they do not include malware', a:false}
    ]},
  { id:28, type:'single',
    q:'Which type of software can be used online and with iOS and Android devices?',
    options:[
      {k:'A', t:'Microsoft 365', c:true},
      {k:'B', t:'Chrome OS', c:false},
      {k:'C', t:'Windows 11', c:false},
      {k:'D', t:'Mac OS', c:false}
    ]},
  { id:29, type:'single',
    q:'Which term describes unwanted email messages that are sent in bulk?',
    options:[
      {k:'A', t:'Spam', c:true},
      {k:'B', t:'Malware', c:false},
      {k:'C', t:'Phishing', c:false},
      {k:'D', t:'Encryption', c:false}
    ]},
  { id:30, type:'multi', choose:2,
    q:'Which two actions will increase audience engagement? (Choose 2)',
    options:[
      {k:'A', t:'Clearly read aloud the slide text', c:false},
      {k:'B', t:'Speak in a soothing monotone', c:false},
      {k:'C', t:'Encourage participation with polls or virtual hand-raising', c:true},
      {k:'D', t:'Have group members take turns presenting', c:true}
    ]},
  { id:31, type:'multi', choose:2,
    q:'Which two actions will help the idea-generation process? (Choose 2)',
    options:[
      {k:'A', t:"Withhold criticism of your peers\u2019 ideas", c:true},
      {k:'B', t:"Only share ideas you're very confident about", c:false},
      {k:'C', t:'Limit each team member to one or two ideas', c:false},
      {k:'D', t:'Encourage wild ideas', c:true}
    ]},
  { id:32, type:'single',
    q:"Which action best demonstrates an understanding of intellectual property guidelines when reusing someone's work?",
    options:[
      {k:'A', t:'Modify the original work slightly and present it as your own', c:false},
      {k:'B', t:'Credit the source only in a bibliography', c:false},
      {k:'C', t:'Use small portions assuming it is fair use', c:false},
      {k:'D', t:'Provide attribution after adhering to fair use principles', c:true}
    ]},
  { id:33, type:'dropdown',
    q:'Complete the sentences by selecting the correct option from each drop-down list.',
    blanks:[
      {pre:'Fingerprints and facial recognition are examples of', opts:['Biometric','Possession (Physical)','Knowledge (Logical)'], ans:'Biometric', post:'authentication factors'},
      {pre:'Smartphones and employee access cards are examples of', opts:['Biometric','Possession (Physical)','Knowledge (Logical)'], ans:'Possession (Physical)', post:'authentication factors'},
      {pre:'Passwords and personal identification numbers (PINs) are examples of', opts:['Biometric','Possession (Physical)','Knowledge (Logical)'], ans:'Knowledge (Logical)', post:'authentication factors'}
    ]},
  { id:34, type:'dropdown',
    q:'You are creating content for a website and must follow accessibility standards. Complete the sentences.',
    blanks:[
      {pre:'The preferred font style is', opts:['sans serif','serif','decorative'], ans:'sans serif', post:'.'},
      {pre:'The minimum recommended font size for website body text is', opts:['12 point / 16 pixels','8 point / 10 pixels','20 point / 24 pixels'], ans:'12 point / 16 pixels', post:'.'},
      {pre:'You should maintain a', opts:['high contrast','low contrast','medium contrast'], ans:'high contrast', post:'between the font color and the background color.'}
    ]},
  { id:35, type:'single',
    q:'You want to stay current with the latest digital technologies. What should you do?',
    options:[
      {k:'A', t:'Subscribe to and read notifications from respected technology sites.', c:true},
      {k:'B', t:'Refresh your knowledge by taking a new class every three years.', c:false},
      {k:'C', t:'Volunteer to create a monthly newsletter for a local school.', c:false},
      {k:'D', t:'Write a monthly blog post about new technology that interests you.', c:false}
    ]},
  { id:36, type:'multi', choose:2,
    q:'Which two visual representations are best for population growth over time? (Choose 2)',
    options:[
      {k:'A', t:'Bar graph', c:true},
      {k:'B', t:'Map', c:false},
      {k:'C', t:'Line graph', c:true},
      {k:'D', t:'Pie chart', c:false}
    ]},
  { id:37, type:'single',
    q:'Which option is recommended for creating a secure password you can remember?',
    options:[
      {k:'A', t:'Use your social media profile name', c:false},
      {k:'B', t:'Use your favorite color and animal', c:false},
      {k:'C', t:'Use parts of a random phrase', c:true},
      {k:'D', t:'Use a name with a number at the end', c:false}
    ]},
  { id:38, type:'single',
    q:'Liam needs help with a homework question. What should he write in the subject line when emailing his teacher?',
    options:[
      {k:'A', t:'Help Needed for Fractions 4.1, Question 12', c:true},
      {k:'B', t:'Urgent Help', c:false},
      {k:'C', t:'Teacher I Need HELP Email Me Back NOW', c:false},
      {k:'D', t:'(no subject)', c:false}
    ]},
  { id:39, type:'single',
    q:"Isaac's online banking app asks for a code from his phone in addition to his password. What is this an example of?",
    options:[
      {k:'A', t:'Multifactor authentication', c:true},
      {k:'B', t:'A website cookie', c:false},
      {k:'C', t:'A phishing attempt', c:false},
      {k:'D', t:'A password reset prompt', c:false}
    ]},
  { id:40, type:'match',
    q:'Move each troubleshooting step to its corresponding issue.',
    pairs:[
      {l:'The computer screen freezes while you are working on a project', r:'Check Task Manager for resource usage'},
      {l:'Webpages load slowly while you search the internet', r:'Check the network connection'},
      {l:'A camera shutter noise comes from your smartphone, but you are not taking photos', r:'Check application permissions'},
      {l:'When you start your computer, you hear a rhythmic ticking sound inside the case', r:'Check the hard disk drive for a worn disk head'}
    ]}
);

window.IC3_QUESTIONS.push(
  { id:41, type:'single',
    q:'Your school cloud storage has versioning turned on. What does this enable you to do?',
    options:[
      {k:'A', t:'Access your files from any operating system', c:false},
      {k:'B', t:"Restore files that you've deleted from the cloud", c:false},
      {k:'C', t:'Retrieve old versions of your files from the cloud', c:true},
      {k:'D', t:'Access your files from any version of the cloud storage app', c:false}
    ]},
  { id:42, type:'match',
    q:'Move each visual representation goal to its most effective visual format.',
    pairs:[
      {l:'Illustrate simple part-to-whole relationships within a small data set', r:'Pie chart'},
      {l:'Show how one or more data series change over time', r:'Line graph'},
      {l:'Show the correlation and distribution of a large amount of data', r:'Scatter plot'}
    ]},
  { id:43, type:'single',
    q:"Which action best demonstrates an understanding of intellectual property guidelines when reusing someone's work?",
    options:[
      {k:'A', t:'Provide attribution after adhering to fair use principles', c:true},
      {k:'B', t:'Credit the original source in a bibliography instead of in-text citations', c:false},
      {k:'C', t:'Use small portions assuming it falls under fair use', c:false},
      {k:'D', t:'Modify the original work slightly and present it as your own', c:false}
    ]},
  { id:44, type:'multi', choose:2,
    q:'Which two website criteria are design constraints? (Choose 2)',
    options:[
      {k:'A', t:'It must be quick to load.', c:true},
      {k:'B', t:'It must provide a method for students to indicate why they will be absent.', c:false},
      {k:'C', t:'It must be complete in two weeks.', c:true},
      {k:'D', t:'It must be easy to use.', c:false}
    ]},
  { id:45, type:'single',
    q:'What is the first thing to consider when preparing a digital presentation for various devices?',
    options:[
      {k:'A', t:'Include as much text as possible on each slide to keep slides low', c:false},
      {k:'B', t:'Use a variety of transitions and animations', c:false},
      {k:'C', t:'Optimize the file size of images and videos for quick loading and smooth playback', c:true},
      {k:'D', t:'Use fancy decorative fonts to make it visually appealing', c:false}
    ]},
  { id:46, type:'multi', choose:2,
    q:'In which two ways do cloud computing data centers negatively impact the environment? (Choose 2)',
    options:[
      {k:'A', t:'They use chemical coolants typically made from hazardous materials.', c:false},
      {k:'B', t:'They use a significant amount of electricity derived from non-renewable energy sources.', c:true},
      {k:'C', t:'They dump waste heat into nearby water sources, raising the temperature beyond what aquatic life can survive.', c:true},
      {k:'D', t:'They are built in cold climates, damaging habitats for wildlife.', c:false}
    ]},
  { id:47, type:'single',
    q:'A website is not loading properly on your browser. What should you try first?',
    options:[
      {k:'A', t:'Clear the browser cache', c:true},
      {k:'B', t:'Email the website owner', c:false},
      {k:'C', t:'Check the BIOS settings', c:false},
      {k:'D', t:'Remove unnecessary apps', c:false}
    ]},
  { id:48, type:'tf',
    q:'For each statement about digital communications with clients and coworkers, select True or False.',
    rows:[
      {t:'Avoid directly stating the purpose of the message.', a:false},
      {t:'Use bullet points or lists to organize message details.', a:true},
      {t:'Use acronyms and abbreviations in all messages to keep them short.', a:false},
      {t:'When you need a client to make a choice, provide multiple options to minimize back-and-forth.', a:true}
    ]},
  { id:49, type:'tf',
    q:'You must protect your personally identifiable information (PII). For each statement, select True or False.',
    rows:[
      {t:'The PII collected by websites can be used for identity theft purposes.', a:true},
      {t:'Using multifactor authentication increases the risk of an outsider accessing your PII.', a:false},
      {t:'Closing an online account permanently deletes your PII from the website hosting server.', a:false}
    ]},
  { id:50, type:'single',
    q:'Emma needs to send a quick homework reminder to her study group. Which method is most appropriate?',
    options:[
      {k:'A', t:'Send a brief group text message with the homework reminder.', c:true},
      {k:'B', t:"Post it on her school's Instagram page.", c:false},
      {k:'C', t:'Call each person individually and remind them.', c:false},
      {k:'D', t:'Ask her teacher to send a reminder email to her study group.', c:false}
    ]},
  { id:51, type:'multi', choose:2,
    q:'Which two options help keep data secure in the workplace? (Choose 2)',
    options:[
      {k:'A', t:'Use strong passwords.', c:true},
      {k:'B', t:'Shut computers down at night.', c:false},
      {k:'C', t:'Report suspicious emails.', c:true},
      {k:'D', t:'Allow workers to share computers.', c:false}
    ]},
  { id:52, type:'single',
    q:'Word keeps correcting the company name "Abusives" (two capital letters). Where can you change this correction preference?',
    options:[
      {k:'A', t:'In the AutoCorrect Options settings', c:true},
      {k:'B', t:'In the computer operating system preferences', c:false},
      {k:'C', t:'In the Grammar & Refinements settings', c:false},
      {k:'D', t:'In the Office Language Preferences', c:false}
    ]},
  { id:53, type:'single',
    q:'Your internet search results are not giving the answers you expected. Which action should you take?',
    options:[
      {k:'A', t:'Refresh the page and search again.', c:false},
      {k:'B', t:'Rephrase your search term to be more specific.', c:true},
      {k:'C', t:'Use fewer words in your search term.', c:false},
      {k:'D', t:"Clear your browser's cache and search again.", c:false}
    ]},
  { id:54, type:'multi', choose:3,
    q:'A client requests changes you believe will make a poster less effective. Which three actions should you take? (Choose 3)',
    options:[
      {k:'A', t:"Create a mockup of the poster with the client's changes and send it to the client.", c:true},
      {k:'B', t:'Ask the client to explain the reasons for the changes and the impact they will have.', c:true},
      {k:'C', t:'Tell the client that their ideas are not welcome.', c:false},
      {k:'D', t:'Remind the client that your team has the knowledge and experience.', c:false},
      {k:'E', t:"Tell the client you don't want to make the changes.", c:false},
      {k:'F', t:'Focus the discussion on design choices rather than your emotional response.', c:true}
    ]},
  { id:55, type:'match',
    q:'Match each term with its correct description.',
    pairs:[
      {l:'The influence of personal opinions or agendas on how information is presented, potentially distorting facts', r:'Bias'},
      {l:'The qualifications and expertise of the author, indicating their knowledge about the topic', r:'Authority'},
      {l:'The relevance and timeliness of the information, indicating how up-to-date it is', r:'Currency'}
    ]},
  { id:56, type:'order',
    q:'You plan a project that uses a cyclical design process. Put the tasks in the correct order.',
    items:['Identify project requirements','Generate ideas','Develop the prototype','Test the prototype','Refine the prototype']},
  { id:57, type:'tf',
    q:'For each statement about technology-driven automation, select True or False.',
    rows:[
      {t:'Automation will displace some existing job roles.', a:true},
      {t:'Automation will lead to the creation of new job roles.', a:true},
      {t:'Activities that include social interactions are more likely than others to be automated.', a:false},
      {t:'Activities that include physical tasks in predictable environments are more likely than others to be automated.', a:true}
    ]},
  { id:58, type:'yn',
    q:'You are conducting online research. When should you use a Boolean search?',
    rows:[
      {t:'To narrow the search results by excluding terms using the NOT operator', a:true},
      {t:'To broaden the search results by including multiple alternatives using the OR operator', a:true},
      {t:'To narrow the search results by combining search terms using the AND operator', a:true}
    ]},
  { id:59, type:'multi', choose:2,
    q:'Which two methods of audio editing would indicate that a video has been altered to change the message? (Choose 2)',
    options:[
      {k:'A', t:'A voice-over identifying the cameraperson has been added to the end of the video.', c:false},
      {k:'B', t:'The original audio has been replaced by a music soundtrack.', c:true},
      {k:'C', t:'Closed captions have been added to the original audio.', c:false},
      {k:'D', t:'Words have been rearranged and inserted.', c:true}
    ]},
  { id:60, type:'single',
    q:'You delete personal files and empty the Recycle Bin before selling your computer. What data remains on your hard drive?',
    options:[
      {k:'A', t:'None. The reference and file data are completely removed.', c:false},
      {k:'B', t:'All of it. The reference and the file data remain.', c:false},
      {k:'C', t:'The reference remains; the file data is completely removed.', c:false},
      {k:'D', t:'The reference is deleted; the file data remains.', c:true}
    ]}
);

window.IC3_QUESTIONS.push(
  { id:61, type:'multi', choose:2,
    q:'You run a usability test for a website. Which two actions ensure you get good test data? (Choose 2)',
    options:[
      {k:'A', t:'Watch the students use the website and note whether they have problems.', c:true},
      {k:'B', t:'Show the students how to use the website.', c:false},
      {k:'C', t:'Listen to the students and record any questions they have.', c:true},
      {k:'D', t:'Tell the students why the school asked you to create the website.', c:false}
    ]},
  { id:62, type:'yn',
    q:'You are adding alt text to images. For each type of information, select Yes if it is necessary to include it or No if it is not.',
    rows:[
      {t:'The image copyright', a:false},
      {t:'A brief description of the image', a:true},
      {t:'Context and details relevant to the image purpose', a:true}
    ]},
  { id:63, type:'single',
    q:"You create a team contact list for a soccer league. Which information can you NOT share without the player's permission?",
    options:[
      {k:'A', t:'City of residence', c:false},
      {k:'B', t:'Team name and position', c:false},
      {k:'C', t:'First name and last name', c:false},
      {k:'D', t:'Allergies', c:true}
    ]},
  { id:64, type:'single',
    q:'What is a benefit of using a desktop app rather than a cloud app?',
    options:[
      {k:'A', t:'The software does not depend on an internet connection.', c:true},
      {k:'B', t:'The up-front cost is less.', c:false},
      {k:'C', t:'The software uses less hard disk drive storage space.', c:false},
      {k:'D', t:'The software is updated more frequently.', c:false}
    ]},
  { id:65, type:'single',
    q:"Sophia's group is unsure how to start a project. What is the best approach for Sophia to help the team identify the issue?",
    options:[
      {k:'A', t:'Ask everyone to give their input on how to begin.', c:true},
      {k:'B', t:'Let one person decide for the group.', c:false},
      {k:'C', t:'Begin working independently until the group decides what to do.', c:false},
      {k:'D', t:'Wait until the next day to see if anyone comes up with an idea.', c:false}
    ]},
  { id:66, type:'single',
    q:'What is the key to contributing constructively to a project team?',
    options:[
      {k:'A', t:'Completing tasks faster than the other group members', c:false},
      {k:'B', t:"Providing feedback that helps improve the team's work", c:true},
      {k:'C', t:'Focusing only on your assigned tasks', c:false},
      {k:'D', t:'Avoiding conflicts by agreeing with all ideas', c:false}
    ]},
  { id:67, type:'single',
    q:'Which statement describes the principles of cloud versioning?',
    options:[
      {k:'A', t:'Cloud versioning requires users to manually save every version of their files.', c:false},
      {k:'B', t:'Cloud versioning enables users to create multiple copies of a file.', c:false},
      {k:'C', t:'Cloud versioning allows users to save only the most recent version of a file.', c:false},
      {k:'D', t:'Cloud versioning keeps a history of changes made to a file.', c:true},
      {k:'E', t:'Cloud versioning automatically deletes old versions after 30 days.', c:false}
    ]},
  { id:68, type:'match',
    q:'Match each media creation process with its appropriate action.',
    pairs:[
      {l:'Choosing the right video resolution and aspect ratio for the platform', r:'Capture video'},
      {l:'Adjusting colors, contrast, and brightness of the footage', r:'Finalize production'},
      {l:'Uploading the video to YouTube or other platforms for audience access', r:'Distribute video'}
    ]},
  { id:69, type:'multi', choose:2,
    q:'Which two actions protect individual and corporate intellectual property? (Choose 2)',
    options:[
      {k:'A', t:'Share your creative work on a public social media account.', c:false},
      {k:'B', t:'Embed your name in the metadata of digital files as the copyright owner.', c:true},
      {k:'C', t:'Create a Creative Commons license, allowing others to use your work with attribution.', c:true},
      {k:'D', t:'Create a digital portfolio that is accessible to everyone on the internet.', c:false}
    ]},
  { id:70, type:'match',
    q:'A friend is being bullied. Match each situation to who your friend should report it to.',
    pairs:[
      {l:'The bully threatens to hurt your friend physically', r:'Law enforcement'},
      {l:"The bully writes insults on your friend's gym class locker", r:'School faculty'},
      {l:'The bully posts insults from a hacked social media account', r:'Social media provider'}
    ]},
  { id:71, type:'single',
    q:'McKenna is asked to enable multifactor authentication on a new account. What is the main purpose of this feature?',
    options:[
      {k:'A', t:'To change your password every month', c:false},
      {k:'B', t:'To allow your friends to easily find you online', c:false},
      {k:'C', t:'To confirm your identity', c:true},
      {k:'D', t:'To create a more complex password for your account', c:false}
    ]},
  { id:72, type:'multi', choose:3,
    q:'You meet a business owner virtually and want them to leave confident in your team. Which three actions should you take? (Choose 3)',
    options:[
      {k:'A', t:'After the client presents ideas, paraphrase what they said.', c:true},
      {k:'B', t:'Speak in a casual, informal manner to put the client at ease.', c:false},
      {k:'C', t:'Tell the client that you will email a draft proposal that includes deadlines.', c:true},
      {k:'D', t:'Discuss your career goals in the field of digital design.', c:false},
      {k:'E', t:'Decide with the client which forms of digital communication to use during the project.', c:true},
      {k:'F', t:'Include a lengthy discussion about the design applications you will use.', c:false}
    ]},
  { id:73, type:'single',
    q:'A client needs multiple revisions fixed as quickly as possible. How should you efficiently complete their revisions?',
    options:[
      {k:'A', t:'Assign all tasks to the entire team so everyone collaborates.', c:false},
      {k:'B', t:'Assign the same task to multiple team members to avoid missing any.', c:false},
      {k:'C', t:'Assign all work to the most experienced team member.', c:false},
      {k:'D', t:'Assign responsibilities so work is evenly distributed among team members.', c:true}
    ]},
  { id:74, type:'match',
    q:'Match each flowchart symbol to its description.',
    pairs:[
      {l:'Data', r:'Can represent any type of data in a flowchart'},
      {l:'Decision', r:'Indicates a decision point between two or more paths'},
      {l:'Delay', r:'Indicates a delay in the process'},
      {l:'Terminator', r:'Indicates the beginning or end of a process'}
    ]},
  { id:75, type:'single',
    q:'Which software program can be used to create pivot tables?',
    options:[
      {k:'A', t:'Excel', c:true},
      {k:'B', t:'Pages', c:false},
      {k:'C', t:'Publisher', c:false},
      {k:'D', t:'PowerPoint', c:false},
      {k:'E', t:'Word', c:false}
    ]},
  { id:76, type:'single',
    q:'What is the purpose of clearing file storage space during troubleshooting?',
    options:[
      {k:'A', t:'To increase network speed', c:false},
      {k:'B', t:'To make room for new system updates', c:true},
      {k:'C', t:'To remove viruses from the system', c:false},
      {k:'D', t:'To prevent applications from syncing with cloud storage', c:false}
    ]},
  { id:77, type:'multi', choose:2,
    q:'Which two web page elements may require the use of the alt text attribute? (Choose 2)',
    options:[
      {k:'A', t:'Index', c:false},
      {k:'B', t:'Table of Contents', c:false},
      {k:'C', t:'Lengthy URL', c:false},
      {k:'D', t:'Caption', c:true},
      {k:'E', t:'Image', c:true}
    ]},
  { id:78, type:'multi', choose:2,
    q:'Which two actions would most likely make someone aware of technological advancements? (Choose 2)',
    options:[
      {k:'A', t:'Subscribe to a technology news feed.', c:true},
      {k:'B', t:'Use a computing device daily.', c:false},
      {k:'C', t:'Watch movies produced using technology.', c:false},
      {k:'D', t:'Join several technology groups on social media and read their posts.', c:true}
    ]},
  { id:79, type:'multi', choose:2,
    q:'Which two circumstances would create a new cloud version in Google Docs? (Choose 2)',
    options:[
      {k:'A', t:'Uploading a new file', c:true},
      {k:'B', t:'Copying a folder', c:false},
      {k:'C', t:'Viewing contents of a folder', c:false},
      {k:'D', t:'Adding a comment to a Google Doc', c:true},
      {k:'E', t:'Downloading a file', c:false}
    ]},
  { id:80, type:'yn',
    q:'Identify if the digital devices meet the requirements.',
    rows:[
      {t:'A smartphone is capable of checking email, sending messages, and receiving voice calls without Wi-Fi', a:true},
      {t:"A tablet is sufficient to merge and edit large videos for your clients' websites", a:false},
      {t:'A notebook computer is portable for classroom use, supports access to the cloud, and runs most office apps', a:true}
    ]}
);

window.IC3_QUESTIONS.push(
  { id:81, type:'single',
    q:'Which Boolean search returns only project manager positions involving SQL, but not Spanish language skills?',
    options:[
      {k:'A', t:'"Project Manager" AND SQL AND Spanish', c:false},
      {k:'B', t:'"Project Manager" AND NOT SQL AND Spanish', c:false},
      {k:'C', t:'"Project Manager" AND SQL AND NOT Spanish', c:true},
      {k:'D', t:'"Project Manager" AND NOT (SQL OR Spanish)', c:false}
    ]},
  { id:82, type:'single',
    q:'What can be performed to remove any personal information from a device?',
    options:[
      {k:'A', t:'A quick scan', c:false},
      {k:'B', t:'Software updates', c:false},
      {k:'C', t:'A factory reset', c:true},
      {k:'D', t:'Device shutdown', c:false}
    ]},
  { id:83, type:'multi', choose:3,
    q:'Multifactor authentication requires two or more credentials. Which are three common credentials? (Choose 3)',
    options:[
      {k:'A', t:'Fingerprint', c:true},
      {k:'B', t:'Date', c:false},
      {k:'C', t:'PIN', c:true},
      {k:'D', t:'Username', c:false},
      {k:'E', t:'Password', c:true}
    ]},
  { id:84, type:'single',
    q:'If a user frequently uses the internet, how often should they run scans on their computer?',
    options:[
      {k:'A', t:'Once a month', c:false},
      {k:'B', t:'Two to three times per week', c:true},
      {k:'C', t:'Rarely', c:false},
      {k:'D', t:'Every day', c:false}
    ]},
  { id:85, type:'yn',
    q:'Identify the appropriate visual format. Select Yes if the visual format is appropriate or No if it is not.',
    rows:[
      {t:'A Table would be best to illustrate simple part-to-whole relationships within a small data set', a:false},
      {t:'To show trends that change over time, you should use a Line Graph', a:true},
      {t:'Displaying sales volumes of various products can be represented with a Column Chart', a:true},
      {t:'Displaying a comparative ranking of data can be represented with a Bar Chart', a:true}
    ]},
  { id:86, type:'single',
    q:"Your smartphone won't receive texts or make outbound calls. Which is the first troubleshooting step?",
    options:[
      {k:'A', t:'If you have a SIM card, replace it.', c:false},
      {k:'B', t:'Perform a factory reset.', c:false},
      {k:'C', t:'Power your phone off and back on.', c:true},
      {k:'D', t:'Call technical support.', c:false}
    ]},
  { id:87, type:'single',
    q:'Which is the best way to protect online privacy at your workplace?',
    options:[
      {k:'A', t:'Delete all cookies after doing personal shopping on your work computer.', c:false},
      {k:'B', t:'Send personal emails using your work account.', c:false},
      {k:'C', t:'Make sure nobody is looking when you surf the Internet.', c:false},
      {k:'D', t:"Don't use work equipment to do anything personal.", c:true}
    ]},
  { id:88, type:'multi', choose:2,
    q:'Which two software tools would be best to compose a flowchart? (Choose 2)',
    options:[
      {k:'A', t:'Intuit QuickBooks', c:false},
      {k:'B', t:'Affinity Designer', c:false},
      {k:'C', t:'Microsoft Visio', c:true},
      {k:'D', t:'SmartDraw', c:true},
      {k:'E', t:'Adobe Illustrator', c:false}
    ]},
  { id:89, type:'single',
    q:'On a smartphone, where can you change the setting that controls which browser opens automatically?',
    options:[
      {k:'A', t:'Task Manager', c:false},
      {k:'B', t:'In the browser settings', c:true},
      {k:'C', t:'Email Settings', c:false},
      {k:'D', t:"In your phone's App store", c:false}
    ]},
  { id:90, type:'multi', choose:2,
    q:'Which two software tools would be best to build tables, charts, and visual representations of raw data? (Choose 2)',
    options:[
      {k:'A', t:'Google Sheets', c:true},
      {k:'B', t:'Microsoft Excel', c:true},
      {k:'C', t:'Adobe Illustrator', c:false},
      {k:'D', t:'Affinity Designer', c:false},
      {k:'E', t:'Intuit QuickBooks', c:false}
    ]},
  { id:91, type:'single',
    q:'Which Chrome extension will display Spanish web pages in English?',
    options:[
      {k:'A', t:'Google Translate', c:true},
      {k:'B', t:'ReadaLoud', c:false},
      {k:'C', t:'Screencastify', c:false},
      {k:'D', t:'Dark Reader', c:false}
    ]},
  { id:92, type:'single',
    q:'Which file format is capable of holding audio, video, and other media by containing data rather than code?',
    options:[
      {k:'A', t:'MP3', c:false},
      {k:'B', t:'MP4', c:true},
      {k:'C', t:'WMA', c:false},
      {k:'D', t:'WAV', c:false}
    ]},
  { id:93, type:'yn',
    q:'Select Yes if the action follows accessibility standards for fonts or No if it does not.',
    rows:[
      {t:'Serif fonts should be used because they are the easiest to read online', a:false},
      {t:'Body text font sizes should be between 15\u201325px', a:true},
      {t:'Optimal length of a line of text is 45\u201390 characters; the ideal width is 66 characters', a:true},
      {t:'White space between headers and body text should be between 15\u201330px', a:true}
    ]},
  { id:94, type:'single',
    q:'How does color contrast affect the visually impaired?',
    options:[
      {k:'A', t:'Increasing contrast between an object and its background makes the object more visible.', c:true},
      {k:'B', t:'Offering a variety of colors makes focusing easier.', c:false},
      {k:'C', t:'Color contrast has no effect on the visually impaired.', c:false},
      {k:'D', t:'Increasing contrast makes the object less visible.', c:false}
    ]},
  { id:95, type:'multi', choose:2,
    q:'What are two reasons for software versioning? (Choose 2)',
    options:[
      {k:'A', t:'Allows retailers to charge more money', c:false},
      {k:'B', t:'Enables customers to recognize updated versions', c:true},
      {k:'C', t:'Allows programmers to track changes', c:true},
      {k:'D', t:'Enables computing devices to use less memory', c:false},
      {k:'E', t:'Allows software publishers to track sales', c:false}
    ]},
  { id:96, type:'single',
    q:'What is the name of human ideas internationally protected by copyright, patent, trademark, or trade secret?',
    options:[
      {k:'A', t:'Imaginary Property', c:false},
      {k:'B', t:'Real Property', c:false},
      {k:'C', t:'Tangible Property', c:false},
      {k:'D', t:'Intellectual Property', c:true}
    ]},
  { id:97, type:'single',
    q:'Which is the highest screen resolution?',
    options:[
      {k:'A', t:'1366\u00d7768', c:false},
      {k:'B', t:'1920\u00d71080', c:true},
      {k:'C', t:'1440\u00d7900', c:false},
      {k:'D', t:'1536\u00d7864', c:false}
    ]},
  { id:98, type:'multi', choose:2,
    q:'Which two are the most popular ways to distinguish between paragraph headings and body text on a website? (Choose 2)',
    options:[
      {k:'A', t:'Use a larger font for headings than body text.', c:true},
      {k:'B', t:'Use the same font for both headings and body text.', c:false},
      {k:'C', t:'Use only serif fonts.', c:false},
      {k:'D', t:'Use the same size font for both.', c:false},
      {k:'E', t:'Use one font for headings and a different font for body text.', c:true}
    ]},
  { id:99, type:'single',
    q:'A license that gives customers the right to modify and reuse the software.',
    options:[
      {k:'A', t:'Free and Open Source Software', c:true},
      {k:'B', t:'Boolean Search', c:false},
      {k:'C', t:'Computer Model Number', c:false},
      {k:'D', t:'Synchronous Editing', c:false}
    ]},
  { id:100, type:'single',
    q:'A virus or Trojan horse designed to cause harm to a computer or device.',
    options:[
      {k:'A', t:'Proprietary Software', c:false},
      {k:'B', t:'Password', c:false},
      {k:'C', t:'Malware', c:true},
      {k:'D', t:'Instant Messaging', c:false}
    ]}
);

window.IC3_QUESTIONS.push(
  { id:101, type:'single',
    q:'An application used to access websites on the internet.',
    options:[
      {k:'A', t:'Attribution', c:false},
      {k:'B', t:'Email', c:false},
      {k:'C', t:'Browser', c:true},
      {k:'D', t:'Public Domain', c:false}
    ]},
  { id:102, type:'multi', choose:2,
    q:'What are two consequences of posting your current location while away on vacation? (Choose 2)',
    options:[
      {k:'A', t:"Others will know the user's location", c:true},
      {k:'B', t:'Others will not believe the user is away', c:false},
      {k:'C', t:'Others will go on vacation', c:false},
      {k:'D', t:"Others will know that the user's home is vacant", c:true},
      {k:'E', t:'Others will think the user is home', c:false}
    ]},
  { id:103, type:'multi', choose:2,
    q:'What should digital users have current knowledge of? (Choose 2)',
    options:[
      {k:'A', t:'The latest technology', c:true},
      {k:'B', t:'Internet wormholes', c:false},
      {k:'C', t:'Early computer history', c:false},
      {k:'D', t:'Compromised data', c:true}
    ]},
  { id:104, type:'single',
    q:'If someone shares their account information with a close friend, what should that friend do with the information?',
    options:[
      {k:'A', t:'Keep the information safe', c:true},
      {k:'B', t:'Impersonate the friend as a joke', c:false},
      {k:'C', t:'Steal and share personally identifiable information', c:false},
      {k:'D', t:'Use the information to make purchases', c:false}
    ]},
  { id:105, type:'match',
    q:'Match the specific requirement to the most appropriate digital device.',
    pairs:[
      {l:'Capable of checking email, sending messages, and receiving voice calls without Wi-Fi', r:'Smartphone'},
      {l:"Capable of merging and editing large videos for a client's website", r:'Desktop Computer'},
      {l:'Portable for classroom use, supports note taking, cloud access, and runs most office apps', r:'Tablet'}
    ]},
  { id:106, type:'single',
    q:'A means of giving credit to a source when their information is used.',
    options:[
      {k:'A', t:'Search Operators', c:false},
      {k:'B', t:'Chart', c:false},
      {k:'C', t:'Encryption', c:false},
      {k:'D', t:'Citation', c:true}
    ]},
  { id:107, type:'single',
    q:'A free license used by creators to permit others to use their content, free of charge, as long as they follow the license rules.',
    options:[
      {k:'A', t:'Email', c:false},
      {k:'B', t:'Attribution', c:false},
      {k:'C', t:'Personally Identifiable Information', c:false},
      {k:'D', t:'Creative Commons License', c:true}
    ]},
  { id:108, type:'single',
    q:'A digital language made up of binary digits (ones and zeros) that allow hardware and software to communicate.',
    options:[
      {k:'A', t:'Grammarly', c:false},
      {k:'B', t:'Binary-Coded Machine Language', c:true},
      {k:'C', t:'Page Orientation', c:false},
      {k:'D', t:'Public Domain', c:false}
    ]},
  { id:109, type:'single',
    q:'For your science class, you need to analyze several tables of numbers. Which software application should you use?',
    options:[
      {k:'A', t:'Intuit QuickBooks', c:false},
      {k:'B', t:'Microsoft PowerPoint', c:false},
      {k:'C', t:'Adobe InDesign', c:false},
      {k:'D', t:'Google Sheets', c:true}
    ]},
  { id:110, type:'multi', choose:2,
    q:'Which two practices help you stay informed about current digital threats for an app you use? (Choose 2)',
    options:[
      {k:'A', t:'Follow a variety of social media accounts that post independent content about digital tools.', c:true},
      {k:'B', t:'Pay attention to app notifications for software updates and terms of use changes.', c:true},
      {k:'C', t:"Subscribe to email alerts for the publisher's latest marketing offers and discounts.", c:false},
      {k:'D', t:"Review the publisher's website once a year for updates and news.", c:false}
    ]},
  { id:111, type:'tf',
    q:'Analyze the statements about employment, social media use, and privacy. For each, select True or False.',
    rows:[
      {t:'Employers are allowed to monitor your social media posts', a:true},
      {t:'You can be fired for social media messages you post on your own time', a:true},
      {t:'Employers can restrict what you post on your personal social media accounts', a:true}
    ]},
  { id:112, type:'yn',
    q:'You need to decrease video loading time. For each action, select Yes if it will make the video load faster or No if it will not.',
    rows:[
      {t:'Increase the video bitrate', a:false},
      {t:'Convert the video to HTML5', a:true},
      {t:'Decrease the video resolution', a:true},
      {t:'Replace the video with an uncompressed version', a:false}
    ]},
  { id:113, type:'yn',
    q:'You are adding alt text to images. For each type of information, select Yes if it is necessary to include it or No if it is not.',
    rows:[
      {t:'The image copyright', a:false},
      {t:'A brief description of the image', a:true},
      {t:'Context and details relevant to the image purpose', a:true}
    ]},
  { id:114, type:'multi', choose:2,
    q:'Which two actions will improve the readability of a document? (Choose 2)',
    options:[
      {k:'A', t:'Carefully choose a font color with strong contrast against the background.', c:true},
      {k:'B', t:'Use a small, compact font size to prevent paragraphs from breaking across pages.', c:false},
      {k:'C', t:'Set the line spacing so there is a slight distance between each line of text.', c:true},
      {k:'D', t:'Type in all caps to make the text more uniform.', c:false},
      {k:'E', t:'Select a font family that is unique and decorative.', c:false}
    ]},
  { id:115, type:'multi', choose:2,
    q:'For which two reasons should you create a prototype of your order form? (Choose 2)',
    options:[
      {k:'A', t:'To test whether the solution will work.', c:true},
      {k:'B', t:'To enable customers to place orders before you launch the website.', c:false},
      {k:'C', t:'To reveal flaws in your design.', c:true},
      {k:'D', t:'To advertise your business.', c:false}
    ]},
  { id:116, type:'multi', choose:2,
    q:'For which two reasons should you run a virus scan? (Choose 2)',
    options:[
      {k:'A', t:'Your computer starts to run slower than usual.', c:true},
      {k:'B', t:'You receive an email from an online store after placing an order.', c:false},
      {k:'C', t:'A program begins operations on its own, without you initiating it.', c:true},
      {k:'D', t:'A pop-up ad appears on a website.', c:false}
    ]},
  { id:117, type:'single',
    q:'Your meeting software allows you to enable/disable chat for different participants. How should you configure chat for a client meeting where you are spokesperson?',
    options:[
      {k:'A', t:'Allow chat communication between all meeting participants.', c:false},
      {k:'B', t:'Allow chat communication only between you and the client.', c:true},
      {k:'C', t:'Turn off the chat function.', c:false},
      {k:'D', t:'Allow chat communication only between you and your team members.', c:false}
    ]},
  { id:118, type:'multi', choose:3,
    q:'Which three types of authentication factors are used to prove your identity when you use multifactor authentication? (Choose 3)',
    options:[
      {k:'A', t:'Something you are', c:true},
      {k:'B', t:'Something you make', c:false},
      {k:'C', t:'Something you calculate', c:false},
      {k:'D', t:'Something you know', c:true},
      {k:'E', t:'Something you research', c:false},
      {k:'F', t:'Something you have', c:true}
    ]},
  { id:119, type:'multi', choose:2,
    q:'A study-guide story uses one expert and a forced choice. Which two logical fallacies does the story contain? (Choose 2)',
    options:[
      {k:'A', t:'Red herring', c:false},
      {k:'B', t:'False dilemma', c:true},
      {k:'C', t:'Ad hominem', c:false},
      {k:'D', t:'Hasty generalization', c:true}
    ]},
  { id:120, type:'yn',
    q:'For each search topic, select Yes if a Boolean search will help identify relevant results faster or No if it will not.',
    rows:[
      {t:'Safaris outside of Africa', a:true},
      {t:'General information about zebras', a:false},
      {t:'A specific quote by a specific author', a:true},
      {t:'Elephants in the southern hemisphere', a:true}
    ]}
);

window.IC3_QUESTIONS.push(
  { id:121, type:'single',
    q:'For your science class, you need to analyze several tables of numbers. Which software application should you use?',
    options:[
      {k:'A', t:'Intuit QuickBooks', c:false},
      {k:'B', t:'Microsoft PowerPoint', c:false},
      {k:'C', t:'Adobe InDesign', c:false},
      {k:'D', t:'Google Sheets', c:true}
    ]},
  { id:122, type:'multi', choose:2,
    q:'Which two actions can you take to improve your communication skills? (Choose 2)',
    options:[
      {k:'A', t:'When talking with the client, speak in a positive, respectful tone.', c:true},
      {k:'B', t:'Text the client to apologize for your poor communication.', c:false},
      {k:'C', t:'When the client asks questions, summarize the question before you answer.', c:true},
      {k:'D', t:'Have another team member take over the communication at the next meeting.', c:false}
    ]},
  { id:123, type:'multi', choose:2,
    q:'Which two video editing methods are used to alter videos to change the original meaning of the content? (Choose 2)',
    options:[
      {k:'A', t:'Show a brief clip of a longer segment of the video.', c:true},
      {k:'B', t:'At the end, show links to credible sources that support the message.', c:false},
      {k:'C', t:'Edit together pieces of different videos.', c:true},
      {k:'D', t:'Identify the people and the cameraperson in credits at the end.', c:false}
    ]},
  { id:124, type:'single',
    q:'Based on the system requirements shown, which statement is correct?',
    options:[
      {k:'A', t:'This laptop meets the optimal system requirements.', c:false},
      {k:'B', t:'This laptop meets the recommended system requirements.', c:false},
      {k:'C', t:'This laptop meets the minimum system requirements.', c:true},
      {k:'D', t:'This laptop does not meet the minimum system requirements.', c:false}
    ]},
  { id:125, type:'single',
    q:'Which file size is the largest?',
    options:[
      {k:'A', t:'3 petabytes (PB)', c:true},
      {k:'B', t:'16 gigabytes (GB)', c:false},
      {k:'C', t:'1.44 megabytes (MB)', c:false},
      {k:'D', t:'640 kilobytes (KB)', c:false},
      {k:'E', t:'2 terabytes (TB)', c:false}
    ]},
  { id:126, type:'single',
    q:'How can you ensure your contributions to a project team are most effective?',
    options:[
      {k:'A', t:'By being open to suggestions and willing to adapt your ideas', c:true},
      {k:'B', t:'By focusing only on your own tasks', c:false},
      {k:'C', t:'By always taking the lead', c:false},
      {k:'D', t:'By withholding your ideas', c:false}
    ]},
  { id:127, type:'single',
    q:'Which file can you NOT send through a standard email provider such as Gmail or Yahoo?',
    options:[
      {k:'A', t:'A 30-frame 1080p-resolution animated GIF', c:false},
      {k:'B', t:'A 5-minute podcast in MP3 format', c:false},
      {k:'C', t:'A 1-minute 8K-resolution video in AVI format', c:true},
      {k:'D', t:'A 400-page plain-text file', c:false}
    ]},
  { id:128, type:'single',
    q:'Which file cannot typically be sent through a standard email provider?',
    options:[
      {k:'A', t:'A text document', c:false},
      {k:'B', t:'A 5-minute MP3 file', c:false},
      {k:'C', t:'A 1-minute 8K video in AVI format', c:true},
      {k:'D', t:'An animated GIF', c:false}
    ]},
  { id:129, type:'single',
    q:'Which scenario would NOT be considered fair use of a video clip?',
    options:[
      {k:'A', t:'Using the clip in a news report', c:false},
      {k:'B', t:'Using the clip for teaching', c:false},
      {k:'C', t:'Using the clip in a political advertisement', c:true},
      {k:'D', t:'Using the clip in a parody', c:false}
    ]},
  { id:130, type:'multi', choose:2,
    q:'Which two video editing methods can alter a video to change its original meaning? (Choose 2)',
    options:[
      {k:'A', t:'Showing a short clip out of context', c:true},
      {k:'B', t:'Editing together clips from different videos', c:true},
      {k:'C', t:'Adding credits', c:false},
      {k:'D', t:'Including references', c:false}
    ]},
  { id:131, type:'multi', choose:2,
    q:'Which two actions will improve the readability of a document? (Choose 2)',
    options:[
      {k:'A', t:'Use all capital letters', c:false},
      {k:'B', t:'Use a strong contrast between text and background', c:true},
      {k:'C', t:'Use slight spacing between lines of text', c:true},
      {k:'D', t:'Use decorative fonts', c:false}
    ]},
  { id:132, type:'multi', choose:2,
    q:'Which two actions will improve communication skills when working with a client? (Choose 2)',
    options:[
      {k:'A', t:'Summarize the question before answering', c:true},
      {k:'B', t:'Send a text message to apologize for poor communication', c:false},
      {k:'C', t:'Have another team member take over communication', c:false},
      {k:'D', t:'Speak in a positive and respectful tone', c:true}
    ]},
  { id:133, type:'multi', choose:2,
    q:'Which two actions can you take to improve your communication skills? (Choose 2)',
    options:[
      {k:'A', t:'When talking with the client, speak in a positive, respectful tone.', c:true},
      {k:'B', t:'Text the client to apologize for your poor communication.', c:false},
      {k:'C', t:'When the client asks questions, summarize the question before you answer.', c:true},
      {k:'D', t:'Have another team member take over the communication at the next meeting.', c:false}
    ]},
  { id:134, type:'multi', choose:2,
    q:'In which two ways do cloud computing data centers negatively impact the environment? (Choose 2)',
    options:[
      {k:'A', t:'They use chemical coolants made from hazardous materials', c:false},
      {k:'B', t:'They dump waste heat into water sources', c:true},
      {k:'C', t:'They are built in cold climates that harm wildlife', c:false},
      {k:'D', t:'They use a significant amount of electricity from non-renewable sources', c:true}
    ]},
  { id:135, type:'multi', choose:2,
    q:'Which two design criteria are considered constraints when building a website? (Choose 2)',
    options:[
      {k:'A', t:'It must be easy to use', c:false},
      {k:'B', t:'It must be completed in two weeks', c:true},
      {k:'C', t:'It must allow users to submit reasons', c:false},
      {k:'D', t:'It must load quickly', c:true}
    ]},
  { id:136, type:'match',
    q:'Match each scenario to its fair-use status.',
    pairs:[
      {l:'Using the clip in a parody', r:'Fair use'},
      {l:'Using the clip in a political advertisement', r:'Not fair use'},
      {l:'Using the clip for teaching', r:'Fair use'},
      {l:'Using the clip in a news report', r:'Fair use'}
    ]},
  { id:137, type:'single',
    q:'What is one of the most important actions you can take to protect your privacy after browsing the Internet?',
    options:[
      {k:'A', t:'Delete your browser cookies.', c:true},
      {k:'B', t:'Use different browsers.', c:false},
      {k:'C', t:'Stay logged into the last website you visit.', c:false},
      {k:'D', t:'Use the same login and password for multiple web sites.', c:false}
    ]},
  { id:138, type:'yn',
    q:'Select Yes if the action will help keep your digital knowledge current or No if it will not.',
    rows:[
      {t:'Volunteer to sit on the advisory board of a non-profit organization.', a:false},
      {t:'Read weekly technology newsfeeds related to your field.', a:true},
      {t:'Talk to experienced colleagues about new technologies.', a:true}
    ]},
  { id:139, type:'multi', choose:2,
    q:'Which are two types of legal claims that relate to unauthorized publication of personal and private information? (Choose 2)',
    options:[
      {k:'A', t:"Posting Evaluations of a Contractor's Performance", c:false},
      {k:'B', t:'Sharing an IP Address', c:false},
      {k:'C', t:'Browsing Habits collected by Cookies', c:false},
      {k:'D', t:'Publication of Private Facts', c:true},
      {k:'E', t:'Using the Name or Likeness of Another', c:true}
    ]},
  { id:140, type:'multi', choose:3,
    q:'Which three situations would compromise your privacy by allowing your email message to be available to an employer or school administration? (Choose 3)',
    options:[
      {k:'A', t:'Send the email from a smartphone using the work account.', c:true},
      {k:'B', t:'Send the email from a work computer using a personal account.', c:false},
      {k:'C', t:'Send the email from a work computer using the work account.', c:true},
      {k:'D', t:'Send the email from a work computer using the school account.', c:true},
      {k:'E', t:'Send the email from a school computer using the personal account.', c:false}
    ]},
  { id:141, type:'multi', choose:3,
    q:'Which three actions might compromise your online privacy? (Choose 3)',
    options:[
      {k:'A', t:'Staying logged into websites.', c:true},
      {k:'B', t:'Downloading files', c:false},
      {k:'C', t:'Posting in a forum', c:false},
      {k:'D', t:'Using the same login and password for multiple accounts', c:true},
      {k:'E', t:'Opening email attachments', c:false},
      {k:'F', t:'Allowing and keeping browser cookies', c:true}
    ]},
  { id:142, type:'multi', choose:2,
    q:'Which of the scenarios requires that you cite a reference? Select all that apply.',
    options:[
      {k:'A', t:'You copy a paragraph from a webpage', c:true},
      {k:'B', t:'You describe a current event you saw on the news', c:false},
      {k:'C', t:'You are writing an opinion', c:false},
      {k:'D', t:'You quote lyrics from a song', c:true}
    ]},
  { id:143, type:'multi', choose:2,
    q:'Which two are types of digital licensing that typically allow use for no cost? (Choose 2)',
    options:[
      {k:'A', t:'Per-user', c:false},
      {k:'B', t:'Public Domain', c:true},
      {k:'C', t:'Site', c:false},
      {k:'D', t:'Per-seat', c:false},
      {k:'E', t:'Creative Commons', c:true}
    ]},
  { id:144, type:'single',
    q:'Which software application would be appropriate for producing a webcast of a field trip?',
    options:[
      {k:'A', t:'Microsoft PowerPoint', c:false},
      {k:'B', t:'Google Chrome', c:false},
      {k:'C', t:'Zoom', c:true},
      {k:'D', t:'Adobe InDesign', c:false}
    ]},
  { id:145, type:'multi', choose:2,
    q:'Which two actions can you take to improve your communication skills? (Choose 2)',
    options:[
      {k:'A', t:'When talking with the client, speak in a positive, respectful tone.', c:true},
      {k:'B', t:'Text the client to apologize for your poor communication.', c:false},
      {k:'C', t:'When the client asks questions, summarize the question before you answer.', c:true},
      {k:'D', t:'Have another team member take over the communication at the next meeting.', c:false}
    ]}
);
