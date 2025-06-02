type PageProps = {
  params: { product_category: string }
};


export default function Page({params}:PageProps) {
  return (
    <div>Hello, I am {params.product_category}</div>
  )
}

