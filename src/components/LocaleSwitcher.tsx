"use client";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/router";
import { ChangeEvent, useTransition } from "react";
import { useLocale } from "next-intl";
export default function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localActive = useLocale();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    // console.log(e.target.value);
    const nextLocale = e.target.value;
    const currentPath = window.location.pathname;

    let updatedPath: string;
    if (localActive === "en") {
      // If current locale does not show on the url, prepend the new locale to the path
      updatedPath = currentPath.replace(`/`, `/${nextLocale}/`);
    } else {
      const currentLocale = currentPath.split("/")[1]; // Extract current locale from path
      updatedPath = currentPath.replace(`/${currentLocale}`, `/${nextLocale}`);
    }
    startTransition(() => {
      // router.replace(`/${nextLocale}`)
      router.push(updatedPath);
    });
  };
  return (
    // <div>Hello</div>
    <label className="border-2 rounded">
      <p className="sr-only">Change Language</p>
      <select
        defaultValue={localActive}
        className="bg-transparent"
        onChange={onSelectChange}
        disabled={isPending}
      >
        <option value="en">English</option>
        <option value="ru">Русский</option>
        <option value="pl">Polski</option>
        <option value="tr">Türkçe</option>
      </select>
    </label>
  );
}
