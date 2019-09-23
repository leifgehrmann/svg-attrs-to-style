# svg-attrs-to-style

An [SVGO] plugin that converts presentation attributes to inline-style
properties.

```
<g fill="#000" color="#fff" style="-webkit-blah: blah">
             ⬇
<g style="fill:#000;color:#fff;-webkit-blah: blah">
```

[SVGO]: https://github.com/svg/svgo

## Why?

This is a tool to work around [a bug in the Inkscape beta]. In
Inkscape, if one runs "Stroke to Path" on an object, in certain peculiar edge
cases, the stroke colors are not transferred if the color is specified by the
`stroke` attribute. A workaround is to use the inline `style` attribute
instead.

But there of course may be other useful applications for this!

Note: This plugin will not work well if one uses `<style>` elements in the SVG,
as the inline `style` attribute will override it.

[a bug in the Inkscape beta]: https://gitlab.com/inkscape/inbox/issues/910

## Installation/Usage

### If SVGO is already installed

Just drag and drop `convertAttrsToStyle.js` into the plugins directory of
SVGO.

### For development

1. Clone this repository
2. Install Node.js (See [Installing Node.js via package manager][install-node])
3. Run
    ```
    make install_locally
    ```
4. Copy the plugin into SVGO's plugin directory
    ```
    cp plugins/convertAttrsToStyle.js svgo/plugins/
    ```

[install-node]: https://nodejs.org/en/download/package-manager/

## Testing

```
make test
```
