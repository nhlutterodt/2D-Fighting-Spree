# 2D Fighter - Testing Checklist

## Pre-Testing Setup
- [ ] Ensure development server is running (npm start)
- [ ] Open browser to http://localhost:3000 (or alternate port)
- [ ] Open browser console (F12) to check for errors

---

## 1. Application Launch & Initial Rendering

### Landing Screen
- [ ] Page loads without errors
- [ ] "Ascend: Ragdoll Arena" title is visible
- [ ] Description text is readable
- [ ] "Enter" button is visible and styled correctly
- [ ] Two-column layout displays properly on desktop
- [ ] "Included in this Preview" section shows all items
- [ ] "Not Implemented" section shows placeholder items
- [ ] Header shows "2D Fighter – UI Flow Preview"
- [ ] Back button is visible in header

**Expected Result**: Clean, professional landing page with no console errors

---

## 2. Navigation Flow Testing

### Landing → Main Menu
- [ ] Click "Enter" button
- [ ] Smooth transition animation occurs
- [ ] Main Menu screen appears
- [ ] "Main Menu" title is visible
- [ ] Four menu items are displayed: Start, Continue, Load, Options
- [ ] Start button is enabled (not grayed out)
- [ ] Continue, Load, Options are disabled (grayed out)

### Keyboard Navigation in Main Menu
- [ ] Press ↓ arrow key - focus moves to next item
- [ ] Press ↑ arrow key - focus moves to previous item
- [ ] Focus wraps around (from bottom to top and vice versa)
- [ ] Focused item has visual highlight (ring/border)
- [ ] Press Enter on "Start" - navigates to Config screen

### Main Menu → Match Config
- [ ] Click "Start" button
- [ ] Transition animation occurs
- [ ] Match Configuration screen appears
- [ ] All form fields are visible and functional

### Config → Fighter Select
- [ ] Configure match settings
- [ ] Click "Choose Fighters" button
- [ ] Fighter Select screen appears
- [ ] All 6 fighters are displayed

### Fighter Select → Stage Select
- [ ] Select a fighter (click on fighter card)
- [ ] Selected fighter has visual highlight
- [ ] Click "Pick Stage" button
- [ ] Stage Select screen appears
- [ ] All 4 stages are displayed

### Stage Select → Match Preview
- [ ] Select a stage (click on stage card)
- [ ] Selected stage has visual highlight
- [ ] Click "Start Preview" button
- [ ] Match Preview screen with canvas appears

### Back Navigation
- [ ] From Match Preview, click "Exit" - returns to Stage Select
- [ ] From Stage Select, click Back (header) - returns to Fighter Select
- [ ] From Fighter Select, click Back - returns to Config
- [ ] From Config, click Back - returns to Main Menu
- [ ] From Main Menu, click Back - returns to Landing

**Expected Result**: Smooth navigation in both directions with no broken states

---

## 3. Match Configuration Testing

### Form Inputs
- [ ] **Rounds**: Default is 3
- [ ] **Rounds**: Can change value (1-9)
- [ ] **Rounds**: Invalid values are clamped
- [ ] **Time Limit**: Default is 99
- [ ] **Time Limit**: Can change value (30-300)
- [ ] **Time Limit**: Invalid values are clamped
- [ ] **Difficulty**: Default is "Normal"
- [ ] **Difficulty**: Can select Easy, Normal, Hard
- [ ] **Control**: Default is "Keyboard"
- [ ] **Control**: Can select Keyboard, Gamepad, AI

### Validation
- [ ] All inputs accept valid values
- [ ] Invalid values are prevented or corrected
- [ ] Form state persists when navigating back

**Expected Result**: All form controls work correctly with proper validation

---

## 4. Fighter Selection Testing

### Display
- [ ] All 6 fighters are shown in grid layout
- [ ] Each fighter card shows: Name, Style, Speed, Power stats
- [ ] Cards are properly styled with borders

### Interaction
- [ ] Click on Rhea - card highlights
- [ ] Click on Kato - previous selection clears, Kato highlights
- [ ] Click on Miya - selection updates
- [ ] Click on Dax - selection updates
- [ ] Click on Vela - selection updates
- [ ] Click on Iko - selection updates
- [ ] Selected fighter has distinct visual style (border color change)

### Opponent Selection
- [ ] Opponent dropdown shows "NPC" by default
- [ ] Dropdown includes all fighter names
- [ ] Can select different opponent

### Button State
- [ ] "Pick Stage" button is disabled when no fighter selected
- [ ] "Pick Stage" button is enabled after selecting fighter

**Expected Result**: Fighter selection works smoothly with clear visual feedback

---

## 5. Stage Selection Testing

### Display
- [ ] All 4 stages are shown
- [ ] Each stage card shows: Name, Surface type, Friction value
- [ ] Cards are properly styled

