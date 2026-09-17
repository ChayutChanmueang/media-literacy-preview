# [Requirements Specification]()  
## [Media Literacy 2D Top-Down Game for Older Adults]()  
**Document Status:** Initial Draft  
 **Target Platform:** Web Application / Progressive Web App  
 **Main Technology:** Next.js, TypeScript, Phaser  
 **Target Users:** Older adults and general users who need media literacy training  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [1. Project Overview]()  
The project is a web-based 2D top-down game designed to help older adults develop awareness and decision-making skills related to online scams and misleading digital media.  
The existing system already contains several minigames covering the following topics:  
- Money-stealing or malicious applications  
- Fake links and phishing websites  
- Fake or manipulated images  
- Fake SMS messages  
- Suspicious or unknown phone numbers  
- Scam-related communication and online threats  
Currently, the minigames are presented separately and may feel similar to exercises or tests. The new top-down game will act as a larger game world that connects these minigames through characters, stories, missions, and everyday situations.  
The player will explore a virtual community, interact with non-player characters, encounter digital risks, and enter the appropriate minigame when a suspicious situation occurs.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [2. Project Goals]()  
The system shall:  
1. Transform the existing standalone minigames into meaningful situations within a larger game world.  
2. Reduce the feeling that the player is completing a quiz or examination.  
3. Present media literacy concepts through everyday activities and relatable situations.  
4. Allow players to observe the consequences of their decisions.  
5. Support older adults through accessible controls, readable interfaces, and clear feedback.  
6. Run through a web browser on both mobile devices and personal computers.  
7. Support portrait-oriented mobile screens and landscape-oriented desktop screens.  
8. Preserve and reuse the existing Next.js minigames whenever possible.  
9. Collect gameplay results for research and learning evaluation.  
10. Provide an expandable structure for adding new stories, scenarios, and minigames.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [3. Scope]()  
## [3.1 In Scope]()  
The initial version shall include:  
- A 2D top-down explorable game world  
- A controllable player character  
- Non-player characters  
- Buildings and interactive locations  
- Dialogue interactions  
- Mission and objective systems  
- Scenario and incident triggers  
- Integration with the existing minigames  
- Player progress and game state  
- Basic reward and consequence systems  
- Responsive interfaces for mobile and desktop  
- Accessibility options for older adults  
- Gameplay data recording  
- Save and resume functionality  
## [3.2 Out of Scope for the Initial Version]()  
The following features are not required for the first playable version:  
- Online multiplayer  
- Real-time communication between players  
- Large open-world environments  
- Procedurally generated maps  
- Advanced combat systems  
- Complex character customization  
- Voice recognition  
- Competitive ranking between players  
- User-generated content  
- Three-dimensional graphics  
These features may be considered in later versions if they support the research objectives.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [4. Target Users]()  
## [4.1 Primary Users]()  
The primary users are older adults who may have limited experience with digital technology or online safety.  
Users may have:  
- Limited familiarity with smartphones or web applications  
- Reduced vision  
- Reduced hearing  
- Reduced fine motor control  
- Slower reaction times  
- Difficulty reading small text  
- Difficulty remembering complex instructions  
- Limited confidence when making digital decisions  
## [4.2 Secondary Users]()  
Secondary users may include:  
- Family members  
- Caregivers  
- Teachers or trainers  
- Researchers  
- Healthcare professionals  
- Media literacy facilitators  
- System administrators  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [5. Target Platforms]()  
The game shall support the following platforms:  
## [5.1 Mobile Devices]()  
- Android smartphones  
- Android tablets  
- Mobile web browsers  
- Progressive Web App installation where supported  
- Portrait orientation as the primary mobile layout  
- Landscape orientation as an optional supported layout  
## [5.2 Personal Computers]()  
- Desktop and laptop computers  
- Keyboard and mouse input  
- Landscape-oriented displays  
- Modern web browsers  
## [5.3 Browser Support]()  
The system should support current versions of:  
- Google Chrome  
- Microsoft Edge  
- Mozilla Firefox  
- Safari where technically possible  
The system shall display an understandable warning when the browser does not support required features.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [6. Proposed System Architecture]()  
The system shall use a hybrid architecture.  
## [6.1 Next.js Responsibilities]()  
Next.js and React shall manage:  
- Authentication  
- User profiles  
- Main application navigation  
- Dashboard  
- Game selection  
- Learning progress  
- Pre-game and post-game assessments  
- Settings  
- Accessibility interfaces  
- Supabase or backend communication  
- Existing React-based minigames  
- Dialogues or interfaces that require large amounts of text  
- Reports and gameplay summaries  
## [6.2 Phaser Responsibilities]()  
Phaser shall manage:  
- The 2D top-down game world  
- Player movement  
- Character animations  
- NPC movement  
- Map rendering  
- Camera movement  
- Collision detection  
- Interaction zones  
- Environmental animation  
- World-level game events  
- Real-time gameplay input  
## [6.3 Communication Between Next.js and Phaser]()  
Next.js and Phaser shall communicate through a typed event or message system.  
The communication system shall support events such as:  
- Game world initialized  
- Player interacted with an object  
- Player started a conversation  
- Incident started  
- Minigame requested  
- Minigame completed  
- Minigame failed  
- Player score changed  
- Player progress changed  
- Mission completed  
- Game requested to save  
- Game requested to pause or resume  
Phaser shall not update React state continuously during every game frame.  
Only meaningful gameplay events shall be sent between Phaser and React.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [7. Core Game Concept]()  
The player shall control a character living or spending time in a virtual community.  
The player may perform activities such as:  
- Walking around the community  
- Visiting a home  
- Visiting a market  
- Visiting a bank  
- Visiting a community center  
- Visiting a hospital or clinic  
- Talking to family members  
- Talking to friends or neighbors  
- Receiving phone calls  
- Receiving SMS messages  
- Reading online messages  
- Receiving social media content  
- Using applications  
- Helping other characters solve digital problems  
During these activities, the player shall encounter situations that may contain digital risks.  
When a situation requires closer examination, the game shall launch the related minigame.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [8. Core Gameplay Loop]()  
The core gameplay loop shall follow this general structure:  
1. The player enters the game world.  
2. The player receives a goal, task, or story objective.  
3. The player explores the environment.  
4. The player interacts with an NPC, device, or location.  
5. A media literacy incident occurs.  
6. The player receives enough context to understand the situation.  
7. The appropriate minigame is launched.  
8. The player investigates or responds to the incident.  
9. The minigame returns a result to the main game.  
10. The world changes according to the result.  
11. The player receives feedback.  
12. The story or mission continues.  
13. Progress is saved.  
The game shall avoid repeatedly presenting minigames without narrative or situational context.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [9. Game World Requirements]()  
## [9.1 World Structure]()  
The game shall contain one or more 2D top-down maps.  
The map may be structured as:  
- One connected community  
- Several smaller locations connected through transitions  
- A central hub with separate buildings  
- Story chapters with different locations  
The first prototype should use a small map to reduce loading time and development complexity.  
## [9.2 World Locations]()  
Possible locations include:  
- Player’s home  
- Neighbor’s home  
- Community market  
- Bank  
- Convenience store  
- Clinic or hospital  
- Police station  
- Community center  
- Bus stop  
- Public park  
- Mobile phone shop  
The final location list shall be decided during game concept discussion.  
## [9.3 Interactive Objects]()  
The player shall be able to interact with relevant objects such as:  
- Smartphones  
- Computers  
- Televisions  
- Mailboxes  
- Posters  
- QR codes  
- Bank machines  
- Store counters  
- Notice boards  
- Delivery packages  
- Documents  
Interactive objects shall provide clear visual feedback when the player is close enough to use them.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [10. Player Character Requirements]()  
The player shall be able to:  
- Move in at least four directions  
- Stop and face interactive objects  
- Talk to NPCs  
- Enter selected buildings or locations  
- Examine objects  
- Open the in-game phone interface  
- View current missions  
- Pause the game  
- Access settings  
- Resume previous progress  
The movement speed shall be comfortable for older adults and shall not require fast reactions.  
The game should provide an optional automatic movement or simplified navigation mode if user testing identifies movement as a barrier.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [11. Control Requirements]()  
## [11.1 Desktop Controls]()  
The desktop version shall support:  
- Arrow keys or WASD for movement  
- Mouse for interface interaction  
- A keyboard key for interaction  
- Escape or an on-screen button for pause  
- Optional mouse-only navigation if implemented later  
## [11.2 Mobile Controls]()  
The mobile version shall support:  
- Virtual joystick or directional controls  
- Large interaction buttons  
- Touch-based interface controls  
- Buttons positioned away from browser navigation areas  
- Controls usable in portrait orientation  
Touch targets shall be sufficiently large and spaced apart to reduce accidental input.  
## [11.3 Input Switching]()  
The system should detect the available input method and display appropriate controls.  
For example:  
- Hide the virtual joystick when using keyboard input  
- Show touch controls on mobile devices  
- Allow input mode changes without restarting the game  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [12. Responsive Display Requirements]()  
The game shall support multiple screen sizes without creating separate game worlds.  
## [12.1 Mobile Portrait Layout]()  
The mobile portrait layout shall:  
- Keep the player and important objects visible  
- Display touch controls near the lower section of the screen  
- Preserve readable text sizes  
- Avoid placing critical buttons near browser gesture areas  
- Use vertically arranged menus  
- Display minigames using a mobile-friendly layout  
## [12.2 Desktop Landscape Layout]()  
The desktop landscape layout shall:  
- Display a wider view of the game world  
- Support keyboard and mouse controls  
- Place mission information and status panels at the screen edges  
- Use horizontal space without stretching text excessively  
## [12.3 Responsive Behaviour]()  
The system shall:  
- Detect changes in viewport size  
- Rearrange user interface components  
- Maintain a minimum readable font size  
- Maintain a minimum touch target size  
- Prevent interface elements from overlapping  
- Consider mobile safe areas  
- Support dynamic browser bars using appropriate viewport units  
- Avoid scaling the entire interface to an unreadably small size  
The game world camera may show different visible areas depending on the screen aspect ratio.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [13. NPC Requirements]()  
NPCs shall be used to:  
- Introduce missions  
- Provide story context  
- Present realistic scam situations  
- Ask the player for help  
- React to the player’s decisions  
- Explain consequences  
- Reinforce learning points  
- Make the virtual community feel active  
NPCs may represent:  
- Family members  
- Friends  
- Neighbors  
- Bank employees  
- Delivery workers  
- Police officers  
- Healthcare staff  
- Shop owners  
- Unknown callers  
- Online contacts  
- Fraudsters pretending to be trusted persons  
Each important NPC should have:  
- A name  
- A role  
- A visual appearance  
- A relationship to the player  
- Dialogue  
- At least one gameplay purpose  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [14. Dialogue Requirements]()  
The dialogue system shall support:  
- Thai language  
- Large and readable text  
- Multiple lines of dialogue  
- Dialogue choices  
- NPC portraits or identifiers  
- Optional replay of recent dialogue  
- Confirmation before important decisions  
- Highlighting important terms  
- Optional text-to-speech support in future versions  
Dialogue shall use simple and understandable language.  
The system should avoid long unbroken paragraphs.  
Critical information shall not be communicated only through audio.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [15. Incident System Requirements]()  
The incident system shall control when and how media literacy situations occur.  
Each incident shall contain:  
- Incident identifier  
- Incident category  
- Related learning objective  
- Starting condition  
- Involved NPC or object  
- Context description  
- Required minigame  
- Difficulty level  
- Success result  
- Failure result  
- Feedback content  
- Reward or consequence  
- Completion status  
Incident categories shall initially include:  
- Fake SMS  
- Fake links  
- Suspicious websites  
- Fake images  
- Unknown phone numbers  
- Scam calls  
- Malicious applications  
- Money-stealing applications  
The system shall allow new incident types to be added later.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [16. Minigame Integration Requirements]()  
## [16.1 Existing Minigames]()  
Existing Next.js or React-based minigames shall be reused whenever practical.  
They may be displayed as:  
- Full-screen overlays  
- Modal overlays  
- Simulated smartphone screens  
- Separate game panels  
- Embedded application interfaces  
## [16.2 Minigame Launch]()  
When a minigame begins, the system shall:  
1. Pause or disable interaction with the top-down world.  
2. Store the current world state.  
3. Display the selected minigame.  
4. Provide the minigame with incident data.  
5. Prevent duplicate minigame instances.  
6. Record the starting time.  
## [16.3 Minigame Result]()  
Each minigame shall return a standardized result containing at least:  
- Incident identifier  
- Minigame identifier  
- Completion status  
- Success or failure  
- Score  
- Number of mistakes  
- Time spent  
- Selected answers or actions where appropriate  
- Hint usage  
- Retry count  
## [16.4 Returning to the World]()  
After a minigame is completed, the system shall:  
- Close the minigame interface  
- Return the player to the previous world position  
- Apply the result to the story or game state  
- Display feedback  
- Resume the world  
- Save progress  
The player shall not lose world progress because a minigame was opened.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [17. Mission and Quest Requirements]()  
The game shall provide missions that connect exploration, dialogue, and minigames.  
Each mission shall include:  
- Mission identifier  
- Title  
- Description  
- Learning objective  
- Starting condition  
- Required tasks  
- Related locations  
- Related NPCs  
- Related incidents  
- Completion condition  
- Reward  
- Failure or alternative outcome  
- Mission status  
Mission statuses may include:  
- Locked  
- Available  
- Active  
- Completed  
- Failed  
- Partially completed  
The system should support both:  
- Main story missions  
- Optional side missions  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [18. Player State Requirements]()  
The game shall maintain a player state containing:  
- Current location  
- Player position  
- Current mission  
- Completed missions  
- Completed incidents  
- Minigame results  
- Collected rewards  
- Learning progress  
- Accessibility preferences  
- Game settings  
- Save timestamp  
Possible game statistics may include:  
- Media literacy awareness  
- Community safety  
- Trust from NPCs  
- Money protected  
- People helped  
- Number of risks detected  
- Number of risky decisions  
- Number of hints used  
The final statistics shall be selected based on gameplay and research needs.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [19. Consequence Requirements]()  
The player’s choices shall produce visible consequences.  
Positive consequences may include:  
- Preventing financial loss  
- Helping an NPC avoid a scam  
- Increasing community safety  
- Unlocking new information  
- Increasing trust  
- Receiving appreciation from NPCs  
- Unlocking a new mission  
Negative or incorrect decisions may result in:  
- Simulated financial loss  
- Increased risk  
- An NPC becoming worried  
- Additional recovery tasks  
- Corrective feedback  
- A chance to retry  
- A different story outcome  
Negative consequences shall be educational rather than punitive.  
The game shall not shame players for incorrect answers.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [20. Feedback Requirements]()  
Feedback shall be provided after meaningful decisions.  
The feedback shall:  
- Explain why the action was safe or unsafe  
- Identify warning signs  
- Explain what the player should do in real life  
- Use simple language  
- Avoid technical jargon where unnecessary  
- Allow the player enough time to read  
- Provide a replay option where practical  
Feedback may be delivered through:  
- NPC dialogue  
- In-game notifications  
- A short summary panel  
- Community status changes  
- A personal learning journal  
- A mission completion report  
The game should explain the reasoning behind the correct response rather than showing only “correct” or “incorrect.”  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [21. Difficulty Requirements]()  
The game should support adjustable difficulty.  
Difficulty may affect:  
- Number of warning signs  
- Clarity of suspicious information  
- Amount of guidance  
- Number of response options  
- Time pressure  
- Similarity between legitimate and fraudulent content  
- Availability of hints  
- Complexity of scenarios  
The initial version should avoid strict time limits unless required by a specific learning objective.  
The system may adapt difficulty based on player performance in a later version.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [22. Hint System Requirements]()  
The system shall provide optional hints.  
Hints may include:  
- Highlighting suspicious parts of a message  
- Suggesting where to look  
- Reminding the player not to rush  
- Recommending verification through official channels  
- Explaining common scam patterns  
Hint usage shall be recorded.  
Hints shall not automatically complete the minigame.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [23. Accessibility Requirements]()  
The game shall be designed with older adults as a primary audience.  
The system shall support:  
- Adjustable text size  
- High-contrast interface option  
- Clear fonts  
- Large buttons  
- Clear icon labels  
- Reduced motion option  
- Adjustable audio volume  
- Separate controls for music and sound effects  
- Subtitles or text for spoken content  
- Adequate response time  
- No essential information communicated only through color  
- Confirmation before risky actions  
- Simple navigation  
- Consistent button placement  
- Clear back and close controls  
The game should avoid:  
- Rapid flashing  
- Small text  
- Low-contrast text  
- Hidden gestures  
- Fast reaction requirements  
- Complex multi-touch controls  
- Excessive interface movement  
- Sudden loud sounds  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [24. Audio Requirements]()  
The game may include:  
- Background music  
- Environmental sounds  
- Interface feedback sounds  
- NPC voice lines  
- Notification sounds  
- Warning sounds  
The system shall provide:  
- Master volume control  
- Music volume control  
- Sound effect volume control  
- Mute option  
Audio shall support the experience but shall not be required to understand critical information.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [25. Save and Resume Requirements]()  
The game shall support automatic progress saving.  
The game shall save when:  
- A mission begins  
- A mission is completed  
- A minigame is completed  
- The player enters a new location  
- Important player state changes  
- The player exits the game page  
The save data shall include enough information to restore:  
- Player location  
- Player position  
- Mission status  
- Incident status  
- Minigame results  
- Player statistics  
- Settings  
The system should support both local save data and server-based save data for authenticated users.  
The system shall prevent duplicate or conflicting progress records where possible.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [26. Research Data Requirements]()  
Subject to informed consent and research ethics approval, the system may record:  
- Session start and end times  
- Time spent in the game  
- Time spent in each mission  
- Time spent in each minigame  
- Player decisions  
- Correct and incorrect responses  
- Number of retries  
- Number of hints used  
- Navigation patterns  
- Mission completion  
- Minigame completion  
- Device type  
- Screen orientation  
- Browser type  
- Performance problems  
- Game exits or interruptions  
Research data shall not include unnecessary personal information.  
The system shall separate personally identifiable information from gameplay logs where possible.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [27. Performance Requirements]()  
The game shall be optimized for low-end mobile devices.  
The system should:  
- Load only required assets  
- Avoid loading every minigame at startup  
- Use compressed image and audio formats  
- Use appropriately sized textures  
- Unload unused scenes and assets  
- Avoid unnecessary React re-rendering  
- Avoid synchronizing player position with React every frame  
- Limit simultaneous animations and effects  
- Support fallback rendering where practical  
- Handle low memory conditions gracefully  
The first playable scene should load without requiring the complete game asset collection.  
The system should display a loading indicator during asset loading.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [28. Network Requirements]()  
The game should remain playable during temporary network interruptions after required assets have loaded.  
The system shall:  
- Detect failed API requests  
- Retry safe operations where appropriate  
- Avoid losing completed minigame results  
- Queue progress updates when possible  
- Inform the player when progress has not yet synchronized  
- Avoid blocking the entire game because of a non-critical network request  
Offline support may be progressively added through PWA caching.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [29. Security Requirements]()  
The system shall:  
- Validate gameplay data received by backend APIs  
- Avoid trusting client-side scores for critical research results without verification  
- Protect authentication sessions  
- Avoid exposing secret keys in client-side code  
- Use HTTPS in production  
- Sanitize user-generated or remotely loaded content  
- Restrict unsupported file uploads  
- Record application errors without exposing sensitive user data  
Simulated phishing links and fake websites shall remain inside the controlled game environment.  
The game shall not direct players to real malicious domains.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [30. Error Handling Requirements]()  
The system shall handle errors such as:  
- Phaser initialization failure  
- WebGL or Canvas failure  
- Minigame loading failure  
- Asset loading failure  
- Save failure  
- Backend connection failure  
- Unsupported browser  
- Unexpected screen resizing  
- Game component unmounting  
- Duplicate event listeners  
Error messages shall use simple language and provide a recovery action where possible.  
Examples include:  
- Retry loading  
- Return to the main menu  
- Reload the game  
- Continue using local progress  
- Contact the facilitator  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [31. Content Management Requirements]()  
Game content should be data-driven where practical.  
Content that should be configurable without changing core game logic includes:  
- NPC dialogue  
- Mission descriptions  
- Incident content  
- SMS messages  
- URLs shown in scenarios  
- Phone numbers  
- Feedback text  
- Difficulty settings  
- Rewards  
- Learning objectives  
The system may store this content in:  
- TypeScript or JSON configuration files  
- A database  
- A content management interface in a later version  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [32. Expandability Requirements]()  
The architecture shall allow developers to add:  
- New maps  
- New locations  
- New NPCs  
- New missions  
- New incidents  
- New minigames  
- New learning topics  
- New languages  
- New feedback content  
- New research metrics  
A new minigame should be connectable through a shared minigame interface without modifying the core world system extensively.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [33. Minimum Viable Product]()  
The first playable MVP shall include:  
1. One small top-down map  
2. One player character  
3. Basic four-direction movement  
4. One interactive NPC  
5. One mission  
6. One media literacy incident  
7. One existing minigame integrated with the world  
8. Standardized minigame result handling  
9. One visible consequence in the world  
10. Mobile portrait support  
11. Desktop landscape support  
12. Save and resume support  
13. Basic accessibility settings  
14. Basic gameplay logging  
A recommended MVP scenario is:  
- The player starts at home.  
- A neighbor asks for help.  
- The neighbor receives a suspicious delivery SMS.  
- The player opens the fake SMS minigame.  
- The player identifies suspicious warning signs.  
- The game returns to the world.  
- The neighbor reacts according to the result.  
- The mission is completed and saved.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [34. Acceptance Criteria for the MVP]()  
The MVP shall be considered successful when:  
- The game loads inside the existing Next.js application.  
- Phaser runs only on the client side.  
- The player can move around the map.  
- The player can interact with an NPC.  
- The NPC can initiate a media literacy incident.  
- The existing minigame opens without reloading the full application.  
- The top-down world pauses while the minigame is active.  
- The minigame sends a result back to the world.  
- The world resumes at the correct player position.  
- The NPC or mission changes based on the result.  
- Progress remains available after refreshing or reopening the game.  
- The interface remains usable on a portrait mobile screen.  
- The interface remains usable on a landscape desktop screen.  
- Text and controls are readable for older adults.  
- No duplicate game canvas or game loop is created when revisiting the page.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0V2wOEMD+7krTzMFrWdt4TI5eK+CHw6TvfcKAACmsW9rLBERrbX8OwYAgDHvfVY+1+GJAwCYTFbZcAAAs/kAKegOx7/jq28AAAAASUVORK5CYII=)  
# [35. Open Questions for Further Discussion]()  
The following subjects require further design discussion:  
1. Who is the player character?  
2. Is the player an older adult, caregiver, volunteer, or community helper?  
3. What is the main setting of the game?  
4. Is the game structured as one day, several days, chapters, or missions?  
5. What is the main story goal?  
6. Why does the player help other characters?  
7. What makes the player want to continue playing?  
8. What rewards should the player receive?  
9. Should incorrect choices change the story?  
10. How realistic or fictional should scam situations be?  
11. Should the game contain humor?  
12. Should the game use a warm community tone or a more dramatic mystery tone?  
13. Should the player have an in-game smartphone?  
14. Should minigames appear through the smartphone interface?  
15. Should players be able to revisit completed lessons?  
16. How should learning progress be represented?  
17. What should happen when the player repeatedly struggles?  
18. How long should one gameplay session be?  
19. Should the game contain a final mission combining multiple scam types?  
20. Which gameplay data is required for the research evaluation?  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [36. Recommended Development Approach]()  
The project should be developed incrementally.  
## [Phase 1: Technical Prototype]()  
- Embed Phaser inside Next.js  
- Create a responsive top-down map  
- Implement movement and interaction  
- Connect one React minigame through an event system  
## [Phase 2: Vertical Slice]()  
- Add one complete mission  
- Add dialogue  
- Add one NPC  
- Add one incident  
- Add consequences  
- Save progress  
- Test on mobile and desktop  
## [Phase 3: Core Game Systems]()  
- Mission system  
- Incident system  
- NPC system  
- Player state  
- Accessibility settings  
- Research logging  
## [Phase 4: Content Integration]()  
- Integrate all existing minigames  
- Add additional missions  
- Add more locations and NPCs  
- Balance difficulty and feedback  
## [Phase 5: User Testing]()  
- Test with representative older adults  
- Evaluate readability  
- Evaluate controls  
- Evaluate comprehension  
- Evaluate whether the game still feels like an examination  
- Improve the design based on observations and feedback  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAAECAYAAADh/WljAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAATUlEQVR4nO3YsQmAQBBE0T244gwN7OfY7jRT0HrWFszk4L0KfjhMq6oAAGAuPTOtOACAiWzrEj0iYozR/o4BAOCb5zqq3efuiQMAmMwLcaEOzTstkvgAAAAASUVORK5CYII=)  
# [37. Initial Technical Direction]()  
The proposed technical stack is:  
- Next.js  
- React  
- TypeScript  
- Phaser  
- Supabase or the existing backend  
- Progressive Web App support  
- IndexedDB or local storage for temporary local progress  
- Server-side database for authenticated progress  
- Tiled or another compatible map editor  
- Typed event communication between React and Phaser  
The final library versions and implementation details shall be confirmed during technical design.  
