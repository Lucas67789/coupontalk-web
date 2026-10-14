import sanitizeHtml from 'sanitize-html';

export function sanitizeContent(content: string) {
    return sanitizeHtml(content, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'span', 's', 'u', 'mark'],
        allowedAttributes: {
            '*': ['class', 'style'],
            a: ['href', 'title', 'target', 'rel'],
            img: ['src', 'alt', 'width', 'height', 'loading'],
            td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'],
        },
        allowedSchemes: ['https', 'http', 'mailto'],
        allowProtocolRelative: false,
        allowedStyles: { '*': {
            color: [/^#[\da-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
            'background-color': [/^#[\da-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
            'text-align': [/^(left|right|center|justify)$/],
            'font-size': [/^\d+(px|em|rem|%)$/],
            width: [/^\d+(px|%)$/],
            height: [/^(auto|\d+(px|%))$/],
            'max-height': [/^\d+px$/],
            'min-width': [/^\d+(px|%)?$/],
            'border-radius': [/^\d+px$/],
            'margin-bottom': [/^\d+(px|em|rem)$/],
            'object-fit': [/^(cover|contain)$/],
            overflow: [/^hidden$/],
            flex: [/^\d+$/],
            display: [/^(flex|block|inline-block)$/],
            gap: [/^\d+px$/],
        } },
        transformTags: {
            h1: 'h2',
            a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer sponsored' }),
        },
    });
}

export function jsonLd(value: unknown) {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}
