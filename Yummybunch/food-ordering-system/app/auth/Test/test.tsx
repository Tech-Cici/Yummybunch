import {UseState, Useffect } from "react";

function test( () => {
 const [testOrders, setOrders] = useState([]);
 
 Useffect (() => {
    const fetchOrders = async () => {
      try {
         const response = await fetch("http://localhost:8080/api/test");
         if (!response.ok) {
            throw new Error("Failed to fetch orders");
         }
         const data = await response.json();
         setOrders(data);
      } catch (error) {
         console.error("Error fetching orders:", error);
      }
    
 });
    fetchOrders();
     },
}) [];
 
 return (
   <div>
     <h1>Test Orders</h1>
     <ul>
       {testOrders.map((order) => (
         <li key={order.id}>{order.name}</li>
       ))}
     </ul>
   </div>
 );
}


