export function xmlText(value: string) {
    return value.replace(/[<>&"']/g, c => ({'<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;'}[c]!));
}
export function cdata(value: string) {
    return '<![CDATA[' + value.replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>';
}
