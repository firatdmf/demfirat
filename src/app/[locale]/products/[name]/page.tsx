import {FC} from 'react'
interface pageProps {
  params:{name:string}
}

const page: FC<pageProps> = ({params})=>{
  return <p>Other names are: {params.name}</p>
}

export default page