# Pomodoro Tracker

This app generates a timer that by default assigns a 25-minute window to working time and a 5-minute window for resting time. The user can toggle the length of each of these windows using the arrows on other side of the respective areas. Once the working period is over, the theme of the page shifts from blue to green and the rest period begins. After the end of the rest period, the app shifts back to the working theme.

This app follows the principles of the Pomodoro technique, where the practitioner will practice working and resting in 25 and 5 minute windows to improve concentration and mitigate burnout. 

## Alerts

If the user attempts to increase or decrease either time window outside of the [1,60] range, a blue alert window appears notifying them of the valid range.

If the user attempts to change the timer's settings while the timer is running, a yellow alert will appear to instruct them the clock must be stopped before the time can be changed.

## Known Issues

While tabbed out, it appears that the timer slows / stops. This is due to the browser de-prioritizing the app while it is out of focus. In the next build this will be fixed with the Date() object.

Currently the completion percentage of the progress bar is inaccurate at the start of the timer and becomes more accurate as the timer fills out. This is believed to be an issue with the dasharray offset, and alternatives are being explored to create a more accurate progress bar.
