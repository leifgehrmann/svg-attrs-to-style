/* jshint quotmark: false */
'use strict';

exports.type = 'perItem';

exports.active = true;

exports.description = 'convert presentation attributes to style properties';

const stylingProps = require('./_collections').attrsGroups.presentation,
    rEscape = '\\\\(?:[0-9a-f]{1,6}\\s?|\\r\\n|.)',                 // Like \" or \2051. Code points consume one space.
    rAttr = '\\s*(' + g('[^:;\\\\]', rEscape) + '*?)\\s*',          // attribute name like ‘fill’
    rSingleQuotes = "'(?:[^'\\n\\r\\\\]|" + rEscape + ")*?(?:'|$)", // string in single quotes: 'smth'
    rQuotes = '"(?:[^"\\n\\r\\\\]|' + rEscape + ')*?(?:"|$)',       // string in double quotes: "smth"

    // Parentheses, E.g.: url(data:image/png;base64,iVBO...).
    // ':' and ';' inside of it should be threated as is. (Just like in strings.)
    rParenthesis = '\\(' + g('[^\'"()\\\\]+', rEscape, rSingleQuotes, rQuotes) + '*?' + '\\)',

    // The value. It can have strings and parentheses (see above). Fallbacks to anything in case of unexpected input.
    rValue = '\\s*(' + g('[^!\'"();\\\\]+?', rEscape, rSingleQuotes, rQuotes, rParenthesis, '[^;]*?') + '*?' + ')',

    // End of declaration. Spaces outside of capturing groups help to do natural trimming.
    rDeclEnd = '\\s*(?:;\\s*|$)',

    // Important rule
    rImportant = '(\\s*!important(?![-(\w]))?',

    // Final RegExp to parse CSS declarations.
    regDeclarationBlock = new RegExp(rAttr + ':' + rValue + rImportant + rDeclEnd, 'ig'),

    // Comments expression. Honors escape sequences and strings.
    regStripComments = new RegExp(g(rEscape, rSingleQuotes, rQuotes, '/\\*[^]*?\\*/'), 'ig');

/**
 * Convert presentation attributes to style properties.
 *
 * @example
 * <g fill="#000" color="#fff">
 *             ⬇
 * <g style="fill:#000;color:#fff;">
 *
 * @example
 * <g fill="#000" color="#fff" style="-webkit-blah: blah">
 *             ⬇
 * <g style="fill:#000;color:#fff;-webkit-blah: blah">
 *
 * @param {Object} item current iteration item
 * @return {Boolean} if false, item will be filtered out
 *
 * @author Leif Gehrmann
 * 
 * Based off of convertStyleToAttrs.js
 */
exports.fn = function(item) {
    /* jshint boss: true */

    if (!item.elem) {
        return
    }

    let existingStyleValue = ''
    if (item.hasAttr('style')) {
        existingStyleValue = item.attr('style').value
    } 
    const existingStyleKeyValue = parseStyleAsStyleKeyValue(existingStyleValue)
    let newStyleValueArray = []

    // Check if the item has one of the styling properties
    stylingProps.forEach(function(stylingProp) {
        // Check if item has the property
        if (!item.hasAttr(stylingProp)) {
            return
        }

        // Get the attribute value
        const stylingPropValue = item.attr(stylingProp).value

        // Remove the attribute from the item
        item.removeAttr(stylingProp);

        // Check if style attribute already exists
        if (existingStyleKeyValue.hasOwnProperty(stylingProp)) {
            item.removeAttr(stylingProp);
            return
        }

        // Add the attribute to the list of new styles
        newStyleValueArray.push(`${stylingProp}:${stylingPropValue}`)

        // Remove the attribute
        item.removeAttr(stylingProp);
    });

    // Don't modify element if we found no new styling properties
    if (newStyleValueArray.length === 0) {
        return
    }

    // Add existing style to new style value array
    if (existingStyleValue.length !== 0) {
        newStyleValueArray.push(existingStyleValue)
    }

    // Add style attribute if style doesn't exist
    if (!item.hasAttr('style')) {
        item.addAttr({
            name: 'style',
            local: 'style',
            prefix: ''
        })
    }

    // Write style attribute
    item.attr('style').value = newStyleValueArray.join(';')
};

/**
 * @param {string} style
 * 
 * @returns {Object.<string, string>}
 */
function parseStyleAsStyleKeyValue(style) {
    const styleKeyValue = {}

    // Strip CSS comments preserving escape sequences and strings.
    style = style.replace(regStripComments, function(match) {
        return match[0] == '/' ? '' :
            match[0] == '\\' && /[-g-z]/i.test(match[1]) ? match[1] : match
    });

    // Extract declaration blocks
    regDeclarationBlock.lastIndex = 0
    for (let rule; rule = regDeclarationBlock.exec(style);) {
        styleKeyValue[rule[1]] = rule[2]
    }

    return styleKeyValue
}

function g() {
    return '(?:' + Array.prototype.join.call(arguments, '|') + ')';
}
