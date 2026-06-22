/* IC3 вЂ” 2-qism savollari (informatikaic3 worker saytidan olingan, 74 ta). */
window.IC3_QUESTIONS_2 = [
  { id:1, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'You are in a virtual meeting with some of your classmates while working on a project. Everyone is having a hard time deciding on the project goals and responsibilities for the team. Which two behaviors promote mutual understanding in this conversation? (Choose 2.)',
    options:[
      {k:'A', t:'Paraphrase the ideas you have heard so far.', c:true},
      {k:'B', t:'Ask open-ended questions for teammates to answer.', c:true},
      {k:'C', t:'Decide you should meet again at a later time.', c:false},
      {k:'D', t:'Email your teacher to ask for different teammates.', c:false}
    ]},
  { id:2, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about quotation marks in search queries, select True or False.',
    rows:[
      {t:'Quotation marks broaden search results.', a:false},
      {t:'Quotation marks ensure exact phrase matching.', a:true},
      {t:'Quotation marks reduce irrelevant results.', a:true}
    ]},
  { id:3, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of three statements about video editing, select True or False.',
    rows:[
      {t:'Increasing file size always improves quality.', a:false},
      {t:'Adding captions improves accessibility.', a:false},
      {t:'Removing background noise enhances audio clarity.', a:false}
    ]},
  { id:4, srcType:'Matching',
    type:'match',
    q:'Move each hardware resource from the list on the left to what it provides on the right.',
    pairs:[
      {l:'RAM size and speed', r:'Memory amount'},
      {l:'Wattage supplied to the computer', r:'Power needs'},
      {l:'How the GPU renders images', r:'Graphics power'},
      {l:'CPU speed and number of cores', r:'Processing speed'},
      {l:'Disk space and speed', r:'Storage type'}
    ]},
  { id:5, srcType:'MultipleChoiceText',
    type:'yn', srcSub:'statement-dropdown',
    q:'For each of the four statements about protecting someone else\'s personally identifiable information (PII), select Yes if the action protects PII or No if it does not.',
    rows:[
      {t:'Posting a friend\'s email address in a public forum', a:false},
      {t:'Sharing a coworker\'s phone number in a private message without asking', a:false}
    ]},
  { id:6, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about resolving issues collaboratively, select True or False.',
    rows:[
      {t:'Listening to all team members\' input helps identify the root cause.', a:true},
      {t:'Documenting agreed-upon solutions supports accountability.', a:true},
      {t:'Holding individuals accountable by identifying errors publicly improves collaboration.', a:false}
    ]},
  { id:7, srcType:'MultipleChoice',
    type:'single',
    q:'Your school requires multifactor login.Which login process fulfills this requirement?',
    options:[
      {k:'A', t:'A student logs in with a password. Then they type in a code from an app on their phone.', c:true},
      {k:'B', t:'A student logs in with a password. Then they answer security questions.', c:false},
      {k:'C', t:'A student uses a hard password with at least three types of letters, numbers, and symbols.', c:false},
      {k:'D', t:'A student logs in using their fingerprint on their school laptop.', c:false}
    ]},
  { id:8, srcType:'MultipleChoice',
    type:'single',
    q:'Which option is an example of workplace privacy best practice?',
    options:[
      {k:'A', t:'Encrypting files that contain customer data before sending them', c:true},
      {k:'B', t:'Sharing customer details in an unrelated team chat', c:false},
      {k:'C', t:'Using a coworker\'s login credentials to finish a task quickly', c:false},
      {k:'D', t:'Leaving printed documents with client information on your desk overnight', c:false}
    ]},
  { id:9, srcType:'Matching',
    type:'match',
    q:'Move each file format from the list on the left to its typical use on the right.',
    pairs:[
      {l:'High quality audio format', r:'WAV'},
      {l:'Compressed video format', r:'MP4'},
      {l:'Compressed image format that permanently loses some image quality', r:'JPEG'},
      {l:'Image format supporting transparency', r:'PNG'}
    ]},
  { id:10, srcType:'Matching',
    type:'match',
    q:'Match each communication tool to its best use.',
    pairs:[
      {l:'Task tracking', r:'Project management platform'},
      {l:'Face-to-face discussion', r:'Video call'},
      {l:'Real-time team updates', r:'Instant messaging'},
      {l:'Formal documentation', r:'Email'}
    ]},
  { id:11, srcType:'MultipleResponse',
    type:'multi', choose:3,
    q:'Complete the sentences by selecting the correct option from each drop-down list.Note: You will receive partial credit for each correct answer.',
    options:[
      {k:'A', t:'messaging', c:true},
      {k:'B', t:'collaboration', c:true},
      {k:'C', t:'integration', c:true},
      {k:'D', t:'encryption', c:false},
      {k:'E', t:'reporting', c:false}
    ]},
  { id:12, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'A client reports a confidentiality issue with a shared project file. Which two actions should you take first? (Choose 2.)',
    options:[
      {k:'A', t:'Temporarily restrict access to the file while you investigate.', c:true},
      {k:'B', t:'Review the client\'s concern and confirm the details.', c:true},
      {k:'C', t:'Forward the issue to the technical team without reviewing it.', c:false},
      {k:'D', t:'Create a duplicate file and continue work in the new version.', c:false}
    ]},
  { id:13, srcType:'Matching',
    type:'match',
    q:'Move each search strategy from the list on the left to its scenario on the right.',
    pairs:[
      {l:'Exclude irrelevant topics.', r:'Use NOT'},
      {l:'Narrow to a specific domain.', r:'Use site: operator'},
      {l:'Search for an exact phrase', r:'Use quotation marks'},
      {l:'Broaden results to include alternatives.', r:'Use OR'}
    ]},
  { id:14, srcType:'Matching',
    type:'match',
    q:'You received a new laptop as a gift and are selling your old device. You need to make sure the device is ready to be sold before giving it to the new owner.',
    pairs:[
      {l:'Unwanted access to accounts and personal data by new user', r:'Removing authentication credentials'},
      {l:'Unwanted device access using old fingerprints or face data', r:'Disabling biometric registration'},
      {l:'New user recovering your private files from storage', r:'Data wiping and secure deletion'},
      {l:'Losing important work or personal documents forever', r:'Backing up critical files before transfer'},
      {l:'Private files and passwords coming back to the device', r:'Clearing cloud account synchronization'}
    ]},
  { id:15, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about internal team communication, select True or False.',
    rows:[
      {t:'Confirming understanding increases conflict.', a:false},
      {t:'Discussing side topics enhances problem solving.', a:false},
      {t:'Documenting discussions allows for easier follow up on pending action items.', a:true}
    ]},
  { id:16, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about chart selection, select True or False.',
    rows:[
      {t:'A pie chart is best for showing parts of a whole.', a:true},
      {t:'A line chart is ideal for comparing categories at one point in time.', a:false},
      {t:'A bar chart is useful for comparing values across categories.', a:true}
    ]},
  { id:17, srcType:'MultipleChoiceText',
    type:'dropdown', srcSub:'statement-dropdown',
    q:'You are setting up a home office.For each of the four statements about a home office setup, select whether it is Ergonomic or Non-Ergonomic.',
    blanks:[
      {pre:'Monitor at eye level', opts:['Ergonomic','Non-Ergonomic'], ans:'Ergonomic', post:''},
      {pre:'A stool with adjustable seat positioning', opts:['Ergonomic','Non-Ergonomic'], ans:'Non-Ergonomic', post:''},
      {pre:'Screen tilted upward', opts:['Ergonomic','Non-Ergonomic'], ans:'Non-Ergonomic', post:''},
      {pre:'Keyboard positioned for neutral wrist alignment', opts:['Ergonomic','Non-Ergonomic'], ans:'Ergonomic', post:''}
    ]},
  { id:18, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two actions demonstrate responsible handling of someone else\'s account information? (Choose 2.)',
    options:[
      {k:'A', t:'Refusing to share someone\'s login credentials with others', c:true},
      {k:'B', t:'Logging out after using a shared computer', c:true},
      {k:'C', t:'Writing down a coworker\'s password for convenience', c:false}
    ]},
  { id:19, srcType:'Matching',
    type:'match',
    q:'Move each behavior from the list on the left to its scenario on the right.',
    pairs:[
      {l:'You adapt to a new project timeline without complaint.', r:'Flexibility'},
      {l:'You provide feedback that focuses on solutions.', r:'Constructive criticism'},
      {l:'You clarify unclear instructions before starting work.', r:'Proactive communication'},
      {l:'A teammate struggles with a task, and you offer help.', r:'Supportiveness'}
    ]},
  { id:20, srcType:'Matching',
    type:'match',
    q:'Move each troubleshooting action from the list on the left to its purpose on the right.Note: You will receive partial credit for each correct answer.',
    pairs:[
      {l:'Clear temporary files and reset hardware to fix short-term errors.', r:'Restart the device'},
      {l:'Record specific info about the problem to find patterns.', r:'Write down error messages'},
      {l:'Make sure the computer can communicate with the network and other devices.', r:'Check device connections'},
      {l:'Evaluate system records and events to find root causes and timing.', r:'Look at system logs'},
      {l:'Determine if recently installed apps are causing conflicts with system.', r:'Turn off new apps or services'}
    ]},
  { id:21, srcType:'MultipleChoice',
    type:'single',
    q:'Which characteristic most strongly suggests bias in a news article?',
    options:[
      {k:'A', t:'The article includes only one perspective and dismisses others.', c:true},
      {k:'B', t:'The article uses neutral language and factual evidence.', c:false},
      {k:'C', t:'The article presents multiple viewpoints on the issue.', c:false}
    ]},
  { id:22, srcType:'MultipleChoice',
    type:'single',
    q:'A project team is behind schedule on a project that is essential for meeting the company\'s yearly goals. How can you contribute constructively?',
    options:[
      {k:'A', t:'Offer to take on additional tasks or help prioritize work.', c:true},
      {k:'B', t:'Wait for the manager to assign new responsibilities.', c:false},
      {k:'C', t:'Suggest canceling the project to avoid failure.', c:false}
    ]},
  { id:23, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two behaviors promote understanding of issues during a virtual meeting? (Choose 2.)',
    options:[
      {k:'A', t:'Ask participants to clarify unclear statements.', c:true},
      {k:'B', t:'Take notes and confirm key points.', c:true},
      {k:'C', t:'Turn video off for all participants.', c:false},
      {k:'D', t:'Disable transcription.', c:false}
    ]},
  { id:24, srcType:'MultipleChoice',
    type:'single',
    q:'Which visual design practice makes a bar chart easier to read and interpret?',
    options:[
      {k:'A', t:'Using a legend or key', c:true},
      {k:'B', t:'Adding gradient backgrounds', c:false},
      {k:'C', t:'Eliminating all gridlines', c:false}
    ]},
  { id:25, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Complete the sentences by selecting the correct option from each drop-down list.Note: The UI implies filling in two blanks from the dropdown options based on the context of e-waste processing shown in the comments.',
    options:[
      {k:'A', t:'hazardous', c:true},
      {k:'B', t:'recovering', c:true},
      {k:'C', t:'incinerating', c:false},
      {k:'D', t:'reusable', c:false}
    ]},
  { id:26, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about assessing online information, select True or False.',
    rows:[
      {t:'Cross-checking facts with multiple sources improves accuracy.', a:true},
      {t:'A website with a professional design is guaranteed to be credible.', a:false},
      {t:'A site with a clear author and date is more likely to be reliable.', a:true}
    ]},
  { id:27, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two actions reflect best practices for digital citizenship? (Choose 2.)',
    options:[
      {k:'A', t:'Protecting your personal information and respecting others\' privacy', c:true},
      {k:'B', t:'Sharing unverified rumors to warn friends', c:false},
      {k:'C', t:'Citing sources when using someone else\'s work', c:true},
      {k:'D', t:'Using someone else\'s account without their permission', c:false}
    ]},
  { id:28, srcType:'MultipleResponse',
    type:'multi', choose:3,
    q:'You are gathering system information to help you fix a problem with your computer. Which three types of data would help most when troubleshooting technical issues? (Choose 3.)',
    options:[
      {k:'A', t:'Operating system version and available system updates', c:true},
      {k:'B', t:'Network adapter type and current connection state', c:true},
      {k:'C', t:'Hardware details, including processor, memory, and storage size', c:true},
      {k:'D', t:'List of all the files stored in the user downloads folder', c:false}
    ]},
  { id:29, srcType:'Matching',
    type:'match',
    q:'Match each scenario to the correct strategy.',
    pairs:[
      {l:'Your team is confused about the project schedule.', r:'Use clear deadlines.'},
      {l:'Your audience is unfamiliar with technical terms.', r:'Provide examples.'},
      {l:'You need to encourage participation in a discussion.', r:'Ask open-ended questions.'},
      {l:'You are communicating with a college admissions representative.', r:'Use formal tone.'}
    ]},
  { id:30, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about digital citizenship, select True or False.',
    rows:[
      {t:'Keeping your digital knowledge current is unnecessary once you learn basic online safety.', a:false},
      {t:'It is acceptable to share someone else\'s private information online if you believe you have a good reason.', a:false},
      {t:'Reporting illegal or harmful online activity to the appropriate authorities is a best practice for digital citizenship.', a:true}
    ]},
  { id:31, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two methods strengthen account security through multifactor authentication? (Choose 2.)',
    options:[
      {k:'A', t:'Using a password and a one-time code sent to a mobile device', c:true},
      {k:'B', t:'Using a password and a fingerprint scan', c:true},
      {k:'C', t:'Using two different passwords for the same account', c:false}
    ]},
  { id:32, srcType:'Matching',
    type:'match',
    q:'Match each tool to the scenario in which you would use it.',
    pairs:[
      {l:'You need to generate a schedule and coordinate tasks for a small team.', r:'Project management software'},
      {l:'You need to interview someone in a different location for a project.', r:'Video conferencing'},
      {l:'You need to collaborate with your classmates on a research paper.', r:'Shared document editor'},
      {l:'You are in a meeting and need to answer a question for a coworker who is in a different meeting.', r:'Instant messaging'}
    ]},
  { id:33, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about narrowing search results, select True or False.',
    rows:[
      {t:'Using quotation marks narrows results.', a:true},
      {t:'Using OR between keywords narrows results.', a:false},
      {t:'Adding more keywords narrows results.', a:true}
    ]},
  { id:34, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two features of cloud storage help prevent data loss when multiple users edit the same file? (Choose 2.)',
    options:[
      {k:'A', t:'Version history', c:true},
      {k:'B', t:'File sharing permissions', c:true},
      {k:'C', t:'File compression', c:false}
    ]},
  { id:35, srcType:'MultipleChoice',
    type:'single',
    q:'Your company has software version 4.7.2. An update to version 4.7.3 is now available. Which changes would you expect in this update?',
    options:[
      {k:'A', t:'Bug fixes and small improvements', c:true},
      {k:'B', t:'Complete rewrite of the software', c:false},
      {k:'C', t:'Big new features and new design', c:false}
    ]},
  { id:36, srcType:'MultipleResponse',
    type:'multi', choose:3,
    q:'Complete the sentences by selecting the correct option from each drop-down list.',
    options:[
      {k:'A', t:'major', c:true},
      {k:'B', t:'patch', c:true},
      {k:'C', t:'minor', c:true},
      {k:'D', t:'BETA', c:false}
    ]},
  { id:37, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two elements improve the effectiveness of a search query? (Choose 2.)',
    options:[
      {k:'A', t:'Including words like AND and OR', c:true},
      {k:'B', t:'Adding quotation marks around phrases', c:true},
      {k:'C', t:'Adding extra punctuation for emphasis', c:false}
    ]},
  { id:38, srcType:'MultipleChoiceText',
    type:'yn', srcSub:'statement-dropdown',
    q:'For each of the four statements about maintaining someone else\'s privacy online, select Yes if the action maintains privacy or No if it does not.',
    rows:[
      {t:'Sharing your location and tagging the friends you are with', a:false},
      {t:'Posting your friend\'s address for an online party invitation', a:false},
      {t:'Asking friends before tagging them in a photo', a:true},
      {t:'Sharing a friend\'s birthday publicly without asking', a:false}
    ]},
  { id:39, srcType:'MultipleChoice',
    type:'single',
    q:'You are trying to share a video on a social networking platform. You receive an error that the file is too large. Which action ensures that your video file can be shared quickly without losing quality?',
    options:[
      {k:'A', t:'Converting the file to a compressed format.', c:true},
      {k:'B', t:'Converting the file to an encrypted format.', c:false},
      {k:'C', t:'Changing the file extension to a smaller format.', c:false}
    ]},
  { id:40, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'You are working on a shared document and notice conflicting edits from a teammate. Which two actions should you take to resolve the issue? (Choose 2.)',
    options:[
      {k:'A', t:'Contact the teammate to understand their changes before finalizing', c:true},
      {k:'B', t:'Add a comment explaining your changes and request feedback.', c:true},
      {k:'C', t:'Create a separate copy of the document and continue working alone.', c:false}
    ]},
  { id:41, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about managing interpersonal digital communication, select True or False.',
    rows:[
      {t:'Using clear subject lines improves message clarity.', a:true},
      {t:'Adjusting tone based on audience is important.', a:true},
      {t:'Responding with one-word answers promotes engagement.', a:false}
    ]},
  { id:42, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about secure computing, select True or False.',
    rows:[
      {t:'Using a password plus multi-factor authentication is safer than using a hard password with special symbols.', a:true},
      {t:'Using many antivirus programs on one device is recommended because one program might catch threats another program misses.', a:false},
      {t:'A factory reset is the safest way to protect your private data before giving your phone to someone else.', a:false}
    ]},
  { id:43, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two features help screen reader users understand page content? (Choose 2.)',
    options:[
      {k:'A', t:'Using alt text for images', c:true},
      {k:'B', t:'Creating a clear heading structure', c:true},
      {k:'C', t:'Adding decorative images', c:false}
    ]},
  { id:44, srcType:'Matching',
    type:'match',
    q:'Move each versioning term from the list on the left to its description on the right.',
    pairs:[
      {l:'Fixes bugs and security problems', r:'Patch version'},
      {l:'Adds new features but still works with old files', r:'Minor version'},
      {l:'Test version before the final release', r:'Release candidate'},
      {l:'Big changes that may not work with old files or adds major features', r:'Major version'}
    ]},
  { id:45, srcType:'MultipleChoice',
    type:'single',
    q:'What is the most appropriate action if you accidentally receive an email containing someone else\'s personal information?',
    options:[
      {k:'A', t:'Notify the sender and follow your organization\'s privacy policy.', c:true},
      {k:'B', t:'Post about the mistake on social media to raise awareness.', c:false},
      {k:'C', t:'Reply to the sender to explain that they shouldn\'t send personal information.', c:false}
    ]},
  { id:46, srcType:'MultipleChoice',
    type:'single',
    q:'You are a high school student who has been spending long hours on a laptop completing assignments and playing games. Recently, you started experiencing wrist pain and shoulder discomfort. Which action is the most effective way to reduce the physical risks associated with this situation?',
    options:[
      {k:'A', t:'Use an external keyboard and mouse with an adjustable chair and desk', c:true},
      {k:'B', t:'Use noise-canceling headphones to improve focus and reduce fatigue.', c:false},
      {k:'C', t:'Вариант 3', c:false}
    ]},
  { id:47, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two practices are appropriate when interacting with external clients to understand issues? (Choose 2.)',
    options:[
      {k:'A', t:'Ask open-ended questions to gather information.', c:true},
      {k:'B', t:'Use clear and professional language.', c:true},
      {k:'C', t:'Share confidential internal details to build trust', c:false}
    ]},
  { id:48, srcType:'Matching',
    type:'match',
    q:'Move each evaluation step from the list on the left to its goal on the right.',
    pairs:[
      {l:'Determine the type of organization associated with the site', r:'Review the site\'s domain (e.g., .gov, .edu, .org)'},
      {l:'Confirm expertise of the source', r:'Check author credentials'},
      {l:'Ensure the information is current', r:'Verify publication date'},
      {l:'Validate accuracy through cross-checking', r:'Compare with other sources'}
    ]},
  { id:49, srcType:'Matching',
    type:'match',
    q:'Match each Principle to its correct description.',
    pairs:[
      {l:'Each person contributes their expertise to a project with a tight deadline', r:'Collaboration'},
      {l:'You meet deadlines for your assigned tasks.', r:'Accountability'},
      {l:'You listen without interrupting when teammates are sharing ideas.', r:'Respectful communication'}
    ]},
  { id:50, srcType:'MultipleChoice',
    type:'single',
    q:'Which action demonstrates responsible digital citizenship?',
    options:[
      {k:'A', t:'Reporting harmful online behavior to the appropriate authority', c:true},
      {k:'B', t:'Posting personal details of others without consent', c:false},
      {k:'C', t:'Ignoring suspicious online activity to avoid involvement', c:false}
    ]},
  { id:51, srcType:'Sequence',
    type:'order',
    q:'Move each compatibility check step from the list on the left to its step in order on the right.',
    items:[
      'Check key system specs against what the software needs at a minimum',
      'Find hardware parts that slow down performance',
      'Decide which devices must be upgraded and which can stay',
      'Estimate the budget and make a plan for upgrades over time'
    ]},
  { id:52, srcType:'MultipleChoice',
    type:'single',
    q:'Which factor indicates that an online article is credible?',
    options:[
      {k:'A', t:'The article has a recent publication date and cites reputable sources.', c:true},
      {k:'B', t:'The article includes multiple advertisements and pop-ups.', c:false},
      {k:'C', t:'The article appears on a popular social media platform.', c:false}
    ]},
  { id:53, srcType:'MultipleChoice',
    type:'single',
    q:'You are working on a project with a tight deadline, and one member of the team is proposing that you change the review process to include more stakeholders. The proposed idea will be time consuming and not the best use of the time you have on the project. Which option is an example of constructive feedback you can give to the team member?',
    options:[
      {k:'A', t:'I like your ideas, but I worry they\'ll push us past our schedule. Can we choose one or two key stakeholders instead?', c:true},
      {k:'B', t:'Your idea won\'t work; half of the stakeholders won\'t respond. I have worked with them before and I know them.', c:false},
      {k:'C', t:'We don\'t have time for new ideas right now. This project is already close to failing.', c:false}
    ]},
  { id:54, srcType:'Matching',
    type:'match',
    q:'Move each accessibility principle from the list on the left to its example on the right.',
    pairs:[
      {l:'Images have alt text', r:'Perceivable'},
      {l:'Keyboard navigation is available', r:'Operable'},
      {l:'Content works with assistive technology', r:'Robust'},
      {l:'Clear and simple language is used', r:'Understandable'}
    ]},
  { id:55, srcType:'MultipleChoice',
    type:'single',
    q:'Which legal term refers to the protection of original works such as books, music, and software from unlimited use?',
    options:[
      {k:'A', t:'Copyright', c:true},
      {k:'B', t:'Patent', c:false},
      {k:'C', t:'Trademark', c:false}
    ]},
  { id:56, srcType:'MultipleResponse',
    type:'multi', choose:4,
    q:'Complete the sentences by selecting the correct option from each drop-down list. Based on the visible options and the grading feedback note in the image, here are the correct hardware components for the scenario (likely related to running engineering or high-performance software):',
    options:[
      {k:'A', t:'GPU', c:true},
      {k:'B', t:'monitor', c:true},
      {k:'C', t:'RAM', c:true},
      {k:'D', t:'CPU', c:true},
      {k:'E', t:'case', c:false}
    ]},
  { id:57, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about digital citizenship, select True or False.',
    rows:[
      {t:'Using strong passwords is part of maintaining good digital citizenship.', a:true},
      {t:'Ignoring harmful online behavior is considered responsible digital citizenship.', a:false},
      {t:'Digital citizenship includes respecting others\' rights and privacy online.', a:true}
    ]},
  { id:58, srcType:'Matching',
    type:'match',
    q:'Move each protection method from the list on the left to its purpose on the right.',
    pairs:[
      {l:'Deters unauthorized image use.', r:'Watermark'},
      {l:'Protects confidential business information.', r:'Non-disclosure agreement (NDA)'},
      {l:'Secures digital files from unauthorized access.', r:'Encryption'},
      {l:'Asserts ownership of creative work.', r:'Copyright notice'}
    ]},
  { id:59, srcType:'Matching',
    type:'match',
    q:'You are troubleshooting a computer issue. Move each specification from the list on the left to the problem it helps diagnose on the right.',
    pairs:[
      {l:'Does the device have enough resources to run apps smoothly?', r:'Processor and RAM details'},
      {l:'Is slow performance being caused by not enough disk space?', r:'Storage size and free space'},
      {l:'Do software needs match the installed system version?', r:'Operating system version and updates'},
      {l:'Are there internet connection problems and slow data speeds?', r:'Network adapter and connection type'}
    ]},
  { id:60, srcType:'MultipleChoice',
    type:'single',
    q:'A worker needs to make sure that the same web browser always opens HTML files and web links. What is the best way to do this?',
    options:[
      {k:'A', t:'Go to system settings to set default programs.', c:true},
      {k:'B', t:'Make desktop shortcuts for each HTML file.', c:false},
      {k:'C', t:'Pick the browser each time a link opens.', c:false}
    ]},
  { id:61, srcType:'MultipleChoice',
    type:'single',
    q:'Which activity is part of refining a prototype in a cyclical design process?',
    options:[
      {k:'A', t:'Adjusting design based on user feedback', c:true},
      {k:'B', t:'Setting the project budget', c:false},
      {k:'C', t:'Gathering initial requirements', c:false}
    ]},
  { id:62, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two actions occur during the initial phase of a cyclical design process? (Choose 2.)',
    options:[
      {k:'A', t:'Identifying requirements', c:true},
      {k:'B', t:'Considering design constraints', c:true},
      {k:'C', t:'Testing prototypes with users', c:false}
    ]},
  { id:63, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two actions occur during the initial phase of a cyclical design process? (Choose 2.)',
    options:[
      {k:'A', t:'Identifying requirements', c:true},
      {k:'B', t:'Considering design constraints', c:true},
      {k:'C', t:'Testing prototypes with users', c:false},
      {k:'D', t:'Creating a prototype', c:false}
    ]},
  { id:64, srcType:'MultipleChoiceText',
    type:'dropdown', srcSub:'statement-dropdown',
    q:'For each of the three statements about accessibility, select whether it is Accurate or Inaccurate.',
    blanks:[
      {pre:'Captions improve accessibility for visual impairments..', opts:['Inaccurate','Accurate'], ans:'Inaccurate', post:''},
      {pre:'High-contrast colors improve readability.', opts:['Inaccurate','Accurate'], ans:'Accurate', post:''},
      {pre:'Alt text helps users with visual impairments.', opts:['Inaccurate','Accurate'], ans:'Accurate', post:''}
    ]},
  { id:65, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Complete the sentences by selecting the correct option from each drop-down list.',
    options:[
      {k:'A', t:'file menus', c:true},
      {k:'B', t:'search', c:true},
      {k:'C', t:'themes', c:false},
      {k:'D', t:'taskbar', c:false}
    ]},
  { id:66, srcType:'MultipleChoiceText',
    type:'dropdown', srcSub:'statement-dropdown',
    q:'For each of the three statements about flowcharts, select whether it is Accurate or Inaccurate.',
    blanks:[
      {pre:'Arrows indicate the sequence of steps in flowcharts.', opts:['Accurate','Inaccurate'], ans:'Accurate', post:''},
      {pre:'Flowcharts are most efficient for visually representing complex data.', opts:['Accurate','Inaccurate'], ans:'Inaccurate', post:''},
      {pre:'Intentionally chosen shapes can improve readability.', opts:['Accurate','Inaccurate'], ans:'Accurate', post:''}
    ]},
  { id:67, srcType:'MultipleChoice',
    type:'single',
    q:'Which visualization is used for illustrating the sequence of steps in a process?',
    options:[
      {k:'A', t:'Flowchart', c:true},
      {k:'B', t:'Histogram', c:false},
      {k:'C', t:'Column chart', c:false}
    ]},
  { id:68, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about cloud versioning, select True or False.',
    rows:[
      {t:'Version history allows restoring previous file content.', a:true},
      {t:'Version history is useful for collaborative editing.', a:true},
      {t:'Version history prevents any accidental deletions.', a:false}
    ]},
  { id:69, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two practices help maintain version control in cloud storage? (Choose 2.)',
    options:[
      {k:'A', t:'Enabling automatic version history', c:true},
      {k:'B', t:'Using real-time collaboration tools', c:true},
      {k:'C', t:'Renaming files with each edit', c:false}
    ]},
  { id:70, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about accessibility best practices, select True or False.',
    rows:[
      {t:'Using bold text for section titles provides the same navigation benefits as using headings.', a:false},
      {t:'Alt text for images helps screen readers describe visual content.', a:true},
      {t:'Marking every image as decorative improves accessibility.', a:false}
    ]},
  { id:71, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two actions make digital documents more accessible? (Choose 2.)',
    options:[
      {k:'A', t:'Including descriptive hyperlinks', c:true},
      {k:'B', t:'Adding captions to videos.', c:true},
      {k:'C', t:'Inserting images without alternative text.', c:false}
    ]},
  { id:72, srcType:'Matching',
    type:'match',
    q:'Move each term from the list on the left to the protection it provides on the right.',
    pairs:[
      {l:'Protects inventions and processes.', r:'Patent'},
      {l:'Protects brand names and logos.', r:'Trademark'},
      {l:'Protects original creative works.', r:'Copyright'},
      {l:'Allows limited applications under certain conditions.', r:'Fair use'}
    ]},
  { id:73, srcType:'MultipleChoiceText',
    type:'tf', srcSub:'statement-dropdown',
    q:'For each of the three statements about copyright, select True or False.',
    rows:[
      {t:'Copyright protection lasts for only one year after creation.', a:false},
      {t:'Copyright applies only if the work is registered with a government office.', a:false},
      {t:'Copyright protects original creative works such as text, music, and images.', a:true}
    ]},
  { id:74, srcType:'MultipleResponse',
    type:'multi', choose:2,
    q:'Which two activities are part of prototype refinement? (Choose 2.)',
    options:[
      {k:'A', t:'Collecting user feedback', c:true},
      {k:'B', t:'Adjusting design based on testing', c:true},
      {k:'C', t:'Finalizing product for release', c:false}
    ]}
];