### Interaction
- [ ] Click on "Dojo Dusk" - card highlights
- [ ] Click on "Sky Bridge" - selection updates
- [ ] Click on "Bazaar Night" - selection updates
- [ ] Click on "Glacier Gate" - selection updates
- [ ] Selected stage has distinct visual style

### Button State
- [ ] "Start Preview" button is disabled when no stage selected
- [ ] "Start Preview" button is enabled after selecting stage

**Expected Result**: Stage selection works with clear visual feedback

---

## 6. Game Canvas - Core Rendering

### Initial State
- [ ] Canvas renders without errors
- [ ] Background gradient is visible
- [ ] Floor line is visible
- [ ] Player 1 (blue) appears on left side
- [ ] Player 2/NPC (red) appears on right side
- [ ] Both fighters have visible bodies and heads
- [ ] Shadows appear under fighters
- [ ] HUD displays at top (health bars, timer)

### HUD Elements
- [ ] Player 1 health bar (blue) on left
- [ ] Player 1 name and HP value displayed
- [ ] Player 2 health bar (red) on right
- [ ] Player 2 name and HP value displayed
- [ ] Timer displays in center
- [ ] Timer counts down from configured time limit

**Expected Result**: Canvas renders cleanly with all visual elements

---

## 7. Game Canvas - Player Controls

### Movement (Keyboard)
- [ ] Press → (right arrow) - player moves right
- [ ] Press ← (left arrow) - player moves left
- [ ] Release arrow keys - player stops (with friction)
- [ ] Player faces opponent direction

### Jumping
- [ ] Press Space - player jumps
- [ ] Hold Space - full height jump
- [ ] Tap Space quickly - short hop (variable jump height)
- [ ] Press Space in air - double jump works
- [ ] Cannot triple jump

### Advanced Jump Mechanics
- [ ] Walk off platform edge, press Space within ~0.12s - coyote time jump works
- [ ] Press Space just before landing - buffered jump executes on landing

### Dashing
- [ ] Press Shift - player dashes in facing direction
- [ ] Press Shift while holding → - dashes right
- [ ] Press Shift while holding ← - dashes left
- [ ] Dash has cooldown (cannot spam)
- [ ] Dash animation is visible

### Wall Mechanics
- [ ] Move to left wall, hold ← - player slides down slowly
- [ ] While wall sliding, press Space - wall jump away from wall
- [ ] Move to right wall, hold → - player slides down slowly
- [ ] While wall sliding, press Space - wall jump away from wall

### Attack
- [ ] Press Z - player performs jab attack
- [ ] Attack has startup, active, and recovery phases
- [ ] Cannot attack during hitstun
- [ ] Attack cooldown prevents spam

**Expected Result**: All player controls respond correctly with proper game feel

---

## 8. Game Canvas - Physics

### Gravity
- [ ] Player falls when in air
- [ ] Fall speed increases (acceleration)
- [ ] Player lands on floor correctly

### Collision
- [ ] Player cannot go through floor
- [ ] Player cannot go past left boundary
- [ ] Player cannot go past right boundary
- [ ] Player stays within canvas bounds

### Movement Feel
- [ ] Ground movement feels responsive
- [ ] Air movement has appropriate control
- [ ] Friction stops player smoothly
- [ ] Jump arc feels natural

**Expected Result**: Physics feel polished and responsive

---

## 9. Game Canvas - Combat System

### Hitboxes (if debug mode enabled)
- [ ] Attack hitbox appears during active frames (green box)
- [ ] Hurtbox visible around player body (blue box)
- [ ] Hurtbox visible around NPC body (pink box)

### Damage & Knockback
- [ ] Attack NPC - NPC takes damage (HP decreases)
- [ ] Attack NPC - NPC gets knocked back
- [ ] Attack NPC - NPC enters hitstun (cannot act)
- [ ] Attack NPC - Hit spark effect appears
- [ ] NPC attacks player - player takes damage
- [ ] NPC attacks player - player gets knocked back
- [ ] NPC attacks player - player enters hitstun

### Invulnerability
- [ ] After being hit, brief invulnerability period
- [ ] Cannot be hit again during invulnerability
- [ ] Invulnerability expires after ~0.1-0.12 seconds

### Health System
- [ ] Health bars update in real-time
- [ ] Health cannot go below 0
- [ ] HP values display correctly

**Expected Result**: Combat system works with proper hit detection and feedback

---

## 10. Game Canvas - NPC AI

### AI Behavior (Easy Difficulty)
- [ ] NPC moves toward player when far away
- [ ] NPC occasionally jumps
- [ ] NPC sometimes attacks
- [ ] NPC reacts slowly (~0.6s think time)

### AI Behavior (Normal Difficulty)
- [ ] NPC is more aggressive
- [ ] NPC reacts faster (~0.4s think time)
- [ ] NPC attacks more frequently

