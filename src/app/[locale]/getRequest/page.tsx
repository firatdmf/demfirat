"use client";
import { useEffect, useState } from 'react';
// interface data{}
interface FabricData {
    name: string;
    // Add other properties if your response data has more fields
    collection:string,
    data:any,
    // jsonarray:object[],
  }
export default function Example2() {
    const [data, setData] = useState<FabricData | null>(null);
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('/api/get_products'); // Call your API route
          if (response.ok) {
            console.log('response was okay');
            
            const result = await response.json();
            console.log(result);
            
            setData(result);
          } else {
            console.error('Error fetching data:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }, []);
    if (!data){
        return <div>...Loading</div>
    }else{
        return <div>{data.data}</div>
    }
    
}
