import Link from 'next/link';
import data from '@/lib/related-stores.json';

export default function RelatedStores({ storeId }: { storeId: string }) {
    const group = data.groups.find(g => (g[2] as string[]).includes(storeId));
    if (!group) return null;
    const [title, description, members] = group as [string, string, string[]];
    const index = members.indexOf(storeId);
    const ids = [...members.slice(index + 1), ...members.slice(0, index)].slice(0, 4);
    const names = data.names as Record<string, string>;
    return <section className="border-t border-gray-200 px-5 py-8 md:px-8" aria-label="관련 구매·이용 가이드">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-gray-600">{description}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">{ids.map(id => <li key={id}>
            <Link className="block rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 font-semibold text-blue-800 hover:underline" href={`/store/${encodeURIComponent(id)}`}>{names[id]} 이용 안내 →</Link>
        </li>)}</ul>
    </section>;
}