### AI Behavior (Hard Difficulty)
- [ ] NPC is very aggressive
- [ ] NPC reacts quickly (~0.25s think time)
- [ ] NPC attacks frequently
- [ ] NPC movement is more precise

### AI Physics
- [ ] NPC follows same physics rules as player
- [ ] NPC can jump, fall, and collide properly
- [ ] NPC faces player correctly

**Expected Result**: AI behaves intelligently with difficulty scaling

---

## 11. Game Canvas - Controls & State

### Pause/Resume
- [ ] Click "Pause" button - game freezes
- [ ] Timer stops counting
- [ ] Fighters stop moving
- [ ] Click "Resume" - game continues
- [ ] Timer resumes counting

### Exit
- [ ] Click "Exit" button - returns to Stage Select
- [ ] Game state is reset
- [ ] No memory leaks or lingering effects

### Controls Display
- [ ] Control instructions visible below canvas
- [ ] Instructions are clear and accurate

**Expected Result**: Game controls work correctly

---

## 12. Gamepad Support (if gamepad available)

### Connection
- [ ] Connect gamepad
- [ ] Game detects gamepad automatically

### Controls
- [ ] Left stick X-axis - moves player left/right
- [ ] A button (or Cross) - jump
- [ ] B button (or Circle/X) - dash
- [ ] Y button (or Square) - attack

### Responsiveness
- [ ] Gamepad input feels responsive
- [ ] Dead zone works correctly (no drift)
- [ ] Can mix keyboard and gamepad input

**Expected Result**: Gamepad works as alternative input method

---

## 13. Edge Cases & Error Handling

### Rapid Actions
- [ ] Rapidly click through screens - no crashes
- [ ] Spam attack button - no errors
- [ ] Spam jump button - no infinite jumps
- [ ] Spam dash button - cooldown prevents abuse

### Invalid States
- [ ] Try to proceed without selecting fighter - button disabled
- [ ] Try to proceed without selecting stage - button disabled
- [ ] Navigate back and forth rapidly - state persists correctly

### Window Resize
- [ ] Resize browser window - layout adapts
- [ ] Canvas maintains aspect ratio
- [ ] UI elements remain accessible

### Long Sessions
- [ ] Let timer run to 0 - game continues (no crash)
- [ ] Play for extended time - no memory leaks
- [ ] No performance degradation over time

**Expected Result**: Application handles edge cases gracefully

---

## 14. Console & Performance

### Console Errors
- [ ] No errors in browser console
- [ ] No warnings (except deprecation warnings from dependencies)
- [ ] No failed network requests

### Performance
- [ ] Game runs at smooth 60 FPS
- [ ] No stuttering or lag
- [ ] Animations are smooth
- [ ] Canvas rendering is efficient

### Memory
- [ ] No memory leaks when navigating screens
- [ ] Memory usage stays stable
- [ ] Cleanup happens properly on unmount

**Expected Result**: Clean console and smooth performance

---

## 15. Accessibility

### Keyboard Navigation
- [ ] Can navigate entire app with keyboard only
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Enter/Space activate buttons

### Screen Reader (if available)
- [ ] Button labels are announced
- [ ] Screen transitions are clear
- [ ] Form labels are associated correctly

### Visual
- [ ] Text is readable (good contrast)
- [ ] Interactive elements are clearly identifiable
- [ ] Focus states are visible

**Expected Result**: Application is accessible to all users

---

## Summary Checklist

- [ ] All screens render correctly
- [ ] All navigation works in both directions
- [ ] All form inputs work with validation
- [ ] Fighter selection works with visual feedback
- [ ] Stage selection works with visual feedback
- [ ] Canvas renders all visual elements
- [ ] Player controls work (movement, jump, dash, attack)
- [ ] Physics feel responsive and polished
- [ ] Combat system works (hit detection, damage, knockback)
- [ ] NPC AI behaves intelligently
- [ ] Pause/Resume/Exit controls work
- [ ] Gamepad support works (if available)
- [ ] Edge cases handled gracefully
- [ ] No console errors
- [ ] Performance is smooth
- [ ] Accessibility features work

---

## Bug Report Template

If you find any issues, please report using this format:

**Issue**: [Brief description]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**: [What should happen]
**Actual Behavior**: [What actually happens]
**Console Errors**: [Any errors from console]
**Screenshot**: [If applicable]

---

## Testing Notes

- Test on multiple browsers if possible (Chrome, Firefox, Edge)
- Test on different screen sizes
- Test with different input methods
- Note any performance issues
- Document any unexpected behavior

---

**Tester**: _______________
**Date**: _______________
**Browser**: _______________
**OS**: _______________
**Result**: ☐ Pass ☐ Fail ☐ Pass with Issues
