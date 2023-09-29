# pwon8301_9103_tut4


# Wk 8 Quiz
## Part 1: Imaging Technique

The inspiration 'Square Fill' comes from the Happycoding website. 

This is an animation idea which can be adapted where certain defined shapes can be gradually filled in with colour iteratively at different sizes. For example at a set colour and starting from small to progressively larger sizes, this can give the illusion of a shaped light pulsing or flickering on and off. In addition, with the manipulation of speed it can simulate how fast the light is pulsing.   

See below for chosen screenshots from the HappyCoding animation example to represent the idea of a square green light gradually coming on. 

![greenlight small](assets/greenlight_small.png)

![greenlight medium](assets/greenlight_medium.png)

![greenlight large](assets/greenlight_large.png)



## Part 2: Coding Technique

The inspiration is to use the p5.sound library to track the amplitudes of a sound file by frequency bands - Low, Mid, and High. 

Using shapes to represent the bands and p5.FFT, we can visualize the amount of energy/volume within these bands by having the shapes pulse in size accordingly with the sound.  

Similarly, this snippet example from Codeacademy uses p5.Amplitude to track overall amplitude of a sound file as it plays and uses a circle to represent it by changes in size. 

![Codeacademy code snippet](assets/Codecademy_Level_via_circle.png)

The map function allows for mapping the minimum and maximum amplitudes to shape size limits. 

See in action, skip to the 25-minute mark ![pulsing circle](https://codecademy.com/resources/videos/creative-coding-with-p5-js/audio-visualizations-with-p5-sound-js Links to external site.)

Full code where the inspiring snippet originated ![reference code] (https://editor.p5js.org/js6450/sketches/_J6BWk8lP)  



