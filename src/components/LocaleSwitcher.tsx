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
    const nextLocale = e.target.value;
    const currentPath = window.location.pathname;

    const segments = currentPath.split("/");
    const hasLocale = ["en", "ru", "pl", "tr"].includes(segments[1]);
    const updatedPath = hasLocale
      ? currentPath.replace(`/${segments[1]}`, `/${nextLocale}`)
      : `/${nextLocale}${currentPath}`;

    startTransition(() => {
      router.push(updatedPath);
    });
  };
  return (
    <label className="border-2 rounded">
      <p className="sr-only">Change Language</p>
      <select
        defaultValue={localActive || "en"}
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
