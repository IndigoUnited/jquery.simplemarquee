# jquery.simplemarquee

A jQuery plugin that aims to provide a scrolling marquee similar to the good old `winamp` player.   
The main goal of this plugin is simplicity, so it has very little options but it works nicely.


## Why?

I've tried [jQuery.Marquee](https://github.com/aamirafridi/jQuery.Marquee) which provides similar functionality but:

- It has unnecessary cruft to support older browsers
- Does not use `transform: translate(x,y)` when moving text, causing unnecessary reflows
- Has some bugs, the most important [one](https://github.com/aamirafridi/jQuery.Marquee/issues/41) leaks `<style>` tags because they are not removed on destruction

So I've decided to implement my own since it was an easy task anyway.


## Demo

Check out the [demo](http://indigounited.github.io/jquery.simplemarquee/test/demo.html)

This same demo is available in the `test/demo.html` file.


## API

### .simplemarquee([options])

Setups the marquee with the given `options`.   
Once initialized, you can't change the options.

Available `options`:

- `speed`: The speed in pixels per second, defaults to `100`.
- `direction`: The direction, defaults to `left` (available: `left`, `right`, `top` and `bottom`)
- `cycles`: Number of cycles before pausing, defaults to `1` (pass `Infinity` to cycle continously)
- `space`: The space in px between the duplicated contents, defaults to `40`
- `delayBetweenCycles`: The delay between each cycle in ms, defaults to `2000`
- `handleHover`: Pause/restart on hover, defaults to `true`
- `handleResize`: Update marquee on resize, defaults to `true`

```js
$('.some-el').simplemarquee();
```


### .simplemarquee('update')

Updates the marquee, including calculations made.

```js
$('.some-el').simplemarquee('update');
```


### .simplemarquee('pause')

Pauses the marquee.   
Emits a `pause` event.

```js
$('.some-el').simplemarquee('pause');
```

### .simplemarquee('resume')

Resumes the marquee.   
Emits a `resume` event.

```js
$('.some-el').simplemarquee('pause');
```

### .simplemarquee('toggle')

Toggle between the pause/resume methods.

```js
$('.some-el').simplemarquee('toggle');
```

### .simplemarquee('destroy')

Destroy marquee, releasing all events and leaving the element just like it was before.   

```js
$('.some-el').simplemarquee('destroy');
```


### Events

- `cycle` - Fired after finishing each cycle
- `finish` - Fired when all cycles are done
- `pause` - Fired when paused
- `resume` - Fired when resumed


## How to use

Simply include the `jquery.simplemarquee.js` file after jQuery is loaded.   
This plugin also integrates with `AMD` (no shim required) and `CommonJS`.

This plugin makes use of CSS `transforms`, so it's usage is limited to `IE >= 10`.


## Tests

No tests yet :(
