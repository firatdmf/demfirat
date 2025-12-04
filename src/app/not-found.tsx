// "use client";
// import { notFound } from "next/navigation"
// // export default function NotFound
// export default function NotFound({params}:any){
//     return notFound()
// }

export default function NotFound() {
  // return <p>NoT Found</p>;

  return (
    <html>
      <body className="text-center">
        <p className="m-10 font-semibold">Not Found</p>
      </body>
    </html>
  );
}
