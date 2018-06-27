# angular-busyclick
Easily add busy state to buttons or other components in your Angular app without manually wiring anything up.

## Details
This package provides the 'busy-click' directive, which is used exactly the same as the built in Angular ng-click.
The busy-click directive adds one extra feature: if the expression in the attribute evaluates to a promise then the
element will get class 'busy' applied to it until the promise resolves.

## Usage
Use the `busy-click` directive instead of the `ng-click` directive to automatically add the class `busy` to your element on click.

```html
<button busy-click="vm.asynchronousOperation()">Click Me</button>
```

Where `vm.asynchronousOperation()` is a function that returns a promise. The `busy` class will automatically be applied to the button on click, and automatically removed when the promise fulfills. No extra wiring required!

## Examples

Live example here: http://plnkr.co/xKxOoH
