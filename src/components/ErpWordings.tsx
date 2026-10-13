'use client';

import { setErpWordings, type ErpWordings as Wordings } from '@/lib/translate';

/** Hands the ERP's catalog wordings, fetched by the layout, to the
 *  translate helper before anything below it renders — on the server and
 *  again in the browser, so both print the same text. Renders nothing. */
export default function ErpWordings({ data }: { data: Wordings | null }) {
    setErpWordings(data);
    return null;
}
